/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000']
    },
    serverComponentsExternalPackages: ['@sendgrid/mail', 'twilio', 'bcryptjs', 'jsonwebtoken']
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        buffer: require.resolve('buffer/'),
      };
      config.plugins.push(
        new config.webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      );
    }
    return config;
  }
};

module.exports = nextConfig; 