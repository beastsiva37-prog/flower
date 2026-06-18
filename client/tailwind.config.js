/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rosepink: {
          light: '#F3C5C6',
          DEFAULT: '#E8A0A2',
          dark: '#D81B60'
        },
        maroon: {
          DEFAULT: '#5A1827',
          dark: '#400F1A'
        },
        gold: {
          DEFAULT: '#D4AF37',
          dark: '#B89327'
        },
        forest: {
          DEFAULT: '#3E6B48',
          dark: '#2E5236'
        },
        ivory: '#FDFBF7',
        darktext: '#2C3531'
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 10px 30px rgba(90, 24, 39, 0.08)',
        premiumHover: '0 20px 40px rgba(90, 24, 39, 0.15)',
      }
    },
  },
  plugins: [],
}
