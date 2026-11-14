/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export so the build output can be served by GitHub Pages.
  output: 'export',
  images: {
    unoptimized: true,
  },
  // The site is served from a sub-path on GitHub Pages.
  basePath: process.env.GITHUB_PAGES ? '/Electrical' : '',
  assetPrefix: process.env.GITHUB_PAGES ? '/Electrical' : '',
  trailingSlash: true,
};

module.exports = nextConfig;