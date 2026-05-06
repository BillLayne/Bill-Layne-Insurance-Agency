/**
 * Homepage-only Tailwind config.
 * Scans ONLY index.html + its loaded JS files.
 * Outputs css/tailwind-index.css — much smaller than tailwind-output.css.
 *
 * @type {import('tailwindcss').Config}
 */
const sharedTheme = require('./tailwind.config.js').theme;
const sharedPlugins = require('./tailwind.config.js').plugins;

module.exports = {
  content: [
    "./index.html",
    "./js/mobile-dock.js",
    "./js/accident-cost-estimator.js",
    "./js/app.js"
  ],
  theme: sharedTheme,
  plugins: sharedPlugins,
  important: true,
};
