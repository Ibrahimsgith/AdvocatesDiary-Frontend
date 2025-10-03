/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html', 
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Custom Brand Color Palette (e.g., Indigo/Blue)
        brand: {
          50:'#eef2ff',
          100:'#e0e7ff',
          600:'#4f46e5', // Primary brand color
          700:'#4338ca',
          900:'#1e1b4b'
        }
      },
      boxShadow: {
        // Custom shadows for a "soft" modern look
        soft: '0 8px 30px rgba(2, 6, 23, 0.06)',
        // Custom glow for primary buttons
        glow: '0 0 0 2px rgba(79,70,229,.15), 0 8px 30px rgba(79,70,229,.25)'
      },
      backgroundImage: {
        // Custom grid pattern for the body background
        'grid-slate': "linear-gradient(to right, rgba(148,163,184,.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,.15) 1px, transparent 1px)"
      },
      backgroundSize: { 
        'grid': '24px 24px' // Sets the size of the grid pattern
      }
    },
  },
  plugins: [],
}