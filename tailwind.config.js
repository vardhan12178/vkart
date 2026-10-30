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
      // Status colours tuned to the cream / ink / terracotta palette
      colors: {
        ok: '#3d6b4f', // in stock, savings
        alert: '#a8402f', // out of stock, errors
        star: '#e0a37f', // rating star on ink
      },
    },
  },
  plugins: [],
};
