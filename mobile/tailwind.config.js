/** @type {import('tailwindcss').Config} */
const primaryPalette = {
  50: '#FFF4E5',
  100: '#FFE4C7',
  200: '#FFD199',
  300: '#FFB56B',
  400: '#FF9B42',
  500: '#FF8C00',
  600: '#E97800',
  700: '#C86100',
  800: '#A24B00',
  900: '#7A3600',
  950: '#4F2100',
};

const neutralPalette = {
  50: '#F9FAFB',
  100: '#F5F5F5',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
};

module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/app/**/*.{js,jsx,ts,tsx}', // catches (tabs), (stack), cart, screens
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/context/**/*.{js,jsx,ts,tsx}',
    './src/utils/**/*.{js,jsx,ts,tsx}',
    './src/styles/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          ...primaryPalette,
          DEFAULT: primaryPalette[500],
        },
        accent: {
          500: '#22C55E',
          600: '#16A34A',
        },
        warning: {
          500: '#F59E0B',
        },
        info: {
          500: '#2563EB',
        },
        neutral: neutralPalette,
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F3F4F6',
          subtle: '#F9FAFB',
        },
        text: {
          primary: '#1F2937',
          secondary: '#4B5563',
          inverted: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Roboto_400Regular', 'System'],
        heading: ['Roboto_700Bold', 'System'],
      },
      spacing: {
        4.5: '1.125rem', // 18px
        7.5: '1.875rem', // 30px
      },
      borderRadius: {
        '2.5xl': '1.375rem', // 22px
        '3.5xl': '1.75rem', // 28px
      },
      boxShadow: {
        dropdown: '0px 10px 30px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};
