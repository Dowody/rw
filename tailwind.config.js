/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      transitionProperty: {
        'all-smooth': 'all',
        'transform-opacity': 'transform, opacity',
      },
      transitionDuration: {
        'smooth-fast': '300ms',
        'smooth-medium': '500ms',
        'smooth-slow': '700ms'
      },
      transitionTimingFunction: {
        'smooth-ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'subtle-hover': 'subtle-hover 0.5s ease-in-out',
        'gradient-shift': 'gradient-shift 5s ease infinite',
      },
      keyframes: {
        'subtle-hover': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        'gradient-shift': {
          '0%, 100%': { 
            'background-position': '0% 50%'
          },
          '50%': { 
            'background-position': '100% 50%'
          }
        }
      }
    },
  },
  plugins: [],
}
