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
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['fluent-ffmpeg', 'ffmpeg-static'],
  },
  // Ensure API routes use Node.js runtime through webpack config
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('ffmpeg-static');
    }
    return config;
  },
  // Configure route handlers to be dynamic by default
  // This fixes the "Dynamic server usage" error related to cookies
  serverRuntimeConfig: {
    dynamicRouteHandlers: true,
  },
};

module.exports = nextConfig;
