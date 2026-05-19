/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}",],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#9333EA', // Deep vibrant purple
          light: '#A855F7',
          dark: '#7E22CE',
        },
        background: '#F3F4F6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },

      backgroundImage: {
        'puntos': 'radial-gradient(#b0b3b8 14%, transparent 18%)',
      },
      backgroundSize: {
        'puntos-sm': '10px 10px',
      }
    },
  },
  plugins: [],
}
