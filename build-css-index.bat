@echo off
echo Building homepage-only Tailwind CSS (subset)...
tools\tailwindcss.exe -i css\tailwind-input.css -o css\tailwind-index.css --minify -c js\tailwind.config.index.js
echo Done! tailwind-index.css is the homepage subset (~60KB vs 295KB site-wide).
echo Run build-css.bat to rebuild the full site-wide tailwind-output.css for other pages.
