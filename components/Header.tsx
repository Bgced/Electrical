'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/lib/app-context';
import type { I18nKey } from '@/lib/i18n';

type NavItem = { href: string; key: I18nKey };

/** Kept short so the bar never wraps on a 1280px laptop. */
const NAV: NavItem[] = [
  { href: '/#tentang', key: 'nav.about' },
  { href: '/#simulator', key: 'nav.simulator' },
  { href: '/#komponen', key: 'nav.comp' },
  { href: '/#proyek', key: 'nav.projects' },
  { href: '/#spesifikasi', key: 'nav.specs' },
];

const NAV_MORE: NavItem[] = [
  { href: '/#layanan', key: 'nav.services' },
  { href: '/#galeri', key: 'nav.gallery' },
  { href: '/#industri', key: 'nav.industries' },
  { href: '/#proses', key: 'nav.process' },
  { href: '/#visual3d', key: 'nav.three' },
  { href: '/#wawasan', key: 'nav.insights' },
  { href: '/#keselamatan', key: 'nav.safety' },
  { href: '/#faq', key: 'nav.faq' },
];

const ALL_NAV = [...NAV, ...NAV_MORE];

function Bolt({ className = 'logo-bolt' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Header() {
  const { t, theme, toggleTheme, lang, toggleLang } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [active, setActive] = useState('');
  const [clock, setClock] = useState('--:--:--');
  const [online, setOnline] = useState(true);
  const moreRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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

  // Scroll-spy: highlight whichever section is in view.
  useEffect(() => {
    let frame = 0;
    const ids = ALL_NAV.map((n) => n.href.split('#')[1]);
    const update = () => {
      frame = 0;
      const marker = window.scrollY + window.innerHeight * 0.28;
      let current = '';
      let currentTop = -Infinity;
      // Sections are not in nav order, so pick the deepest one above the marker.
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= marker && el.offsetTop > currentTop) {
          currentTop = el.offsetTop;
          current = id;
        }
      });
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDrawerOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    const open = drawerOpen || menuOpen;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen, menuOpen]);

  // Close the "more" menu on outside click / Escape.
  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [moreOpen]);

  const isActive = (href: string) => active === href.split('#')[1];

  return (
    <>
      <a className="skip-link" href="#konten">
        {lang === 'id' ? 'Lompat ke konten' : 'Skip to content'}
      </a>

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

            <nav
              className="nav-desktop"
              aria-label={lang === 'id' ? 'Navigasi utama' : 'Main navigation'}
            >
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link${isActive(item.href) ? ' active' : ''}`}
                  aria-current={isActive(item.href) ? 'true' : undefined}
                >
                  {t(item.key)}
                </Link>
              ))}

              <div className={`nav-more${moreOpen ? ' open' : ''}`} ref={moreRef}>
                <button
                  type="button"
                  className={`nav-link nav-more-btn${
                    NAV_MORE.some((i) => isActive(i.href)) ? ' active' : ''
                  }`}
                  aria-expanded={moreOpen}
                  aria-haspopup="true"
                  onClick={() => setMoreOpen((v) => !v)}
                >
                  {lang === 'id' ? 'Lainnya' : 'More'}
                  <Chevron />
                </button>

                <div className="nav-more-panel" role="menu">
                  {NAV_MORE.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      className={`nav-more-link${isActive(item.href) ? ' active' : ''}`}
                      onClick={() => setMoreOpen(false)}
                    >
                      {t(item.key)}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>

            <div className="header-actions">
              <div className="status-cluster">
                <span className={`status-pill${online ? '' : ' offline'}`}>
                  <span className="status-dot" />
                  <span>{online ? 'Online' : 'Offline'}</span>
                </span>
                <span className="clock">{clock}</span>
              </div>

              <a href="#kontak" className="header-cta">
                <span>{lang === 'id' ? 'Konsultasi' : 'Consult'}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              <button
                id="infoToggle"
                className="btn-icon info-toggle-btn"
                aria-label={lang === 'id' ? 'Info Teknis' : 'Technical info'}
                aria-expanded={drawerOpen}
                onClick={() => setDrawerOpen((v) => !v)}
              >
                <svg className="info-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
                </svg>
              </button>

              <button
                className="btn-icon theme-btn"
                aria-label={lang === 'id' ? 'Ganti tema' : 'Toggle theme'}
                onClick={toggleTheme}
              >
                <span className="theme-icon">{theme === 'dark' ? '☾' : '☀'}</span>
              </button>

              <button
                className="btn-icon lang-btn"
                aria-label={lang === 'id' ? 'Ganti bahasa' : 'Toggle language'}
                onClick={toggleLang}
              >
                <span className="lang-text">{lang === 'id' ? 'ID' : 'EN'}</span>
              </button>

              <button
                className={`hamburger${menuOpen ? ' active' : ''}`}
                aria-label="Menu"
                aria-expanded={menuOpen}
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
          <span className="mobile-nav-label">{lang === 'id' ? 'Navigasi' : 'Navigation'}</span>
          {ALL_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-link${isActive(item.href) ? ' active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {t(item.key)}
              <Chevron />
            </Link>
          ))}

          <div className="mobile-extra">
            <a href="#kontak" className="btn btn-primary mobile-cta" onClick={() => setMenuOpen(false)}>
              {lang === 'id' ? 'Konsultasi Gratis' : 'Free consultation'}
            </a>
            <button type="button" className="btn btn-secondary" onClick={toggleLang}>
              <span className="lang-text">{lang === 'id' ? 'ID' : 'EN'}</span>
              {lang === 'id' ? 'Bahasa Indonesia' : 'English'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={toggleTheme}>
              <span className="theme-icon">{theme === 'dark' ? '☾' : '☀'}</span>
              {theme === 'dark'
                ? lang === 'id'
                  ? 'Mode Gelap'
                  : 'Dark mode'
                : lang === 'id'
                  ? 'Mode Terang'
                  : 'Light mode'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setMenuOpen(false);
                setDrawerOpen(true);
              }}
            >
              <svg className="info-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
              </svg>
              {lang === 'id' ? 'Info Teknis' : 'Technical info'}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`sidebar-backdrop${drawerOpen ? ' show' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      <aside id="sidebar" className={`sidebar${drawerOpen ? ' open' : ''}`} aria-hidden={!drawerOpen}>
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
