/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    output: 'standalone',
    typescript: {
      // !! 警告 !!
      // 危险区域，仅在您理解风险的情况下启用
      // 这个标志允许生产构建产生成功，即使有类型错误
      // 仅在你完全确定这样做是安全的情况下启用它
      ignoreBuildErrors: false,
    },
    eslint: {
      // 如果您不想在构建过程中进行 ESLint 检查，可以设置为 true
      ignoreDuringBuilds: false,
    },
    experimental: {
      // 启用 App Router
      appDir: true,
    },
  };
  
  export default nextConfig;