/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0a0a',
          card: '#1a1a1a',
          border: '#2a2a2a',
        },
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#10b981',
      },
    },
  },
  plugins: [],
}