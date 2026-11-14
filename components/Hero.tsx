'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/lib/app-context';
import { asset } from '@/lib/assets';
import EngineerCharacter2D from '@/components/EngineerCharacter2D';

const PHOTO = asset('/foto/panel-distribusi.jpg');

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Wave({ className = '' }: { className?: string }) {
  // Static path: the motion is a CSS dash offset, so SSR and client agree.
  return (
    <svg className={className} viewBox="0 0 120 40" fill="none" aria-hidden="true">
      <path
        d="M0 20 C8 4 16 4 24 20 C32 36 40 36 48 20 C56 4 64 4 72 20 C80 36 88 36 96 20 C104 4 112 4 120 20"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

const HOTSPOTS = [
  {
    id: 'busbar',
    x: 35,
    y: 27,
    label: { id: 'Panel Distribusi Utama — Standar PUIL 2021', en: 'Main distribution panel — PUIL 2021' },
    icon: 'bolt' as const,
    text: '380V',
  },
  {
    id: 'wave',
    x: 46,
    y: 44,
    label: { id: 'Monitor kualitas daya — THD < 5%', en: 'Power quality monitor — THD < 5%' },
    icon: 'wave' as const,
    text: '',
  },
  {
    id: 'bus',
    x: 31,
    y: 60,
    label: { id: 'Busbar tembaga 3 fase + netral', en: 'Three-phase copper busbar + neutral' },
    icon: 'label' as const,
    text: '',
  },
];

const BUBBLES = [
  { id: 'Tegangan 380V stabil ⚡', en: 'Voltage steady at 380V ⚡' },
  { id: 'Mau tes rangkaian? Klik di sini!', en: 'Want to test a circuit? Click here!' },
  { id: 'K3 dulu, baru kerja. Helm & safety glasses ✓', en: 'Safety first. Helmet & glasses ✓' },
];

export default function Hero() {
  const { t, lang } = useApp();
  const [bubble, setBubble] = useState(0);
  const [touched, setTouched] = useState(false);
  const [raised, setRaised] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setBubble((v) => (v + 1) % BUBBLES.length), 4200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="hero-scene" id="hero" aria-labelledby="sceneTitle">
      {/* ---------- Layer 1: real control-room photograph ---------- */}
      <div className="scene-bg" aria-hidden="true">
        <div className="scene-photo" style={{ backgroundImage: `url('${PHOTO}')` }} />
        <div className="scene-shade" />
        <div className="scene-grid" />
      </div>

      {/* ---------- Hand-drawn hotspots pinned to the photo ---------- */}
      <div className="scene-hotspots">
        {HOTSPOTS.map((spot) => (
          <button
            key={spot.id}
            type="button"
            className={`hotspot hotspot-${spot.icon}`}
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            aria-label={lang === 'id' ? spot.label.id : spot.label.en}
          >
            <span className="hotspot-mark" aria-hidden="true">
              {spot.icon === 'bolt' && (
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M13 2L4 13h6l-1 9 9-12h-6l1-8z"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {spot.icon === 'wave' && <Wave className="hotspot-wave" />}
              {spot.icon === 'label' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="7" width="18" height="10" rx="2" />
                  <path d="M7 11h4M7 14h7" strokeLinecap="round" />
                </svg>
              )}
            </span>
            {spot.text && <span className="hotspot-text">{spot.text}</span>}
            <span className="hotspot-tip" role="tooltip">
              {lang === 'id' ? spot.label.id : spot.label.en}
            </span>
          </button>
        ))}
      </div>

      {/* ---------- Layer 2 + copy ---------- */}
      <div className="container scene-inner">
        <div
          className="scene-stage"
          onMouseEnter={() => setTouched(true)}
          onMouseLeave={() => setTouched(false)}
        >
          <button
            type="button"
            className={`scene-bubble${bubble === 1 ? ' is-cta' : ''}`}
            onClick={() => {
              document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            <span className="scene-bubble-text">
              {lang === 'id' ? BUBBLES[bubble].id : BUBBLES[bubble].en}
            </span>
            <span className="scene-bubble-dots" aria-hidden="true">
              {BUBBLES.map((b, i) => (
                <i key={b.id} className={i === bubble ? 'on' : ''} />
              ))}
            </span>
          </button>

          <button
            type="button"
            className="scene-character"
            aria-label={lang === 'id' ? 'Sapa teknisi' : 'Greet the engineer'}
            onClick={() => {
              setRaised((v) => !v);
              setBubble((v) => (v + 1) % BUBBLES.length);
            }}
          >
            <EngineerCharacter2D active={touched || raised} />
          </button>
        </div>

        <div className="scene-copy">
          <span className="scene-kicker">
            <span className="scene-kicker-dot" />
            {t('hero.kicker')}
          </span>

          <h1 className="scene-title" id="sceneTitle">
            <span>Powering</span>
            <span className="scene-title-accent">Progress,</span>
            <span className="scene-title-soft">Safely.</span>
          </h1>

          <p className="scene-desc">{t('hero.desc')}</p>

          <div className="scene-cta">
            <a href="#simulator" className="btn btn-primary">
              {lang === 'id' ? 'Mulai Simulasi' : 'Start simulation'}
              <Arrow />
            </a>
            <a href="#komponen" className="btn btn-secondary">
              {lang === 'id' ? 'Eksplorasi Komponen' : 'Explore components'}
            </a>
          </div>

          <ul className="scene-facts">
            <li>
              <span className="scene-fact-code">PUIL</span> 2021
            </li>
            <li>
              <span className="scene-fact-code">IEC</span> 60364
            </li>
            <li>
              <span className="scene-fact-code">NFPA</span> 70E
            </li>
          </ul>
        </div>
      </div>

      {/* ---------- Layer 3: foreground console ---------- */}
      <div className="scene-desk" aria-hidden="true">
        <div className="desk-top" />
        <div className="desk-body">
          <div className="desk-screens">
            <div className="desk-screen">
              <Wave className="desk-wave" />
              <span className="desk-screen-label">AC 380V · 50Hz</span>
            </div>
            <div className="desk-screen">
              <div className="desk-bars">
                <i style={{ height: '38%' }} />
                <i style={{ height: '62%' }} />
                <i style={{ height: '48%' }} />
                <i style={{ height: '78%' }} />
                <i style={{ height: '55%' }} />
              </div>
              <span className="desk-screen-label">LOAD 72%</span>
            </div>
            <div className="desk-screen">
              <div className="desk-gauge">
                <span className="desk-gauge-needle" />
              </div>
              <span className="desk-screen-label">PF 0.96</span>
            </div>
          </div>
          <div className="desk-controls">
            <span className="desk-knob" />
            <span className="desk-knob" />
            <span className="desk-knob" />
            <span className="desk-led" />
            <span className="desk-plate">MAIN PANEL · EE-01</span>
          </div>
        </div>
      </div>

      <div className="container scene-meta">
        <a href="#tentang" className="scene-scroll">
          <span className="scroll-mouse">
            <span className="scroll-wheel" />
          </span>
          <span className="scroll-label">{t('hero.scroll')}</span>
        </a>
        <span className="scene-live">
          <i />
          LIVE · 380V
        </span>
      </div>
    </section>
  );
}
