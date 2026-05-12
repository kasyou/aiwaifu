/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#faf9f5',
        'surface-card': '#efe9de',
        'surface-dark': '#181715',
        'surface-dark-elevated': '#252320',
        primary: '#cc785c',
        'primary-active': '#a9583e',
        ink: '#141413',
        body: '#3d3d3a',
        muted: '#6c6a64',
        hairline: '#e6dfd8',
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
