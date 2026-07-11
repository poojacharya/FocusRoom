/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f6ff',
          100: '#ebedff',
          200: '#d1d6ff',
          300: '#a8b0ff',
          400: '#7c85ff',
          500: '#5b5ff5',
          600: '#4640da',
          700: '#3931b0',
          800: '#302a8c',
          900: '#2a2670',
        },
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
