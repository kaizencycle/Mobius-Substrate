import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mobius: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#ec4899',
        },
      },
    },
  },
  plugins: [],
}
export default config
