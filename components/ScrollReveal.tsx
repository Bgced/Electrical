'use client';

import { useEffect } from 'react';

const TARGETS = [
  '.block',
  '.stats',
  '.video-section',
  '.cta-section',
  '.quicklinks',
  '.hero-bottom',
].join(',');

/**
 * Adds a light reveal-on-scroll. Elements stay fully visible when JS or
 * IntersectionObserver is unavailable, and motion-sensitive visitors are skipped.
 */
export default function ScrollReveal() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const nodes = Array.from(document.querySelectorAll<HTMLElement>(TARGETS));
    if (!nodes.length) return;

    nodes.forEach((el) => el.classList.add('reveal'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.04 }
    );

    nodes.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add('is-in');
        return;
      }
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
