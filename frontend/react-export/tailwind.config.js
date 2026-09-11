/** Merge this into your existing tailwind.config.js — this shows only what RenderFlow needs. */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Barlow Condensed"', 'sans-serif'],
        body: ['Barlow', 'sans-serif']
      },
      keyframes: {
        'rf-pulse': { '0%, 100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: 0.4, transform: 'scale(1.35)' } },
        'rf-scan': { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(320%)' } },
        'rf-fadein': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'rf-blink': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.3 } },
        'rf-alarmglow': {
          '0%, 100%': { boxShadow: '0 0 6px 0 rgba(224,85,74,0.4)' },
          '50%': { boxShadow: '0 0 18px 2px rgba(224,85,74,0.6)' }
        },
        'rf-rotate': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } }
      },
      animation: {
        'rf-pulse': 'rf-pulse 0.9s ease infinite',
        'rf-scan': 'rf-scan 1s linear infinite',
        'rf-fadein': 'rf-fadein 0.4s ease backwards',
        'rf-blink': 'rf-blink 2.4s ease infinite',
        'rf-alarmglow': 'rf-alarmglow 2.4s ease-in-out infinite',
        'rf-rotate': 'rf-rotate 2.6s linear infinite'
      }
    }
  },
  plugins: []
};
