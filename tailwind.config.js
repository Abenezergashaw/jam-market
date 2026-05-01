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
        forest: {
          50:  '#f1f7ec',
          100: '#ddecd0',
          200: '#b8d79e',
          300: '#8abc65',
          400: '#629e3a',
          500: '#3b5323',
          600: '#2f4219',
          700: '#253514',
          800: '#1c2a0f',
          900: '#15200b',
          950: '#0a1105',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
