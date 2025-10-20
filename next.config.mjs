import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
    esmExternals: 'loose',
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Compression and optimization
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    domains: ['placehold.co', 'www.DJYH.rw', 'DJYH.rw', 'res.cloudinary.com'],
    unoptimized: false, // Enable image optimization
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Webpack optimizations
  webpack: (config, { isServer, dev }) => {
    // Handle browser-specific modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        path: require.resolve('path-browserify'),
        zlib: require.resolve('browserify-zlib'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify'),
        buffer: require.resolve('buffer/'),
      }

      config.plugins.push(
        new config.webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      )

      // Bundle optimization for production
      if (!dev) {
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                priority: 10,
              },
              common: {
                name: 'common',
                minChunks: 2,
                chunks: 'all',
                priority: 5,
              },
            },
          },
        }
      }
    }

    // Add webpack externals configuration
    if (isServer) {
      config.externals = [
        ...config.externals,
        {
          'node:buffer': 'commonjs buffer',
          buffer: 'commonjs buffer',
        },
      ]
    }

    // Add support for various image formats
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
      type: 'asset/resource',
    })

    return config
  },

  // Transpile specific modules
  transpilePackages: [
    '@hello-pangea/dnd',
    'react-hook-form',
    'recharts',
    'vaul',
    'embla-carousel-react',
    '@radix-ui/react-icons',
  ],

  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600',
          },
        ],
      },
    ]
  },

  // Redirects for performance
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/en/dashboard',
        permanent: true,
      },
    ]
  },

  // Rewrites for static file serving
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/public/uploads/:path*',
      },
    ]
  },

  // Environment variables
  env: {
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    GOOGLE_SHEETS_PRIVATE_KEY: process.env.GOOGLE_SHEETS_PRIVATE_KEY,
    GOOGLE_SHEETS_CLIENT_EMAIL: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    GOOGLE_SHEETS_SPREADSHEET_ID: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
  },

  // Ensure proper trailing slash handling
  trailingSlash: false,
  
  // Handle potential export issues
  output: process.env.NEXT_OUTPUT === 'export' ? 'export' : undefined,
  
  // Remove error ignoring - we want to fix the actual errors
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Ensure static files are served correctly
  assetPrefix: '',
  basePath: '',
  
  // Enable static file serving from the public directory
  publicRuntimeConfig: {
    staticFolder: '/public',
  },
}

export default nextConfig
