/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Outputs a Single-Page Application (SPA).
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  reactStrictMode: true,
  swcMinify: true,
  distDir: process.env.NEXT_PUBLIC_DIST_DIR,
  modularizeImports: {
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },
  images: {
    unoptimized: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    });
  
    return config;
  }
};

export default nextConfig;
