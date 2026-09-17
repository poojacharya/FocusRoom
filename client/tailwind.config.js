/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F4F7F4',
          100: '#E3EEE6',
          200: '#C8D8CA',
          300: '#AFCAB0',
          400: '#8AB293',
          500: '#6B8F7A',
          600: '#54715F',
          700: '#3F5749',
          800: '#2A3B33',
          900: '#1A2622',
        },
        bg: {
          base: '#F4F7F4',
          surface: '#FFFFFF',
          subtle: '#EEF3EE',
        },
        text: {
          primary: '#1E2B2B',
          secondary: '#465A57',
          muted: '#72817D',
        },
        accent: '#D98C5F',
        success: '#3C7D68',
        danger: '#BF5B50',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
