/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0B0D11',
          subtle: '#0F1115',
          card: '#15181F',
          cardHover: '#1B202A',
          border: '#232936',
          borderSubtle: '#1C212B',
        },
        forest: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          500: '#2E7D32',
          600: '#1B5E20',
          700: '#144617',
          800: '#0D3010',
          900: '#071A09',
        },
        emerald: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
        gold: {
          300: '#FDE68A',
          400: '#FBBF24',
          500: '#C9A227',
          600: '#A17E17',
        },
        surface: {
          paper: '#F8F7F3',
          muted: '#94A3B8',
          darkMuted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.4)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.15)',
        'glow-gold': '0 0 25px -5px rgba(201, 162, 39, 0.15)',
      }
    },
  },
  plugins: [],
}
