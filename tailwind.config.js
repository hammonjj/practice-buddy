/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Custom dim theme colors
        dim: {
          50: '#f5f7fa',
          100: '#e4e7eb',
          200: '#cbd2d9',
          300: '#9aa5b1',
          400: '#7b8794',
          500: '#616e7c',
          600: '#52606d',
          700: '#3e4c59',
          800: '#323f4b',
          900: '#1f2933',
        },
        primary: {
          50: '#e6eeff',
          100: '#ccdeff',
          200: '#99bdff',
          300: '#669bff',
          400: '#337aff',
          500: '#0059ff',
          600: '#0047cc',
          700: '#003599',
          800: '#002466',
          900: '#001233',
        },
        accent: {
          50: '#eeeaff',
          100: '#dcd5ff',
          200: '#baabff',
          300: '#9780ff',
          400: '#7556ff',
          500: '#5f38ff',
          600: '#4c2dcc',
          700: '#392299',
          800: '#261666',
          900: '#130b33',
        }
      }
    },
  },
  plugins: [],
};