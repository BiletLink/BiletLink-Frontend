/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Docker
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.biletix.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.bubilet.com.tr',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'biletlink.co',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
