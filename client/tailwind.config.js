/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1B2A41',
        paper: '#F4F6F3',
        line: '#DCE1DB',
        brand: { DEFAULT: '#0E7C66', dark: '#0A5E4D', soft: '#E1F1EC' },
        warn: { DEFAULT: '#B26A00', soft: '#FBF0DA' },
        danger: { DEFAULT: '#B3261E', soft: '#FBE7E5' },
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'system-ui', '-apple-system', 'Roboto', 'sans-serif'],
        display: ['"Iowan Old Style"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
