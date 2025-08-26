
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        critical: 'rgb(254 226 226)', // red-100
      }
    }
  },
  plugins: []
}
