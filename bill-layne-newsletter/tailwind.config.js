/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#003f87',
        'navy-light': '#0076d3',
        gold: '#C8A84E',
        green: '#059669',
        amber: '#f59e0b',
        red: '#ef4444',
        slate: '#64748b',
        'slate-lt': '#94a3b8',
        bg: '#f1f5f9',
        border: '#e2e8f0',
        text: '#0f172a',
      },
      fontFamily: {
        sans: ["'DM Sans'", "'Segoe UI'", 'Arial', 'sans-serif'],
        mono: ["'DM Mono'", "'Courier New'", 'monospace'],
      },
    },
  },
  plugins: [],
}
