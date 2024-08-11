/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['https://rukmanatech.github.io/gigi-analis/'],
  },
  env: {
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/gemini/:path*',
        destination: 'https://generativelanguage.googleapis.com/:path*',
      },
    ]
  },
};

module.exports = nextConfig;
