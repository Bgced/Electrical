/** @type {import('next').NextConfig} */

// GitHub Pages needs plain static files, so the build is exported and served
// from a sub-path. Vercel runs the normal Next.js server build instead, which
// is why the export settings are opt-in rather than the default.
const isPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  reactStrictMode: true,
  ...(isPages ? { output: 'export' } : {}),
  images: {
    unoptimized: isPages,
  },
  ...(isPages
    ? {
        basePath: '/Electrical',
        assetPrefix: '/Electrical',
        trailingSlash: true,
      }
    : {}),
};

module.exports = nextConfig;