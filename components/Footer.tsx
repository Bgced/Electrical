'use client';

import Link from 'next/link';
import { useApp } from '@/lib/app-context';
import { useAudio, OPEN_INTRO_EVENT } from '@/lib/audio';
import type { I18nKey } from '@/lib/i18n';

export default function Footer() {
  const { t, lang } = useApp();
  const { enabled } = useAudio();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <Link href="/" className="logo">
              <svg className="logo-icon" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14H11L11 22L21 10H13V2Z" fill="currentColor" />
              </svg>
              <span className="logo-text">Electrical Engineering</span>
            </Link>
            <p className="footer-tag">{t('footer.tag')}</p>
          </div>

          <div className="footer-links">
            {(
              [
                ['nav.about', '#tentang'],
                ['nav.simulator', '#simulator'],
                ['nav.visual', '#visual3d'],
                ['nav.comp', '#komponen'],
                ['nav.projects', '#proyek'],
                ['nav.specs', '#spesifikasi'],
                ['nav.contact', '#kontak'],
              ] as [I18nKey, string][]
            ).map(([key, href]) => (
              <a key={key} href={href} className="footer-link">
                {t(key)}
              </a>
            ))}
          </div>

          <div className="footer-social">
            <a href="mailto:cedrickilian@uny.ac.id" className="footer-link">
              {t('footer.email')}
            </a>
            <a href="https://github.com/Bgced" className="footer-link" target="_blank" rel="noopener noreferrer">
              {t('footer.github')}
            </a>
            <a href="https://instagram.com/cekaaell" className="footer-link" target="_blank" rel="noopener noreferrer">
              {t('footer.instagram')}
            </a>
            <a href="https://cekael.vercel.app" className="footer-link" target="_blank" rel="noopener noreferrer">
              {t('footer.portfolio')}
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-copy">{t('footer.copy')}</span>
          <button
            type="button"
            className="footer-sound"
            onClick={() => window.dispatchEvent(new Event(OPEN_INTRO_EVENT))}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M4 9v6h3.5L13 19V5L7.5 9H4z" strokeLinejoin="round" />
              {enabled ? (
                <path d="M16.5 8.5a5 5 0 0 1 0 7" strokeLinecap="round" />
              ) : (
                <path d="M17 9.5l4 4M21 9.5l-4 4" strokeLinecap="round" />
              )}
            </svg>
            <span>{lang === 'id' ? 'Preferensi suara' : 'Sound preference'}</span>
            <span className="footer-sound-state">
              {enabled ? (lang === 'id' ? 'musik' : 'music') : lang === 'id' ? 'senyap' : 'silent'}
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}