import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#edf8f0',
          100: '#dff0e0',
          200: '#bfe0bc',
          300: '#8fc18d',
          400: '#63a76b',
          500: '#3d8b4f',
          600: '#2e6d3a',
          700: '#255930',
          800: '#1f4d29',
          900: '#163b1f'
        }
      },
      boxShadow: {
        soft: '0 12px 40px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
};

export default config;
