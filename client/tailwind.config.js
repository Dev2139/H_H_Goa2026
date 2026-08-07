/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#8B5CF6',
          blue: '#3B82F6',
          orange: '#F97316',
          yellow: '#EAB308',
          dark: '#05070F',
          card: '#0C0F1D',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'beach-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 35%, #F97316 70%, #EAB308 100%)',
      }
    },
  },
  plugins: [],
}
