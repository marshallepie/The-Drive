/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@drive/shared'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
  images: {
    unoptimized: true, // Disable image optimization for Netlify compatibility
    domains: ['localhost', 'the-drive-api.onrender.com'],
  },
}

module.exports = nextConfig
