import nextra from 'nextra';

const withNextra = nextra({
  // Nextra options
  defaultShowCopyCode: true,
});

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
};

export default withNextra(nextConfig);
