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
};

module.exports = nextConfig;
