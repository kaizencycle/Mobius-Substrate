/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Optimize for production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // Enable image optimization
  images: {
    domains: [],
  },

  // WebSocket support + GLSL shader loader
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });
    
    // Handle GLSL shader files
    config.module.rules.push({
      test: /\.glsl$/,
      type: 'asset/source',
    });
    
    return config;
  },
}

module.exports = nextConfig
