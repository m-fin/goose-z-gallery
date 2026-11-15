"""Build metadata-free responsive JPEG and WebP derivatives for the gallery.

Masters live in assets/. This writes images/<stem>-<width>.jpg and .webp.
If a master ever contains EXIF or XMP location data, that metadata is removed
from the master before the derivatives are encoded. The compressed scan is
copied unchanged, so stripping does not recompress the original.

Usage: python3 scripts/optimize_images.py
"""

from __future__ import annotations

import io
import sys
from pathlib import Path

from PIL import Image

from image_metadata import location_findings, strip_metadata

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
OUTPUT = ROOT / "images"
WIDTHS = (640, 960, 1280, 2000)
JPEG_QUALITY = 82
WEBP_QUALITY = 80


def derivative_widths(original: int) -> list[int]:
    widths = [width for width in WIDTHS if width < original]
    cap = min(original, WIDTHS[-1])
    if cap not in widths:
        widths.append(cap)
    return widths


def encode(image: Image.Image, width: int) -> Image.Image:
    if width == image.width:
        return image
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.Resampling.LANCZOS)


def main() -> int:
    OUTPUT.mkdir(exist_ok=True)
    masters = sorted(ASSETS.glob("*.jpg"))
    if not masters:
        print("No masters in assets/", file=sys.stderr)
        return 1

    for path in masters:
        raw = path.read_bytes()
        findings = location_findings(raw)
        if findings:
            cleaned = strip_metadata(raw)
            path.write_bytes(cleaned)
            raw = cleaned
            print(f"stripped {path.name}: {', '.join(findings)}")
        else:
            print(f"no location metadata in {path.name}")

        with Image.open(io.BytesIO(raw)) as image:
            image.load()
            frame = image.convert("RGB")
            for width in derivative_widths(frame.width):
                resized = encode(frame, width)
                stem = f"{path.stem}-{width}"
                jpeg_path = OUTPUT / f"{stem}.jpg"
                webp_path = OUTPUT / f"{stem}.webp"
                resized.save(
                    jpeg_path,
                    format="JPEG",
                    quality=JPEG_QUALITY,
                    optimize=True,
                    progressive=True,
                )
                resized.save(webp_path, format="WEBP", quality=WEBP_QUALITY, method=6)
                print(
                    f"  {stem}  {resized.width}x{resized.height}"
                    f"  jpg {jpeg_path.stat().st_size // 1024}KB"
                    f"  webp {webp_path.stat().st_size // 1024}KB"
                )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
