/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow images from S3
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'docudepth-storage.s3.us-east-2.amazonaws.com',
      },
    ],
  },
  // Transpile packages that have ESM/CJS issues in production
  transpilePackages: [
    'react-markdown',
    'remark-gfm',
    'rehype-slug',
    'unified',
  ],
  // Webpack configuration for production
  webpack: (config, { isServer }) => {
    // Fix for highlight.js in production
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
