"""Detect and remove location metadata from JPEG files without recompressing."""

from __future__ import annotations

import io

from PIL import Image

# GPS IFD pointer, stored in the EXIF 0th IFD.
_GPS_IFD = 0x8825
# APP1 holds EXIF and XMP. APP13 holds Photoshop IPTC, which can carry a location.
_METADATA_MARKERS = {0xE1, 0xED}
_GPS_TEXT = (b"gpslatitude", b"gpslongitude", b"exif:gps")


def location_findings(data: bytes) -> list[str]:
    """Return labels for location metadata stored in JPEG headers.

    Bytes inside the compressed scan are ignored. A coincidence such as the
    letters "gps" in entropy-coded image data is not a geotag.
    """
    if not data.startswith(b"\xff\xd8"):
        return []

    found: list[str] = []
    try:
        with Image.open(io.BytesIO(data)) as image:
            exif = image.getexif()
            gps = exif.get_ifd(_GPS_IFD) if exif else {}
            if gps:
                found.append("EXIF GPS IFD")
    except (OSError, ValueError):
        pass

    for marker, payload in _app_payloads(data):
        if marker not in _METADATA_MARKERS:
            continue
        lowered = payload.lower()
        if not any(token in lowered for token in _GPS_TEXT):
            continue
        label = "XMP GPS" if b"xmp" in lowered or b"adobe.com/xap" in lowered else "metadata GPS text"
        if label not in found:
            found.append(label)
    return found


def strip_metadata(data: bytes) -> bytes:
    """Return JPEG bytes with EXIF, XMP, and IPTC segments removed.

    The compressed image scan is copied unchanged, so pixels stay the same.
    """
    if not data.startswith(b"\xff\xd8"):
        raise ValueError("expected JPEG data")
    segments, tail = _split_jpeg(data)
    kept = [blob for marker, blob in segments if marker not in _METADATA_MARKERS]
    return b"\xff\xd8" + b"".join(kept) + tail


def _app_payloads(data: bytes):
    segments, _tail = _split_jpeg(data)
    for marker, blob in segments:
        if len(blob) >= 4:
            yield marker, blob[4:]


def _split_jpeg(data: bytes) -> tuple[list[tuple[int, bytes]], bytes]:
    if data[:2] != b"\xff\xd8":
        raise ValueError("expected JPEG data")

    segments: list[tuple[int, bytes]] = []
    index = 2
    length = len(data)
    while index < length - 1:
        if data[index] != 0xFF:
            raise ValueError("malformed JPEG marker")
        while index < length and data[index] == 0xFF:
            index += 1
        if index >= length:
            break
        marker = data[index]
        marker_at = index - 1
        index += 1

        if marker == 0xDA:  # start of scan; the rest is image data through EOI
            return segments, data[marker_at:]
        if marker == 0xD9:
            return segments, data[marker_at:]
        # Standalone markers have no length field.
        if marker == 0x01 or 0xD0 <= marker <= 0xD7:
            segments.append((marker, data[marker_at:index]))
            continue
        if index + 2 > length:
            raise ValueError("truncated JPEG segment")
        segment_length = int.from_bytes(data[index : index + 2], "big")
        if segment_length < 2 or index + segment_length > length:
            raise ValueError("truncated JPEG segment")
        end = index + segment_length
        segments.append((marker, data[marker_at:end]))
        index = end

    raise ValueError("JPEG ended before the image scan")
