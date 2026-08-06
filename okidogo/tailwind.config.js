/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      height: {
        '7': '1.75rem',
      },
      width: {
        '7': '1.75rem',
      },
    },
  },
  safelist: [
    'h-7',
    'w-7'
  ],
  plugins: [],
}
