"""Location metadata must be detectable and removable without touching pixels."""

import io
import unittest
from pathlib import Path

import piexif
from PIL import Image

from scripts.image_metadata import location_findings, strip_metadata

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"


def _jpeg_with_gps() -> bytes:
    image = Image.new("RGB", (48, 32), (180, 160, 120))
    drawn = image.load()
    for x in range(48):
        drawn[x, 10] = (40, 30, 20)
    exif = {
        "0th": {piexif.ImageIFD.Make: b"Test Camera"},
        "GPS": {
            piexif.GPSIFD.GPSLatitudeRef: b"N",
            piexif.GPSIFD.GPSLatitude: ((37, 1), (48, 1), (1234, 100)),
            piexif.GPSIFD.GPSLongitudeRef: b"W",
            piexif.GPSIFD.GPSLongitude: ((122, 1), (16, 1), (5000, 100)),
        },
    }
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=90, exif=piexif.dump(exif))
    return buffer.getvalue()


def _jpeg_with_xmp_gps() -> bytes:
    image = Image.new("RGB", (24, 24), (200, 190, 170))
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=90)
    payload = (
        b"http://ns.adobe.com/xap/1.0/\x00"
        b'<?xpacket begin="\xef\xbb\xbf" id="W5M0MpCehiHzreSzNTczkc9d"?>'
        b'<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">'
        b'<rdf:Description rdf:about="" xmlns:exif="http://ns.adobe.com/exif/1.0/">'
        b"<exif:GPSLatitude>37,48.20N</exif:GPSLatitude>"
        b"<exif:GPSLongitude>122,16.50W</exif:GPSLongitude>"
        b"</rdf:Description></rdf:RDF></x:xmpmeta>"
    )
    marker = b"\xff\xe1" + (len(payload) + 2).to_bytes(2, "big") + payload
    raw = buffer.getvalue()
    return raw[:2] + marker + raw[2:]


class LocationMetadataTests(unittest.TestCase):
    def test_gps_exif_is_found_and_stripped(self):
        raw = _jpeg_with_gps()
        self.assertTrue(location_findings(raw))

        cleaned = strip_metadata(raw)
        self.assertFalse(location_findings(cleaned))
        self.assertNotIn(b"GPSLatitude", cleaned)
        self.assertNotIn(b"Test Camera", cleaned)

        original = Image.open(io.BytesIO(raw))
        result = Image.open(io.BytesIO(cleaned))
        self.assertEqual(result.size, original.size)
        self.assertEqual(result.getpixel((0, 0)), original.getpixel((0, 0)))

    def test_xmp_gps_packet_is_found_and_stripped(self):
        raw = _jpeg_with_xmp_gps()
        findings = location_findings(raw)
        self.assertTrue(any("GPS" in item or "gps" in item.lower() for item in findings))

        cleaned = strip_metadata(raw)
        self.assertFalse(location_findings(cleaned))
        self.assertNotIn(b"GPSLatitude", cleaned)
        self.assertNotIn(b"xmpmeta", cleaned.lower())

    def test_entropy_bytes_are_not_treated_as_location(self):
        """Compressed image data may contain the letters gps. That is not a geotag."""
        contact = (ASSETS / "contact-05.jpg").read_bytes()
        self.assertIn(b"gps", contact.lower())
        self.assertFalse(location_findings(contact))

    def test_published_masters_have_no_location_metadata(self):
        for path in sorted(ASSETS.glob("*.jpg")):
            self.assertFalse(location_findings(path.read_bytes()), path.name)


if __name__ == "__main__":
    unittest.main()
