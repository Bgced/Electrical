'use client';

import { useApp } from '@/lib/app-context';
import type { I18nKey } from '@/lib/i18n';

export default function Footer() {
  const { t } = useApp();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <a href="/" className="logo">
              <svg className="logo-icon" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14H11L11 22L21 10H13V2Z" fill="currentColor" />
              </svg>
              <span className="logo-text">Electrical Engineering</span>
            </a>
            <p className="footer-tag">{t('footer.tag')}</p>
          </div>

          <div className="footer-links">
            {(
              [
                ['nav.about', '#tentang'],
                ['nav.services', '#layanan'],
                ['nav.projects', '#proyek'],
                ['nav.specs', '#spesifikasi'],
                ['nav.simulator', '#simulator'],
                ['nav.faq', '#faq'],
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
        </div>
      </div>
    </footer>
  );
}