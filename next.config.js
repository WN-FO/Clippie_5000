/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "googleusercontent.com",
      },
      { hostname: "oaidalleapiprodscus.blob.core.windows.net" },
      { hostname: "cdn.openai.com" },
    ],
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['fluent-ffmpeg', 'ffmpeg-static'],
    // Improve hydration behavior
    optimizeCss: true,
    // Improve page loading performance
    optimizePackageImports: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  },
  // Ensure API routes use Node.js runtime through webpack config
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('ffmpeg-static');
    }
    // Optimize client-side bundle
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
      };
    }
    return config;
  },
  // Configure route handlers to be dynamic by default
  serverRuntimeConfig: {
    dynamicRouteHandlers: true,
  },
  // Add strict mode to catch potential issues
  reactStrictMode: true,
  // Improve static optimization
  poweredByHeader: false,
  compress: true,
  // Use standalone output
  output: 'standalone',
  staticPageGenerationTimeout: 120,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
