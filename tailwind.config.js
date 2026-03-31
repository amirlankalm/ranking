/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#05060f',
        card: '#0d0f1e',
        accent: {
          gold: '#f5c518',
          glow: 'rgba(245, 197, 24, 0.3)'
        },
        muted: '#7a7a9d',
        rank: {
          gold: '#FFD700',
          silver: '#C0C0C0',
          bronze: '#CD7F32'
        }
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        rank: ['"Bebas Neue"', 'sans-serif']
      },
      animation: {
        'count-up': 'countUp 1s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        countUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}

