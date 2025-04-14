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
};

module.exports = nextConfig;
