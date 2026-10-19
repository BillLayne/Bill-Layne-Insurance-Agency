/**
 * Claims Center Tailwind config.
 * Scans ONLY claims-center/index.html + its loaded JS files.
 * Outputs css/tailwind-claims-center.css — much smaller than tailwind-output.css.
 *
 * @type {import('tailwindcss').Config}
 */
const sharedTheme = require('./tailwind.config.js').theme;
const sharedPlugins = require('./tailwind.config.js').plugins;

module.exports = {
  content: [
    "./claims-center/index.html",
    "./js/claims-center-body.js",
    "./js/mobile-dock.js"
  ],
  theme: sharedTheme,
  plugins: sharedPlugins,
  important: true,
};
