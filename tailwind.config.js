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
          50:  '#edf6f1',
          100: '#d0e9dc',
          200: '#a1d3b9',
          300: '#66b48a',
          400: '#349462',
          500: '#175B35',
          600: '#134a2b',
          700: '#0f3b22',
          800: '#0b2d1a',
          900: '#082012',
          950: '#04110a',
        },
        silver: '#C6CBD0',
        forest: {
          50:  '#edf6f1',
          100: '#d0e9dc',
          200: '#a1d3b9',
          300: '#66b48a',
          400: '#349462',
          500: '#175B35',
          600: '#134a2b',
          700: '#0f3b22',
          800: '#0b2d1a',
          900: '#082012',
          950: '#04110a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Ethiopic', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
