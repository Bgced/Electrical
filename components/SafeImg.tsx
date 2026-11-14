'use client';

import { useEffect, useRef } from 'react';

/**
 * <img> that always ends up showing something: the browser may fire the error
 * event before React hydrates, so we also re-check `complete && naturalWidth`
 * once on mount.
 */
export default function SafeImg({
  src,
  fallback = '/foto/panel-distribusi.jpg',
  alt,
  className,
  loading = 'lazy',
}: {
  src: string;
  fallback?: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = ref.current;
    if (!img) return;
    if (img.complete && img.naturalWidth === 0) {
      if (!img.dataset.fallback) {
        img.dataset.fallback = '1';
        img.src = fallback;
      }
    }
  }, [fallback]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={(e) => {
        const img = e.currentTarget;
        if (!img.dataset.fallback) {
          img.dataset.fallback = '1';
          img.src = fallback;
        }
      }}
    />
  );
}
