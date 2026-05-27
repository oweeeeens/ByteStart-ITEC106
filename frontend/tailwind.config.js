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
        },
        ink: '#1e293b',
        steel: '#475569',
        paper: '#f8fafc',
      },
      borderRadius: {
        lg: '14px',
        xl: '18px',
        '2xl': '24px',
      },
      boxShadow: {
        card: '0 4px 16px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.1)',
        glow: '0 0 20px rgba(0, 173, 181, 0.15)',
      },
      transitionProperty: {
        colors: 'color, background-color, border-color',
        transform: 'transform',
        width: 'width',
        opacity: 'opacity',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        pulse: { '0%, 100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.05)' } },
        bounceIn: { '0%': { transform: 'scale(0.8)', opacity: 0 }, '60%': { transform: 'scale(1.05)' }, '100%': { transform: 'scale(1)', opacity: 1 } },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out',
        slideUp: 'slideUp 0.5s ease-out',
        pulse: 'pulse 2s infinite',
        bounceIn: 'bounceIn 0.5s ease-out',
      },
    },
  },
  plugins: [],
}
