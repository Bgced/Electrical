'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/lib/app-context';
import { getGreeting } from '@/lib/i18n';

export default function IntroOverlay() {
  const { t } = useApp();
  const [hidden, setHidden] = useState(true);
  const [greeting, setGreeting] = useState('Selamat Datang');

  useEffect(() => {
    const seen = localStorage.getItem('introSeen');
    setHidden(Boolean(seen));

    const tick = () => setGreeting(`${getGreeting(new Date().getHours())}!`);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const enter = () => {
    localStorage.setItem('introSeen', '1');
    setHidden(true);

    // Start the background track after the user gesture (browser autoplay rule)
    const audio = document.getElementById('bgMusic') as HTMLAudioElement | null;
    if (audio) {
      audio.volume = 0.6;
      audio.play().catch(() => {});
    }
  };

  return (
    <div className={`intro-overlay${hidden ? ' hidden' : ''}`} id="introOverlay">
      <div className="intro-content">
        <span className="intro-kicker">Electrical Engineering</span>
        <h1 className="intro-title">{greeting}</h1>
        <p className="intro-desc">{t('hero.desc')}</p>

        <div className="intro-points">
          <span>{t('ql.services')}</span>
          <span>{t('ql.components')}</span>
          <span>{t('services.renewable.title')}</span>
          <span>{t('nav.safety')}</span>
        </div>

        <p className="intro-note">
          Dengan melanjutkan, Anda menyatakan telah membaca dan memahami isi website ini.
        </p>

        <button className="btn btn-primary intro-btn" onClick={enter}>
          Saya Sudah Baca — Lanjutkan
        </button>
      </div>
    </div>
  );
}