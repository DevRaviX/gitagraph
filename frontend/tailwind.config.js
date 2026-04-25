/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold:    { DEFAULT: '#C9A84C', light: '#F0D060', dim: '#8A6E2A', faint: '#C9A84C1A' },
        saffron: { DEFAULT: '#E8861A', dim: '#B86A10' },
        teal:    { DEFAULT: '#4A9E7A', dim: '#357A5C' },
        crimson: { DEFAULT: '#B03020', dim: '#882418' },
        bg:      { 1: '#0E0B07', 2: '#16110A', 3: '#1F1710', 4: '#2A1F14', 5: '#3D2E1E' },
        ink:     { 1: '#F5EDCF', 2: '#C4A97A', 3: '#7A6040' },
        border:  { DEFAULT: '#3D2E1E', bright: '#C9A84C55' },
        parchment: '#F0E6C8',
        vellum:    '#E8D9A8',
        wax:       '#8B2010',
      },
      fontFamily: {
        cinzel:    ['Cinzel', 'serif'],
        fell:      ['"IM Fell English"', 'Spectral', 'serif'],
        uncial:    ['Uncial Antiqua', 'Cinzel', 'serif'],
        spectral:  ['Spectral', '"Cormorant Garamond"', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'serif'],
        inter:     ['Inter', 'sans-serif'],
        mono:      ['JetBrains Mono', 'monospace'],
        dev:       ['Martel', '"Noto Serif Devanagari"', 'serif'],
        playfair:  ['"Playfair Display"', 'serif'],
      },
      animation: {
        'shimmer':        'shimmer 3s linear infinite',
        'float-up':       'floatUp 0.5s ease forwards',
        'pulse-gold':     'pulseGold 2s ease-in-out infinite',
        'spin-slow':      'spin 3s linear infinite',
        'candle-flicker': 'candleFlicker 4s ease-in-out infinite',
        'aurora':         'aurora 8s ease-in-out infinite',
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
        candleFlicker: {
          '0%,100%': { opacity: '0.82', transform: 'scale(1)' },
          '33%':     { opacity: '1',    transform: 'scale(1.12) translate(3px,-5px)' },
          '66%':     { opacity: '0.65', transform: 'scale(0.92) translate(-2px,2px)' },
        },
        aurora: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%':     { transform: 'translate(30px,-20px) scale(1.1)' },
          '66%':     { transform: 'translate(-20px,10px) scale(0.9)' },
        },
      },
      backgroundImage: {
        'gold-shimmer':   'linear-gradient(90deg, transparent 0%, #C9A84C 50%, transparent 100%)',
        'parchment-grad': 'linear-gradient(160deg, #1F1710 0%, #0E0B07 100%)',
        'candle-glow':    'radial-gradient(circle, rgba(201,168,76,0.14) 0%, transparent 70%)',
      },
      boxShadow: {
        'card':       '0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,241,195,0.04)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.28)',
        'glow-gold':  '0 0 28px rgba(201,168,76,0.22), 0 0 60px rgba(201,168,76,0.08)',
        'glow-teal':  '0 0 20px rgba(74,158,122,0.2)',
        'candle-gold':'0 0 40px rgba(201,168,76,0.18)',
        'wax-seal':   '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,200,150,0.1)',
      },
    },
  },
  plugins: [],
}
