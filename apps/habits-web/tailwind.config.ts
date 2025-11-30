import type { Config } from 'tailwindcss';

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
          violet: '#6A5ACD',
          'light-violet': '#8B7BFF',
          'deep-violet': '#392E8E',
        },
        integrity: {
          green: '#34D399',
        },
        shard: {
          gold: '#FBBF24',
        },
      },
    },
  },
  plugins: [],
};
export default config;
