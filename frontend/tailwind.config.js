/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        success: '#4ecdc4',
        danger: '#ff6b6b',
        warning: '#ffd93d',
        dark: {
          DEFAULT: '#0f0f23',
          card: 'rgba(30, 41, 59, 0.8)',
          lighter: '#1e293b',
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 15s ease-in-out infinite',
        'bounce-slow': 'bounce 3s infinite',
        'heatmapPulse': 'heatmapPulse 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '25%': { transform: 'translateY(-20px) translateX(10px)' },
          '50%': { transform: 'translateY(-10px) translateX(20px)' },
          '75%': { transform: 'translateY(-30px) translateX(-10px)' },
        },
        heatmapPulse: {
          '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.05)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}