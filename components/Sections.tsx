'use client';

import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/lib/app-context';
import SafeImg from '@/components/SafeImg';
import { asset } from '@/lib/assets';
import type { I18nKey } from '@/lib/i18n';

function SectionHead({ label }: { label: I18nKey }) {
  const { t } = useApp();
  return (
    <div className="block-head">
      <span className="block-label">{t(label)}</span>
      <span className="block-line" />
    </div>
  );
}

/* ---------------- Video ---------------- */
const VIDEO_SRC = asset('/video/plts-pertamina-rokan.mp4');
const VIDEO_POSTER = asset('/video/plts-pertamina-rokan.jpg');

export function VideoBand() {
  const { t } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  // Autoplay can be refused (Safari low-power, Chrome with autoplay blocked,
  // background tab). There is no play button by design, so a refused band
  // simply shows the poster still and retries itself on the next opportunity.
  const [blocked, setBlocked] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    el.muted = true;
    el.defaultMuted = true;
    el.volume = 0;

    let inView = true;
    let disposed = false;

    const play = () => {
      if (disposed || !inView) return;
      const started = el.play();
      if (started && typeof started.then === 'function') {
        started.then(() => setBlocked(false)).catch(() => setBlocked(true));
      }
    };

    const onError = () => setFailed(true);
    // Chromium pauses media in hidden tabs and never resumes it by itself.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') play();
    };

    // `preload` alone leaves the element cold until something asks for data.
    el.load();
    el.addEventListener('error', onError);
    el.addEventListener('loadeddata', play);
    document.addEventListener('visibilitychange', onVisibility);
    play();

    // The band is 80vh tall, so it is off-screen most of the time. Only decode
    // it while it can actually be seen.
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            inView = entry.isIntersecting;
            if (inView) play();
            else el.pause();
          });
        },
        { threshold: 0.2 }
      );
      observer.observe(el);
    }

    return () => {
      disposed = true;
      el.removeEventListener('error', onError);
      el.removeEventListener('loadeddata', play);
      document.removeEventListener('visibilitychange', onVisibility);
      observer?.disconnect();
    };
  }, []);

  return (
    <section
      className="video-section"
      id="video"
      style={{ backgroundImage: `url(${VIDEO_POSTER})` }}
    >
      {!failed && (
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          poster={VIDEO_POSTER}
          className={blocked ? 'is-idle' : undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disableRemotePlayback
          aria-hidden="true"
          onError={() => setFailed(true)}
        />
      )}
      <div className="video-overlay">
        <div className="container">
          <div className="video-info">
            <span className="video-label">ENERGI &amp; INFRASTRUKTUR</span>
            <h2 className="video-title">Transisi Energi &amp; Infrastruktur Skala Industri</h2>
            <p className="video-desc">
              Penerapan sistem kelistrikan andal untuk pembangkit energi terbarukan dan utilitas modern.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- About ---------------- */
const PILLARS = [
  {
    title: 'Distribusi & Gardu Tenaga',
    desc: 'Panel LVMDP/SDP, seleksi MCCB, dan penyeimbangan beban fasa R-S-T.',
    code: 'DIST-01',
  },
  {
    title: 'Otomasi & Kendali Industri',
    desc: 'PLC, SCADA, HMI, dan proteksi motor induksi 3 fasa.',
    code: 'AUTO-02',
  },
  {
    title: 'Elektronika Daya & Konversi',
    desc: 'Inverter, catu daya DC, dan optimalisasi efisiensi energi.',
    code: 'PWR-03',
  },
  {
    title: 'Audit K3 & Pembumian',
    desc: 'Pengujian pentanahan < 5 Ω, thermography, dan prosedur LOTO.',
    code: 'K3-04',
  },
];

export function About() {
  const { t } = useApp();
  return (
    <section id="tentang" className="block">
      <div className="container">
        <SectionHead label="about.label" />
        <div className="about-asym">
          <div className="about-lead">
            <h2 className="about-title">
              Rekayasa Kelistrikan <span>Presisi</span> dari Konsep hingga Komisioning
            </h2>
            <p className="about-desc">{t('about.desc1')}</p>
            <p className="about-desc">{t('about.desc2')}</p>
            <div className="about-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" />
              </svg>
              <span>{t('about.badge')}</span>
            </div>

            <aside className="about-profile">
            <div className="about-profile-photo">
              <SafeImg
                src="/foto/engineer-workspace.jpg"
                fallback="/foto/pekerja-listrik.jpg"
                alt="Area kerja panel distribusi"
              />
              <span className="about-profile-status">
                <i /> SIAP KOMISIONING
              </span>
            </div>
            <div className="about-profile-body">
              <span className="about-profile-role">ENGINEERING &amp; SIMULATION DIVISION</span>
              <h3>Cekael Electrical Lab</h3>
              <p>
                Berfokus pada perancangan sistem distribusi tenaga listrik, otomasi kendali industri,
                dan simulasi proteksi berbasis standar PUIL 2021 &amp; IEC 60364.
              </p>
              <ul className="about-profile-meta">
                <li>
                  <b>24+</b> proyek
                </li>
                <li>
                  <b>12 MW</b> kapasitas
                </li>
                <li>
                  <b>100%</b> PUIL
                </li>
              </ul>
            </div>
            </aside>
          </div>

          <div className="about-right">
            <span className="about-right-label">EMPAT PILAR KOMPETENSI</span>
            <div className="about-pillars">
              {PILLARS.map((p) => (
                <article className="about-pillar" key={p.title}>
                  <span className="about-pillar-code">{p.code}</span>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Services ---------------- */
const SERVICES: { title: I18nKey; desc: I18nKey; icon: string }[] = [
  { title: 'services.power.title', desc: 'services.power.desc', icon: 'bolt' },
  { title: 'services.control.title', desc: 'services.control.desc', icon: 'gear' },
  { title: 'services.renewable.title', desc: 'services.renewable.desc', icon: 'wave' },
  { title: 'services.maintenance.title', desc: 'services.maintenance.desc', icon: 'shield' },
];

function ServiceIcon({ name }: { name: string }) {
  const common = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 } as const;
  if (name === 'bolt')
    return (
      <svg {...common}>
        <path d="M13 2L3 14H11L11 22L21 10H13V2Z" />
      </svg>
    );
  if (name === 'gear')
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6M1 12h6m6 0h6" />
      </svg>
    );
  if (name === 'wave')
    return (
      <svg {...common}>
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <path d="M6 12h4l2-3v6l2-3h4" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function Services() {
  const { t } = useApp();
  return (
    <section id="layanan" className="block">
      <div className="container">
        <SectionHead label="services.label" />
        <div className="cards">
          {SERVICES.map((s) => (
            <div className="card" key={s.title}>
              <div className="card-icon">
                <ServiceIcon name={s.icon} />
              </div>
              <h3>{t(s.title)}</h3>
              <p>{t(s.desc)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Industries ---------------- */
const INDUSTRIES: { title: I18nKey; desc: I18nKey }[] = [
  { title: 'industries.manufacturing.title', desc: 'industries.manufacturing.desc' },
  { title: 'industries.oil.title', desc: 'industries.oil.desc' },
  { title: 'industries.building.title', desc: 'industries.building.desc' },
  { title: 'industries.telecom.title', desc: 'industries.telecom.desc' },
];

export function Industries() {
  const { t } = useApp();
  return (
    <section id="industri" className="block">
      <div className="container">
        <SectionHead label="industries.label" />
        <div className="list">
          {INDUSTRIES.map((item, i) => (
            <div className="list-item" key={item.title}>
              <span className="list-num">{String(i + 1).padStart(2, '0')}</span>
              <div className="list-content">
                <h3>{t(item.title)}</h3>
                <p>{t(item.desc)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Safety ---------------- */
const SAFETY: { title: I18nKey; desc: I18nKey; icon: string }[] = [
  {
    title: 'safety.loto.title',
    desc: 'safety.loto.desc',
    icon: 'lock',
  },
  {
    title: 'safety.ppe.title',
    desc: 'safety.ppe.desc',
    icon: 'clock',
  },
  {
    title: 'safety.earthing.title',
    desc: 'safety.earthing.desc',
    icon: 'bolt',
  },
  {
    title: 'safety.arc.title',
    desc: 'safety.arc.desc',
    icon: 'arc',
  },
];

export function Safety() {
  const { t } = useApp();
  return (
    <section id="keselamatan" className="block">
      <div className="container">
        <SectionHead label="safety.label" />
        <div className="safety-grid">
          {SAFETY.map((s) => (
            <div className="safety-item" key={s.title}>
              <div className="safety-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {s.icon === 'lock' ? (
                    <>
                      <rect x="4" y="10" width="16" height="10" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </>
                  ) : s.icon === 'clock' ? (
                    <>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4l3 3" />
                    </>
                  ) : s.icon === 'bolt' ? (
                    <path d="M13 2L3 14H11L11 22L21 10H13V2Z" />
                  ) : (
                    <path d="M2 12h6l2-4 4 8 2-4h6" />
                  )}
                </svg>
              </div>
              <div>
                <h3>{t(s.title)}</h3>
                <p>{t(s.desc)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}