'use client';

import { useEffect, useRef } from 'react';

export type Article = {
  id: string;
  title: string;
  date: string;
  tag: string;
  read: string;
  intro: string;
  body: string[];
  points: string[];
  standard: string;
};

export default function ArticleModal({ article, onClose }: { article: Article | null; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!article) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [article, onClose]);

  if (!article) return null;

  return (
    <div
      className="article-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="articleTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="article-panel" ref={panelRef}>
        <header className="article-head">
          <div>
            <span className="article-tag">{article.tag}</span>
            <h3 id="articleTitle">{article.title}</h3>
            <span className="article-meta">
              {article.date} · {article.read}
            </span>
          </div>
          <button ref={closeRef} type="button" className="article-close" aria-label="Tutup artikel" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="article-body">
          <p className="article-intro">{article.intro}</p>
          {article.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          <div className="article-points">
            <span className="article-points-label">Poin teknis kunci</span>
            <ul>
              {article.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>

          <div className="article-standard">
            <span>Referensi standar</span>
            <strong>{article.standard}</strong>
          </div>
        </div>

        <footer className="article-foot">
          <a href="#simulator" className="btn btn-primary" onClick={onClose}>
            Uji di simulator
          </a>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Tutup
          </button>
        </footer>
      </div>
    </div>
  );
}
