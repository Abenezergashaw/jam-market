/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{vue,js}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.js',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff1f0',
          100: '#ffe0de',
          200: '#ffc0bb',
          300: '#ff9085',
          400: '#f7564a',
          500: '#e73f32',
          600: '#cc2d21',
          700: '#a82217',
          800: '#8b1d14',
          900: '#751c15',
          950: '#400a08',
        },
        silver: '#C6CBD0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
