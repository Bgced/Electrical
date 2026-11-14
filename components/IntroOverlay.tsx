'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '@/lib/app-context';
import { useAudio, OPEN_INTRO_EVENT } from '@/lib/audio';
import { getGreeting } from '@/lib/i18n';

function BoltMark() {
  return (
    <svg className="intro-bolt" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13 2L3 14H11L11 22L21 10H13V2Z" fill="currentColor" />
    </svg>
  );
}

function SoundOn() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M4 9v6h3.5L13 19V5L7.5 9H4z" strokeLinejoin="round" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" strokeLinecap="round" />
    </svg>
  );
}

function SoundOff() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M4 9v6h3.5L13 19V5L7.5 9H4z" strokeLinejoin="round" />
      <path d="M17 9.5l4 4M21 9.5l-4 4" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The one and only place sound is decided. It shows on the first visit, records
 * the answer, and then stays out of the way — there is no player anywhere else
 * in the site. The footer's "sound preference" link re-opens it on purpose, so a
 * visitor is never trapped by a wrong first click.
 */
export default function IntroOverlay() {
  const { t, lang } = useApp();
  const { enabled, setSoundEnabled } = useAudio();
  const [open, setOpen] = useState(false);
  const [greeting, setGreeting] = useState('Selamat Datang');
  const firstOption = useRef<HTMLButtonElement>(null);

  const choose = useCallback(
    (withSound: boolean) => {
      localStorage.setItem('introSeen', '1');
      setSoundEnabled(withSound);
      setOpen(false);
    },
    [setSoundEnabled]
  );

  useEffect(() => {
    setOpen(localStorage.getItem('introSeen') !== '1');

    const tick = () => setGreeting(getGreeting(new Date().getHours()));
    tick();
    const id = setInterval(tick, 60_000);

    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') choose(enabled);
    };
    window.addEventListener(OPEN_INTRO_EVENT, onOpen);
    window.addEventListener('keydown', onKey);
    return () => {
      clearInterval(id);
      window.removeEventListener(OPEN_INTRO_EVENT, onOpen);
      window.removeEventListener('keydown', onKey);
    };
    // `enabled` is read inside onKey only; re-binding on every change is cheap.
  }, [choose, enabled]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      const id = window.setTimeout(() => firstOption.current?.focus(), 320);
      return () => window.clearTimeout(id);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div
      className={`intro-overlay${open ? '' : ' hidden'}`}
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
      aria-labelledby="introTitle"
    >
      <div className="intro-glow" aria-hidden="true" />
      <div className="intro-grid" aria-hidden="true" />

      <div className="intro-content">
        <span className="intro-brand">
          <span className="intro-brand-mark">
            <BoltMark />
          </span>
          Electrical Engineering
          <span className="intro-brand-domain">ee-engineering.id</span>
        </span>

        <span className="intro-kicker">{t('hero.kicker')}</span>
        <h1 className="intro-title" id="introTitle">
          {greeting}
        </h1>
        <p className="intro-desc">{t('hero.desc')}</p>

        <ul className="intro-points">
          <li>{t('ql.services')}</li>
          <li>{t('ql.components')}</li>
          <li>{t('services.renewable.title')}</li>
          <li>{t('nav.safety')}</li>
        </ul>

        <div className="intro-choice">
          <div className="intro-choice-head">
            <span className="intro-choice-label">
              {lang === 'id' ? 'Pilih pengalaman Anda' : 'Choose your experience'}
            </span>
            <span className="intro-choice-hint">
              {lang === 'id' ? 'Sekali pilih, tersimpan otomatis' : 'One choice, remembered'}
            </span>
          </div>

          <div className="intro-options">
            <button
              type="button"
              ref={firstOption}
              className="intro-option intro-option-primary"
              onClick={() => choose(true)}
            >
              <span className="intro-option-icon">
                <SoundOn />
              </span>
              <span className="intro-option-body">
                <span className="intro-option-tag">
                  {lang === 'id' ? 'Disarankan' : 'Recommended'}
                </span>
                <span className="intro-option-title">
                  {lang === 'id' ? 'Masuk dengan musik' : 'Enter with music'}
                </span>
                <span className="intro-option-desc">
                  {lang === 'id'
                    ? 'Musik latar lembut menemani Anda menjelajah.'
                    : 'A soft soundtrack plays while you browse.'}
                </span>
              </span>
              <span className="intro-option-go" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>

            <button
              type="button"
              className="intro-option"
              onClick={() => choose(false)}
            >
              <span className="intro-option-icon">
                <SoundOff />
              </span>
              <span className="intro-option-body">
                <span className="intro-option-title">
                  {lang === 'id' ? 'Masuk tanpa musik' : 'Enter without music'}
                </span>
                <span className="intro-option-desc">
                  {lang === 'id'
                    ? 'Pengalaman senyap, tanpa suara apa pun.'
                    : 'A silent experience, no sound at all.'}
                </span>
              </span>
              <span className="intro-option-go" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          </div>
        </div>

        <p className="intro-note">
          {lang === 'id'
            ? 'Pilihan Anda tersimpan di perangkat ini dan dipakai lagi pada kunjungan berikutnya. Ingin mengganti? Buka tautan “Preferensi suara” di bagian bawah halaman.'
            : 'Your choice is stored on this device and reused on your next visit. Want to change it? Use the “Sound preference” link at the bottom of the page.'}
        </p>
      </div>
    </div>
  );
}
