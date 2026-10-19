/**
 * Auto Center Tailwind config.
 * Scans ONLY auto-center/index.html + its loaded JS files.
 * Outputs css/tailwind-auto-center.css — much smaller than tailwind-output.css.
 *
 * @type {import('tailwindcss').Config}
 */
const sharedTheme = require('./tailwind.config.js').theme;
const sharedPlugins = require('./tailwind.config.js').plugins;

module.exports = {
  content: [
    "./auto-center/index.html",
    "./js/mobile-dock.js"
  ],
  theme: sharedTheme,
  plugins: sharedPlugins,
  important: true,
};
