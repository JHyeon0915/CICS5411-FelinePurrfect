/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#E6F5FF',
          200: '#BDE5FF',
          300: '#A9D8FF',
          500: '#318FCE',
          600: '#2476B5',
          DEFAULT: '#155C8D',
        },
        gray: {
          light: '#B7C2CB',
          DEFAULT: '#99A6B0',
          dark: '#5B6470',
        }
      }
    },
  },
  plugins: [],
}