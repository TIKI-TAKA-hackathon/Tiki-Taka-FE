/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#fff8ed',
          100: '#ffefd5',
          200: '#f9d7a8',
          500: '#d9822b',
          700: '#8a4b14',
        },
        leaf: {
          50: '#f1f8f4',
          500: '#4f8f65',
          700: '#2e5d40',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'Apple SD Gothic Neo', 'Noto Sans KR', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
