/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  safelist: [
    'bg-yellow-100',
    'bg-green-900',
    'bg-red-800',
    'bg-blue-800',
    'bg-purple-700',
    'bg-white',
    'text-white'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
