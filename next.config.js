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
  },
  experimental: {
    serverComponentsExternalPackages: ['fluent-ffmpeg', 'ffmpeg-static'],
    // Enable React server components
    serverActions: true,
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
  // Disable static page optimization for now to fix build issues
  output: 'standalone',
  staticPageGenerationTimeout: 120,
  // Disable automatic static optimization for problematic pages
  unstable_excludeFiles: ['**/pages/404.*', '**/pages/500.*'],
};

module.exports = nextConfig;
