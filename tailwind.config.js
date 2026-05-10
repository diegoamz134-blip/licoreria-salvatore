/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Cormorant Garamond', 'serif'],
        mono:    ['var(--font-mono)',    'IBM Plex Mono',       'monospace'],
      },
      colors: {
        canvas: '#050505',
        card:   '#0c0c0c',
        border: 'rgba(255,255,255,0.07)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
