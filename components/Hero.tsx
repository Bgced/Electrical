'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/lib/app-context';
import { asset } from '@/lib/assets';
import type { I18nKey } from '@/lib/i18n';

const SLIDES = [
  '/foto/komponen-listrik.jpg',
  '/foto/komponen-listrik-2.jpg',
  '/foto/thermal-relay.jpg',
  '/foto/panel-distribusi.jpg',
  '/foto/pekerja-listrik.jpg',
  '/foto/superkonduktor.jpg',
].map(asset);

const STANDARDS: { key: I18nKey; code: string }[] = [
  { key: 'info.s1', code: 'PUIL' },
  { key: 'info.s2', code: 'IEC' },
  { key: 'info.s3', code: 'IEEE' },
  { key: 'info.s4', code: 'NFPA' },
];

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Hero() {
  const { t } = useApp();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIdx((v) => (v + 1) % SLIDES.length);
    }, 5200);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section className="hero" id="hero">
      <div className="hero-bg" aria-hidden="true">
        <div className="bg-slideshow">
          {SLIDES.map((src, i) => (
            <div
              key={src}
              className={`bg-slide${i === idx ? ' active' : ''}`}
              style={{ backgroundImage: `url('${src}')` }}
            />
          ))}
        </div>
        <div className="hero-grid" />
        <div className="hero-glow" />
      </div>

      <div className="container hero-container">
        <div className="hero-content">
          <span className="hero-kicker">
            <span className="hero-kicker-dot" />
            {t('hero.kicker')}
          </span>

          <h1 className="hero-title">
            <span className="line">
              <span>{t('hero.t1')}</span>
            </span>
            <span className="line">
              <span className="accent">{t('hero.t2')}</span>
            </span>
          </h1>

          <p className="hero-desc">{t('hero.desc')}</p>

          <div className="hero-cta">
            <a href="#layanan" className="btn btn-primary">
              {t('hero.cta1')}
              <Arrow />
            </a>
            <a href="#simulator" className="btn btn-secondary">
              {t('cta.btn2')}
            </a>
          </div>

          <ul className="hero-trust" aria-label="Standar acuan">
            {STANDARDS.map((s) => (
              <li key={s.code}>
                <span className="hero-trust-code">{s.code}</span>
                <span className="hero-trust-text">{t(s.key)}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="hero-aside" aria-label={t('sidebar.title')}>
          <div className="hero-panel">
            <div className="hero-panel-head">
              <span className="hero-panel-title">{t('info.standards')}</span>
              <span className="hero-panel-badge">{t('sidebar.badge')}</span>
            </div>
            <ul className="hero-panel-list">
              {STANDARDS.map((s) => (
                <li key={s.code}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{t(s.key)}</span>
                </li>
              ))}
            </ul>
            <a href="#spesifikasi" className="hero-panel-link">
              {t('nav.specs')}
              <Arrow />
            </a>
          </div>
        </aside>
      </div>

      <div className="hero-bottom">
        <div className="container">
          <a href="#tentang" className="scroll-indicator" aria-label="Scroll">
            <span className="scroll-mouse">
              <span className="scroll-wheel" />
            </span>
            <span className="scroll-label">{t('hero.scroll')}</span>
          </a>

          <div
            className="hero-slidebar"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <span className="slide-counter">
              {String(idx + 1).padStart(2, '0')}
              <span>/ {String(SLIDES.length).padStart(2, '0')}</span>
            </span>
            <div className="slide-dots">
              {SLIDES.map((s, i) => (
                <button
                  key={s}
                  className={`slide-dot${i === idx ? ' active' : ''}`}
                  aria-label={`Slide ${i + 1}`}
                  aria-current={i === idx}
                  onClick={() => setIdx(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
