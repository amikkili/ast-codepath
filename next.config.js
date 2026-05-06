/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Force all pages to render at request time (not at build time)
  // This fixes the "Invalid URL" error when NEXTAUTH_URL is empty during build
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig