/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      container: { center: true, padding: '1rem', screens: { '2xl': '1200px' } },
      boxShadow: {
        soft: '0 8px 30px rgba(2, 6, 23, 0.06)',
      }
    }
  },
  plugins: [],
}
