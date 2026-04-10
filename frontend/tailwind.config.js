/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold:    { DEFAULT: '#C9A84C', light: '#F0D060', dim: '#8A6E2A', faint: '#C9A84C22' },
        saffron: { DEFAULT: '#FF9933', dim: '#CC7700' },
        teal:    { DEFAULT: '#1ABC9C', dim: '#148F77' },
        crimson: { DEFAULT: '#C0392B', dim: '#922B21' },
        bg:      { 1: '#0A0A10', 2: '#12121C', 3: '#1A1A28', 4: '#22223A', 5: '#2A2A42' },
        ink:     { 1: '#EDE8DC', 2: '#B0A090', 3: '#706050' },
        border:  { DEFAULT: '#2A2A42', bright: '#C9A84C44' },
      },
      fontFamily: {
        cinzel:   ['Cinzel', 'serif'],
        inter:    ['Inter', 'sans-serif'],
        mono:     ['JetBrains Mono', 'monospace'],
        dev:      ['Martel', 'Noto Serif Devanagari', 'serif'],
        playfair: ['Playfair Display', 'serif'],
      },
      animation: {
        'shimmer':    'shimmer 3s linear infinite',
        'float-up':   'floatUp 0.5s ease forwards',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'spin-slow':  'spin 3s linear infinite',
        'aurora':     'aurora 8s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        floatUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%,100%': { boxShadow: '0 0 0 0 #C9A84C33' },
          '50%':     { boxShadow: '0 0 0 8px #C9A84C00' },
        },
        aurora: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%':     { transform: 'translate(30px,-20px) scale(1.1)' },
          '66%':     { transform: 'translate(-20px,10px) scale(0.9)' },
        },
      },
      backgroundImage: {
        'gold-shimmer': 'linear-gradient(90deg, transparent 0%, #C9A84C 50%, transparent 100%)',
      },
      boxShadow: {
        'card':      '0 4px 24px #00000066',
        'card-hover':'0 8px 40px #00000088, 0 0 0 1px #C9A84C44',
        'glow-gold': '0 0 20px #C9A84C44',
        'glow-teal': '0 0 20px #1ABC9C44',
      },
    },
  },
  plugins: [],
}
