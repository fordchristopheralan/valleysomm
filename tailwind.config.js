/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'wine-deep': '#6B2D3F',
        'wine-burgundy': '#8B3A4D',
        'wine-rose': '#C4637A',
        'valley-deep': '#2D4A3E',
        'valley-sage': '#5B7C6F',
        'valley-mist': '#8FA99E',
        'cream': '#FAF7F2',
        'warm-beige': '#E8E0D5',
        'taupe': '#B8A99A',
        'gold-accent': '#C9A962',
      },
    },
  },
  plugins: [],
}