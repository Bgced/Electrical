'use client';

import { useEffect, useRef } from 'react';
import SafeImg from '@/components/SafeImg';

export type LightboxItem = { src: string; caption: string; fallback?: string };

export default function Lightbox({
  items,
  index,
  onClose,
  onSelect,
}: {
  items: LightboxItem[];
  index: number | null;
  onClose: () => void;
  onSelect: (i: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = index !== null && items.length > 0;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (index === null) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onSelect((index + 1) % items.length);
      if (e.key === 'ArrowLeft') onSelect((index - 1 + items.length) % items.length);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, index, items.length, onClose, onSelect]);

  if (!open || index === null) return null;
  const item = items[index];

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.caption}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button ref={closeRef} type="button" className="lightbox-close" aria-label="Tutup pratinjau" onClick={onClose}>
        ✕
      </button>

      {items.length > 1 && (
        <>
          <button
            type="button"
            className="lightbox-nav is-prev"
            aria-label="Foto sebelumnya"
            onClick={() => onSelect((index - 1 + items.length) % items.length)}
          >
            ‹
          </button>
          <button
            type="button"
            className="lightbox-nav is-next"
            aria-label="Foto berikutnya"
            onClick={() => onSelect((index + 1) % items.length)}
          >
            ›
          </button>
        </>
      )}

      <figure className="lightbox-figure">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src}
          alt={item.caption}
          onError={(e) => {
            const img = e.currentTarget;
            if (!img.dataset.fallback) {
              img.dataset.fallback = '1';
              img.src = '/foto/panel-distribusi.jpg';
            }
          }}
        />
        <figcaption>
          <span>{item.caption}</span>
          <em>
            {index + 1} / {items.length}
          </em>
        </figcaption>
      </figure>
    </div>
  );
}
