/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    serverComponentsExternalPackages: ['chrome-aws-lambda'],
  },
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      config.externals.push({
        'chrome-aws-lambda': 'commonjs chrome-aws-lambda',
      });
    }
    return config;
  },
};

export default nextConfig;