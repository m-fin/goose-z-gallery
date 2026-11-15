"""The published gallery has to be a static, responsive, rights-clear site."""

import re
import unittest
from html.parser import HTMLParser
from pathlib import Path

from scripts.image_metadata import location_findings

ROOT = Path(__file__).resolve().parents[1]


class _Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids: list[str] = []
        self.images: list[dict] = []
        self.links: list[str] = []
        self.sources: list[dict] = []
        self.scripts: list[str] = []
        self.stylesheets: list[str] = []
        self.title = ""
        self._in_title = False
        self.text_parts: list[str] = []

    def handle_starttag(self, tag, attrs):
        attr = dict(attrs)
        if attr.get("id"):
            self.ids.append(attr["id"])
        if tag == "img":
            self.images.append(attr)
        elif tag == "source":
            self.sources.append(attr)
        elif tag == "a":
            self.links.append(attr.get("href", ""))
        elif tag == "script" and attr.get("src"):
            self.scripts.append(attr["src"])
        elif tag == "link" and attr.get("rel") == "stylesheet":
            self.stylesheets.append(attr.get("href", ""))
        elif tag == "title":
            self._in_title = True

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        self.text_parts.append(data)


def _read(name: str) -> str:
    return (ROOT / name).read_text(encoding="utf-8")


def _page() -> _Page:
    parser = _Page()
    parser.feed(_read("index.html"))
    return parser


class SiteContractTests(unittest.TestCase):
    def test_license_splits_code_from_the_book(self):
        license_text = _read("LICENSE")
        self.assertIn("MIT License", license_text)
        self.assertIn("Copyright (c) 2026 Matthew Finley", license_text)
        self.assertIn("All rights reserved", license_text)
        lowered = license_text.lower()
        self.assertIn("photograph", lowered)
        self.assertIn("book", lowered)
        self.assertIn("not covered by the mit license", lowered)

    def test_readme_explains_preview_pages_and_rights(self):
        readme = _read("README.md").lower()
        self.assertIn("github pages", readme)
        self.assertIn("matthew finley", readme)
        self.assertIn("all rights reserved", readme)
        self.assertIn("lazy", readme)
        self.assertIn("python3 -m http.server", readme)

    def test_pages_deploy_files_exist(self):
        for relative in (
            "index.html",
            "404.html",
            "favicon.svg",
            ".nojekyll",
            "css/styles.css",
            "js/gallery.js",
            ".github/workflows/pages.yml",
        ):
            self.assertTrue((ROOT / relative).is_file(), relative)
        workflow = _read(".github/workflows/pages.yml")
        self.assertIn("actions/deploy-pages", workflow)
        self.assertIn("actions/upload-pages-artifact", workflow)

    def test_gallery_is_navigable_without_a_build(self):
        page = _page()
        self.assertIn("Goose Z", page.title)
        self.assertIn("Matthew Finley", page.title)
        for section in ("book", "plates", "sheets", "colophon"):
            self.assertIn(section, page.ids)
            self.assertIn(f"#{section}", page.links)
        self.assertIn("css/styles.css", page.stylesheets)
        self.assertIn("js/gallery.js", page.scripts)
        self.assertIn("Skip to content", "".join(page.text_parts))

    def test_images_declare_size_and_lazy_load(self):
        page = _page()
        self.assertGreaterEqual(len(page.images), 10)
        eager = [img for img in page.images if img.get("loading") == "eager"]
        lazy = [img for img in page.images if img.get("loading") == "lazy"]
        self.assertEqual(len(eager), 1)
        self.assertEqual(eager[0].get("fetchpriority"), "high")
        self.assertEqual(len(lazy), len(page.images) - 1)
        for img in page.images:
            self.assertTrue(img.get("alt"), img)
            self.assertTrue(img.get("width"), img)
            self.assertTrue(img.get("height"), img)
            self.assertEqual(img.get("decoding"), "async")
            self.assertIn("srcset", img)
        for source in page.sources:
            self.assertEqual(source.get("type"), "image/webp")
            self.assertIn("srcset", source)

    def test_referenced_derivatives_exist_and_have_no_location_metadata(self):
        page = _page()
        urls = []
        for img in page.images:
            urls.extend(_srcset_urls(img["srcset"]))
            urls.append(img["src"])
        for source in page.sources:
            urls.extend(_srcset_urls(source["srcset"]))
        self.assertGreaterEqual(len(set(urls)), 12)
        for url in urls:
            path = ROOT / url
            self.assertTrue(path.is_file(), url)
            if path.suffix.lower() in {".jpg", ".jpeg"}:
                self.assertFalse(location_findings(path.read_bytes()), url)

    def test_stylesheet_is_responsive(self):
        css = _read("css/styles.css")
        self.assertIn("@media", css)
        self.assertIn("prefers-reduced-motion", css)
        self.assertRegex(css, r"minmax\(|clamp\(")

    def test_lightbox_supports_keyboard_navigation(self):
        script = _read("js/gallery.js")
        self.assertIn("showModal", script)
        self.assertIn("ArrowRight", script)
        self.assertIn("ArrowLeft", script)
        self.assertIn("loading", script)


def _srcset_urls(value: str) -> list[str]:
    urls = []
    for part in value.split(","):
        token = part.strip().split()[0]
        if token:
            urls.append(token)
    return urls


if __name__ == "__main__":
    unittest.main()
