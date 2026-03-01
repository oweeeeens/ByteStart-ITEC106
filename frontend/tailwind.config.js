/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Arial'],
        display: ['Poppins', 'Inter', 'ui-sans-serif'],
      },
      colors: {
        brand: {
          50: '#e0f7fa',
          100: '#b2ebf2',
          200: '#80deea',
          300: '#4dd0e1',
          400: '#26c6da',
          500: '#00ADB5',
          600: '#009aa2',
          700: '#007f86',
          800: '#00606b',
        },
        accent: {
          50: '#fce4ec',
          100: '#f8bbd0',
          200: '#f48fb1',
          300: '#f06292',
          400: '#ec407a',
          500: '#e91e63',
          600: '#d81b60',
        },
        success: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          500: '#16a34a',
          600: '#15803d',
        },
        warning: {
          50: '#fff8e1',
          500: '#f59e0b',
        },
        danger: {
          50: '#fef2f2',
          500: '#dc2626',
          600: '#b91c1c',
        },
        muted: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
        },
        steel: '#6b7280',
      },
      boxShadow: {
        card: '0 2px 8px 0 rgba(0,0,0,0.06), 0 1px 2px 0 rgba(0,0,0,0.04)',
        'card-hover': '0 8px 24px 0 rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
}
