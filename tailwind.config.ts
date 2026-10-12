import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fdfbf5',
          100: '#f8f2e2',
          200: '#f1e7c9',
        },
        forest: {
          50: '#eef3e6',
          100: '#d6e3bd',
          200: '#adc785',
          300: '#8aac5c',
          400: '#6f9440',
          500: '#587a2e',
          600: '#3f5c20',
          700: '#2e4518',
          800: '#213212',
          900: '#17240c',
        },
        terracotta: {
          50: '#fbf0e6',
          100: '#f3d6b6',
          200: '#e7b57e',
          300: '#dc9a56',
          400: '#cf8038',
          500: '#b8672a',
          600: '#95511f',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -4px rgba(33, 50, 18, 0.12)',
        card: '0 2px 12px -2px rgba(33, 50, 18, 0.10)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
