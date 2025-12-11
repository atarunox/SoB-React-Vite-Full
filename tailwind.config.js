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
    extend: {
      colors: {
        // Western-Horror Theme Colors
        leather: {
          dark: '#3D2817',
          DEFAULT: '#5C3A21',
          light: '#7B4B2A',
        },
        blood: {
          dark: '#5A0000',
          DEFAULT: '#8B0000',
          light: '#A52A2A',
        },
        brass: {
          dark: '#9B7100',
          DEFAULT: '#B8860B',
          light: '#DAA520',
        },
        parchment: {
          dark: '#E8DCC4',
          DEFAULT: '#FDF6E3',
          light: '#FFFEF8',
        },
        shadow: {
          DEFAULT: '#1A1410',
          light: '#2D2419',
        },
        corruption: {
          DEFAULT: '#4A148C',
          light: '#6A1B9A',
        },
      },
      boxShadow: {
        'horror': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.4)',
        'horror-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.5)',
        'inner-dark': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.4)',
        'glow-red': '0 0 10px rgba(139, 0, 0, 0.5)',
        'glow-brass': '0 0 10px rgba(184, 134, 11, 0.4)',
      },
      textShadow: {
        'sm': '1px 1px 2px rgba(0, 0, 0, 0.5)',
        'DEFAULT': '2px 2px 4px rgba(0, 0, 0, 0.5)',
        'lg': '3px 3px 6px rgba(0, 0, 0, 0.6)',
      },
      backgroundImage: {
        'leather-texture': 'linear-gradient(135deg, #5C3A21 0%, #3D2817 100%)',
        'metal-texture': 'linear-gradient(180deg, #4A4A4A 0%, #2D2D2D 100%)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.text-shadow-sm': {
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
        },
        '.text-shadow': {
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
        },
        '.text-shadow-lg': {
          textShadow: '3px 3px 6px rgba(0, 0, 0, 0.6)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
