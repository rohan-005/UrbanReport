/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#89a577',
          soft: '#a8c38e',
          dark: '#6e895d',
        },
        earth: {
          DEFAULT: '#877b5f',
          light: '#a39578',
          dark: '#6a6048',
        },
        beige: {
          DEFAULT: '#b8a184',
          light: '#d2c2ad',
          dark: '#9a8368',
        },
        info: {
          soft: '#d4faff',
        },
        civic: {
          bg: '#f5f3ee',
          card: '#ffffff',
          dark: '#1f241d',
          border: '#e2dfd7',
          muted: '#6b7280',
          accent: '#89a577',
          danger: '#dc2626',
          warning: '#d97706',
          success: '#16a34a',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'sans-serif'],
        display: ['var(--font-display)', 'Lora', 'serif'],
        accent: ['var(--font-accent)', 'Caveat', 'cursive'],
      },
      borderRadius: {
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        pill: '9999px',
      },
    },
  },
  plugins: [],
};

