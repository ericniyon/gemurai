const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.djyh.rw',
        pathname: '/**',
      }
    ],
    domains: ['localhost', 'www.djyh.rw'],
    unoptimized: true
  },
  experimental: {
    serverActions: {
      enabled: true
    }
  },
  serverExternalPackages: [
    '@sendgrid/mail',
    'twilio',
    'bcryptjs',
    'jsonwebtoken'
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(new NodePolyfillPlugin())
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      querystring: require.resolve("querystring-es3"),
      vm: require.resolve("vm-browserify"),
    }
    return config
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
