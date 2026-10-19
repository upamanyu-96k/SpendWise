/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        app: token('app'),
        surface: token('surface'),
        raised: token('raised'),
        line: token('line'),
        main: token('main'),
        muted: token('muted'),
        brand: token('brand'),
        'brand-fg': token('brand-fg'),
        good: token('good'),
        warn: token('warn'),
        bad: token('bad'),
      },
      fontFamily: { sans: ['Inter', '"Segoe UI"', 'system-ui', '-apple-system', 'Roboto', 'sans-serif'] },
      boxShadow: {
        card: 'var(--shadow-card)',
        glow: '0 10px 30px -10px rgb(var(--brand) / 0.55)',
      },
      keyframes: {
        'fade-up': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'none' } },
        'toast-in': { from: { opacity: 0, transform: 'translateY(8px) scale(.98)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: {
        'fade-up': 'fade-up .45s ease-out both',
        'toast-in': 'toast-in .25s ease-out both',
      },
    },
  },
  plugins: [],
};
