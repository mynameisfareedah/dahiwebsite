/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dahiPrimary: '#6D2E7C',
        dahiSecondary: '#1F7A7A',
        dahiAccent: '#D8A63A',
      },
    },
  },
  plugins: [],
};
