/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#EDEFF1',
        surface: '#FFFFFF',
        cell: '#F7F8F9',
        ink: '#0B0D10',
        muted: '#4B525B',
        accent: {
          DEFAULT: '#2B50FF',
          soft: '#8FA6FF',
        },
        line: '#C3C9CF',
      },
      fontFamily: {
        sans: ['"Bricolage Grotesque"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};

