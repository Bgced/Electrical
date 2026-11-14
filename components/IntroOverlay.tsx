'use client';

import { useCallback, useEffect, useState } from 'react';
import { useApp } from '@/lib/app-context';
import { useAudio } from '@/lib/audio';
import { getGreeting } from '@/lib/i18n';

function BoltMark() {
  return (
    <svg className="intro-bolt" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 2L3 14H11L11 22L21 10H13V2Z" fill="currentColor" />
    </svg>
  );
}

export default function IntroOverlay() {
  const { t, lang } = useApp();
  const { setSoundEnabled } = useAudio();
  const [hidden, setHidden] = useState(true);
  const [greeting, setGreeting] = useState('Selamat Datang');

  const close = useCallback(
    (withSound: boolean) => {
      localStorage.setItem('introSeen', '1');
      setSoundEnabled(withSound);
      setHidden(true);
    },
    [setSoundEnabled]
  );

  useEffect(() => {
    const seen = localStorage.getItem('introSeen');
    setHidden(Boolean(seen));

    const tick = () => setGreeting(getGreeting(new Date().getHours()));
    tick();
    const id = setInterval(tick, 60_000);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !localStorage.getItem('introSeen')) close(true);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearInterval(id);
      window.removeEventListener('keydown', onKey);
    };
  }, [close]);

  return (
    <div className={`intro-overlay${hidden ? ' hidden' : ''}`} id="introOverlay" aria-hidden={hidden}>
      <div className="intro-glow" aria-hidden="true" />
      <div className="intro-content">
        <span className="intro-brand">
          <span className="intro-brand-mark">
            <BoltMark />
          </span>
          Electrical Engineering
        </span>

        <span className="intro-kicker">{t('hero.kicker')}</span>
        <h1 className="intro-title">{greeting}</h1>
        <p className="intro-desc">{t('hero.desc')}</p>

        <div className="intro-points">
          <span>{t('ql.services')}</span>
          <span>{t('ql.components')}</span>
          <span>{t('services.renewable.title')}</span>
          <span>{t('nav.safety')}</span>
        </div>

        <div className="intro-actions">
          <button className="btn btn-primary intro-btn" onClick={() => close(true)}>
            {lang === 'id' ? 'Masuk & Nyalakan Musik' : 'Enter with music'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="intro-quiet" onClick={() => close(false)}>
            {lang === 'id' ? 'Masuk tanpa suara' : 'Enter without sound'}
          </button>
        </div>

        <p className="intro-note">
          {lang === 'id'
            ? 'Dengan melanjutkan, Anda menyatakan telah membaca dan memahami isi website ini. Musik latar bisa diubah kapan saja lewat ikon di header.'
            : 'By continuing you confirm you have read and understood this website. Background music can be changed anytime from the header icon.'}
        </p>
      </div>
    </div>
  );
}
