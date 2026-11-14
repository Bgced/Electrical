/**
 * Public assets live under the deployment base path. GitHub Pages serves this
 * app from a sub-folder, Vercel from the domain root, so never hard-code "/".
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function asset(path: string) {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${clean}`;
}
