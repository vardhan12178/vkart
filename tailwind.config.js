module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", 
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        editorial: ['DM Serif Display', 'Georgia', 'serif'],
      },
      colors: {
        // Brand palette
        ink: { DEFAULT: '#1d1c19', soft: '#3d3a35' }, // headings and primary buttons / body text
        muted: { DEFAULT: '#6f6b62', light: '#8b867d', faint: '#a39e94' }, // secondary text
        paper: '#fffdf8', // cards and panels
        sand: '#f7f3ec', // page background
        tint: '#f1ece3', // chips, image placeholders
        line: { DEFAULT: '#ebe5da', strong: '#d9d2c5' }, // borders
        accent: '#a85d37', // terracotta: links, highlights, Buy now
        // Status colours tuned to the palette
        ok: '#3d6b4f', // in stock, savings
        alert: '#a8402f', // out of stock, errors
        star: '#e0a37f', // rating star on ink
      },
    },
  },
  plugins: [],
};
