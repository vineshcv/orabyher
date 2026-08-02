#!/bin/sh
# Rebuild production bundles after editing source JS/CSS/HTML.
set -e
cd "$(dirname "$0")"
npx tailwindcss -i ./tailwind.input.css -o ./tailwind.gen.css --minify
python3 build-bundle.py
python3 build-css.py
echo "Done: app.js + site.css"
