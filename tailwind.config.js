/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // brand → 깊은바다(sea-deep) family. a11y-safe as bg-with-white and as text.
        brand: {
          50: '#E9F6F7',
          100: '#CDEBEC',
          200: '#A9DEE0',
          500: '#0F6E74',
          600: '#0F6E74',
          700: '#0F6E74',
        },
        // success → 완료(done) family.
        success: {
          50: '#E3F0EA',
          100: '#d7e8df',
          500: '#2E7D5B',
          600: '#2E7D5B',
          700: '#2E7D5B',
        },
        // warn → 지연(delay) family.
        warn: {
          50: '#F6E9CE',
          100: '#f0dcae',
          500: '#9A5B00',
          700: '#9A5B00',
        },
        // 고찌봄 named tokens (usable directly on components).
        citrus: '#FFD04D',
        'citrus-deep': '#9A5B00',
        sea: '#68D8DD',
        'sea-deep': '#0F6E74',
        cream: '#FFF7E6',
        'citrus-wash': '#FCEFC7',
        ink: '#2A2724',
        'ink-soft': '#5C5854',
        base: '#FAF8F5',
        surface: '#FFFFFF',
        'basalt-200': '#F0EDE9',
        'basalt-300': '#DAD6D2',
        'basalt-400': '#B2AEAC',
        done: '#2E7D5B',
        'done-bg': '#E3F0EA',
        delay: '#9A5B00',
        'delay-bg': '#F6E9CE',
        check: '#B3542A',
        'check-bg': '#F7E3D6',
        danger: '#B3261E',
      },
      fontFamily: {
        sans: [
          'Pretendard',
          'system-ui',
          '-apple-system',
          'Apple SD Gothic Neo',
          'Malgun Gothic',
          'Noto Sans KR',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
