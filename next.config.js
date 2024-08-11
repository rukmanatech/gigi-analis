/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Penting untuk static site generation seperti GitHub Pages
  images: {
    unoptimized: true, // Diperlukan untuk static exports
    domains: ['rukmanatech.github.io'], // Hanya nama domain, tanpa protokol atau path
  },
  env: {
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  },
  basePath: '/gigi-analis', // Sesuaikan dengan nama repo Anda
  assetPrefix: '/gigi-analis/', // Sesuaikan dengan nama repo Anda
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
