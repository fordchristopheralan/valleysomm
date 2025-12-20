/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        wine: {
          deep: '#6B2D3F',
          burgundy: '#8B3A4D',
          rose: '#C4637A',
        },
        valley: {
          deep: '#2D4A3E',
          sage: '#5B7C6F',
          mist: '#8FA99E',
        },
        cream: '#FAF7F2',
        beige: '#E8E0D5',
        taupe: '#B8A99A',
        gold: '#C9A962',
        slate: '#4A4A50',
        charcoal: '#2C2C30',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
