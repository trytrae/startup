/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify: true,
  
  // 禁用类型检查
  typescript: {
    // !! 警告: 这会完全禁用类型检查
    ignoreBuildErrors: true,
  },
  
  // 禁用 ESLint
  eslint: {
    // !! 警告: 这会完全禁用 ESLint
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig