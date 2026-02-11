/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Metallic blue palette
        steel: {
          50:  '#f0f5fb',
          100: '#dce8f5',
          200: '#b8d0eb',
          300: '#88aed8',
          400: '#5487c0',
          500: '#3469a8',
          600: '#25508e',
          700: '#1e3f74',
          800: '#1a3361',
          900: '#0f1f3d',
          950: '#080f1e',
        },
        // Cold silver / metallic accent
        silver: {
          100: '#f4f6f9',
          200: '#e2e7ef',
          300: '#c4cedf',
          400: '#9aadc7',
          500: '#7490b4',
          600: '#5c7a9f',
          700: '#4a6485',
          800: '#3d5370',
          900: '#2d3d52',
        },
        // Sharp accent – electric cyan
        accent: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        // Status colors
        success: '#10b981',
        warning: '#f59e0b',
        danger:  '#ef4444',
      },
      backgroundImage: {
        'hero-mesh':
          'radial-gradient(at 20% 50%, #1e3f74 0%, transparent 50%), radial-gradient(at 80% 10%, #0f1f3d 0%, transparent 40%), radial-gradient(at 60% 80%, #25508e 0%, transparent 40%)',
        'hero-mesh-light':
          'radial-gradient(at 20% 50%, #dce8f5 0%, transparent 50%), radial-gradient(at 80% 10%, #f0f5fb 0%, transparent 40%), radial-gradient(at 60% 80%, #b8d0eb 0%, transparent 40%)',
        'steel-gradient':
          'linear-gradient(135deg, #0f1f3d 0%, #1e3f74 50%, #25508e 100%)',
        'steel-gradient-light':
          'linear-gradient(135deg, #3469a8 0%, #5487c0 50%, #88aed8 100%)',
        'card-shine':
          'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 100%)',
        'card-shine-light':
          'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
      },
      boxShadow: {
        'steel': '0 4px 24px rgba(15,31,61,0.35)',
        'steel-lg': '0 8px 48px rgba(15,31,61,0.5)',
        'steel-light': '0 2px 16px rgba(52,105,168,0.12)',
        'steel-lg-light': '0 4px 32px rgba(52,105,168,0.18)',
        'accent': '0 4px 20px rgba(14,165,233,0.35)',
        'inner-light': 'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease both',
        'fade-in': 'fadeIn 0.4s ease both',
        'slide-right': 'slideRight 0.4s ease both',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeUp:     { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:     { from: { opacity: '0' },                                to: { opacity: '1' } },
        slideRight: { from: { opacity: '0', transform: 'translateX(-20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
};
