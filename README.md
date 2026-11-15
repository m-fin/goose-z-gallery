# Goose Z

A gallery for [Goose Z](https://m-fin.github.io/goose-z-gallery/), Matthew Finley’s illustrated natural history of the goose: the bird, the flock, and the curve we borrowed.

The site is static HTML, CSS, and JavaScript. It is ready for GitHub Pages. Plates and contact sheets use several widths in WebP and JPEG, with `srcset` and lazy loading, so a phone does not download the lightbox file.

## Preview locally

From this directory:

```bash
python3 -m http.server 8080
```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080). Paths are relative, so the same files work at the root of a local server and at `/goose-z-gallery/` on GitHub Pages.

## Publish on GitHub Pages

1. In the repository settings, open **Pages**.
2. Set the source to **GitHub Actions**.
3. Merge to `main`.

[`.github/workflows/pages.yml`](.github/workflows/pages.yml) publishes the gallery, the fonts, and the responsive images. It leaves the print masters in `assets/` off the deployed site. The live address is `https://m-fin.github.io/goose-z-gallery/`.

Serving the `main` branch from `/` also works, because `index.html` is at the repository root. Use one source, not both.

## Pictures

`assets/` holds the print masters. `python3 scripts/optimize_images.py` writes `images/<name>-<width>.jpg` and `.webp` at 640, 960, 1280, and up to 2000 pixels wide. Regenerate after replacing a master. Pillow is listed in `requirements.txt`.

The masters were checked for location metadata. They contain a JFIF header and the compressed image, and no EXIF, XMP, or GPS IFD. A few files happen to contain the letters “gps” inside compressed image data; that is not a geotag. Derivatives are encoded without metadata. If a future master does carry EXIF or XMP location data, the optimizer removes those segments from the master before resizing, without recompressing the scan.

## License

The site code is under the MIT License, copyright 2026 Matthew Finley. See [LICENSE](LICENSE).

The photographs, illustrations, page spreads, contact sheets, captions, and other book content are not covered by that license. They are copyright 2026 Matthew Finley. All rights reserved.

Cormorant Garamond is bundled under the SIL Open Font License. See `fonts/OFL-Cormorant.txt`.
