/** @type {import('next').NextConfig} */

// The site is deployed two ways from one repo:
//
//   * Vercel  — the normal Next.js build, served from "/"
//   * GitHub Pages — static export, served from "/Electrical/"
//
// Pages is a sub-path and cannot run a Node server, so those settings only
// apply when the Pages workflow sets GITHUB_PAGES=true. Everything else uses
// the default Next.js configuration.
const isPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  reactStrictMode: true,
  ...(isPages
    ? {
        output: 'export',
        basePath: '/Electrical',
        assetPrefix: '/Electrical',
        trailingSlash: true,
      }
    : {}),
  images: {
    unoptimized: isPages,
  },
};

module.exports = nextConfig;