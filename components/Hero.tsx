'use client';

import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/lib/app-context';

const SLIDES = [
  'foto/komponen-listrik.jpg',
  'foto/komponen-listrik-2.jpg',
  'foto/thermal-relay.jpg',
  'foto/panel-distribusi.jpg',
  'foto/pekerja-listrik.jpg',
  'foto/superkonduktor.jpg',
];

export default function Hero() {
  const { t } = useApp();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((v) => (v + 1) % SLIDES.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="hero" id="hero">
      <div className="hero-bg" id="heroBg">
        <div className="bg-slideshow" id="bgSlideshow">
          {SLIDES.map((src, i) => (
            <div
              key={src}
              className={`bg-slide${i === idx ? ' active' : ''}`}
              style={{ backgroundImage: `url('${src}')` }}
            />
          ))}
        </div>
      </div>

      <div className="container">
        <div className="hero-content">
          <span className="hero-kicker">{t('hero.kicker')}</span>
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
            </a>
          </div>
        </div>

        <a href="#tentang" className="scroll-indicator" aria-label="Scroll">
          <span className="scroll-mouse">
            <span className="scroll-wheel" />
          </span>
        </a>

        <div className="slide-dots" id="slideDots">
          {SLIDES.map((s, i) => (
            <button
              key={s}
              className={`slide-dot${i === idx ? ' active' : ''}`}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}