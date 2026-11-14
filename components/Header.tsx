'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useApp } from '@/lib/app-context';
import type { I18nKey } from '@/lib/i18n';

const NAV: { href: string; key: I18nKey }[] = [
  { href: '/#tentang', key: 'nav.about' },
  { href: '/#layanan', key: 'nav.services' },
  { href: '/#industri', key: 'nav.industries' },
  { href: '/#proyek', key: 'nav.projects' },
  { href: '/#proses', key: 'nav.process' },
  { href: '/#visual3d', key: 'nav.three' },
  { href: '/#galeri', key: 'nav.gallery' },
  { href: '/#komponen', key: 'nav.comp' },
  { href: '/#wawasan', key: 'nav.insights' },
  { href: '/#spesifikasi', key: 'nav.specs' },
  { href: '/#keselamatan', key: 'nav.safety' },
  { href: '/#simulator', key: 'nav.simulator' },
  { href: '/#faq', key: 'nav.faq' },
];

function Bolt({ className = 'logo-bolt' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M13 2L3 14H11L11 22L21 10H13V2Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Header() {
  const { t, theme, toggleTheme, lang, toggleLang } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [clock, setClock] = useState('--:--:--');
  const [online, setOnline] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const tick = () => {
      setClock(new Date().toLocaleTimeString('id-ID', { hour12: false }));
      setOnline(navigator.onLine);
    };
    tick();
    const id = setInterval(tick, 1000);
    window.addEventListener('online', tick);
    window.addEventListener('offline', tick);
    return () => {
      clearInterval(id);
      window.removeEventListener('online', tick);
      window.removeEventListener('offline', tick);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    const open = drawerOpen;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <>
      <header className={`header${scrolled ? ' scrolled' : ''}`}>
        <div className="container">
          <div className="header-inner">
            <Link href="/" className="logo" aria-label="Electrical Engineering">
              <span className="logo-bolt-wrap">
                <span className="logo-bolt-glow" />
                <Bolt />
              </span>
              <span className="logo-text-wrap">
                <span className="logo-text">Electrical Engineering</span>
                <span className="logo-domain">ee-engineering.id</span>
              </span>
            </Link>

            <nav className="nav-desktop">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link">
                  {t(item.key)}
                </Link>
              ))}
            </nav>

            <div className="header-actions">
              <div className="status-cluster">
                <span className={`status-pill${online ? '' : ' offline'}`}>
                  <span className="status-dot" />
                  <span>{online ? 'Online' : 'Offline'}</span>
                </span>
                <span className="clock">{clock}</span>
              </div>

              <button
                id="infoToggle"
                className="btn-icon info-toggle-btn"
                aria-label="Info Teknis"
                onClick={() => setDrawerOpen((v) => !v)}
              >
                <span className="info-icon">i</span>
              </button>

              <button className="btn-icon" aria-label="Tema" onClick={toggleTheme}>
                <span className="theme-icon">{theme === 'dark' ? '☾' : '☀'}</span>
              </button>

              <button className="btn-icon" aria-label="Bahasa" onClick={toggleLang}>
                <span className="lang-text">{lang === 'id' ? 'ID' : 'EN'}</span>
              </button>

              <button
                className={`hamburger${menuOpen ? ' active' : ''}`}
                aria-label="Menu"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <div className="mobile-nav">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="mobile-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              {t(item.key)}
            </Link>
          ))}
        </div>
      </div>

      <div
        className={`sidebar-backdrop${drawerOpen ? ' show' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      <aside id="sidebar" className={`sidebar${drawerOpen ? ' open' : ''}`}>
        <SidebarBody onClose={() => setDrawerOpen(false)} />
      </aside>
    </>
  );
}

function SidebarBody({ onClose }: { onClose: () => void }) {
  const { t } = useApp();

  const groups: { label: I18nKey; items: I18nKey[] }[] = [
    {
      label: 'info.standards',
      items: ['info.s1', 'info.s2', 'info.s3', 'info.s4'],
    },
    {
      label: 'info.equipment',
      items: ['info.e1', 'info.e2', 'info.e3', 'info.e4', 'info.e5'],
    },
    {
      label: 'info.learn',
      items: ['info.l1', 'info.l2', 'info.l3', 'info.l4', 'info.l5', 'info.l6'],
    },
    {
      label: 'info.contact',
      items: ['info.c1', 'info.c2'],
    },
  ];

  return (
    <div className="sidebar-box">
      <div className="sidebar-head">
        <span className="sidebar-title">{t('sidebar.title')}</span>
        <div className="sidebar-head-right">
          <span className="sidebar-badge">{t('sidebar.badge')}</span>
          <button className="sidebar-close" aria-label="Tutup" onClick={onClose}>
            &times;
          </button>
        </div>
      </div>

      {groups.map((g) => (
        <div className="info-group" key={g.label}>
          <h4 className="info-label">{t(g.label)}</h4>
          <ul className="info-list">
            {g.items.map((it) => (
              <li key={it}>{t(it)}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}