/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B4332',
          50: '#E8F5EE',
          100: '#C6E6D4',
          200: '#8ECFAD',
          300: '#56B886',
          400: '#2E9B63',
          500: '#1B4332',
          600: '#163828',
          700: '#112D20',
          800: '#0C2218',
          900: '#071710'
        },
        gold: {
          DEFAULT: '#D4A017',
          50: '#FDF8E8',
          100: '#FAEFC4',
          200: '#F5DF89',
          300: '#EFCF4E',
          400: '#E8BF2A',
          500: '#D4A017',
          600: '#B08512',
          700: '#8C6A0E',
          800: '#684F0A',
          900: '#443407'
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif']
      }
    }
  },
  plugins: []
};
