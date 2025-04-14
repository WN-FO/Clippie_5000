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
  // Configure API routes to use Node.js runtime
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  // Ensure API routes use Node.js runtime
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('ffmpeg-static');
    }
    return config;
  },
};

module.exports = nextConfig;
