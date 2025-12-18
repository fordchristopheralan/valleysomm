import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Valley Somm brand colors
        burgundy: {
          DEFAULT: "#722F37",
          50: "#F9F1F2",
          100: "#F0DFE1",
          200: "#E1BFC3",
          300: "#D19FA5",
          400: "#C27F87",
          500: "#722F37",
          600: "#5A252C",
          700: "#421B20",
          800: "#2A1115",
          900: "#12080A",
        },
        wine: {
          DEFAULT: "#4A1C24",
          deep: "#3A161C",
        },
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E5C76B",
        },
        cream: "#F9F6F2",
        sage: "#8B9D83",
      },
      fontFamily: {
        serif: ["Georgia", "Palatino", "serif"],
        sans: ["system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
