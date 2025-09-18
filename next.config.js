/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  allowedDevOrigins: ['192.168.29.73']
};

module.exports = nextConfig;