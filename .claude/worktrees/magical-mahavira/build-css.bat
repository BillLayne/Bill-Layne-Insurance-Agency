@echo off
echo Building Tailwind CSS...
tools\tailwindcss.exe -i css\tailwind-input.css -o css\tailwind-output.css --minify -c js\tailwind.config.js
echo Done!
