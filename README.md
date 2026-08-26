# Scannera — website

Marketing site for [Scannera](https://play.google.com/store/apps/details?id=com.craftingapps.scannera),
a privacy-first document scanner, PDF editor and QR toolkit for Android.

Served by GitHub Pages from `/docs` on `main`.

## Local preview

```bash
python3 -m http.server 4173 --directory docs
```

Then open <http://localhost:4173>.

The site is a single self-contained `docs/index.html` — no build step and no
dependencies beyond Google Fonts. Screenshots in `docs/assets/screenshots/`
come from the app's fastlane store metadata.
