/**
 * Home Insurance Tailwind config.
 * Scans ONLY home-insurance/index.html + its loaded JS files.
 * Outputs css/tailwind-home-insurance.css — much smaller than tailwind-output.css.
 *
 * @type {import('tailwindcss').Config}
 */
const sharedTheme = require('./tailwind.config.js').theme;
const sharedPlugins = require('./tailwind.config.js').plugins;

module.exports = {
  content: [
    "./home-insurance/index.html",
    "./js/mobile-dock.js"
  ],
  theme: sharedTheme,
  plugins: sharedPlugins,
  important: true,
};
