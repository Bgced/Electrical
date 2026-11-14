'use client';

import { useEffect, useState } from 'react';

const NAV = [
  { label: 'TENTANG', href: '#tentang' },
  { label: 'SIMULATOR', href: '#simulator' },
  { label: 'VISUAL 3D', href: '#visual3d' },
  { label: 'KOMPONEN', href: '#komponen' },
  { label: 'PROYEK', href: '#proyek' },
  { label: 'DATA TEKNIS', href: '#spesifikasi' },
];

export default function Header() {
  const [clock, setClock] = useState('--:--:--');
  const [menu, setMenu] = useState(false);

  // the clock is client-only: server markup never contains a time
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString('en-GB', {
          hour12: false,
          timeZone: 'Asia/Jakarta',
        }),
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu]);

  return (
    <header className="topbar">
      <a href="#hero" className="topbar-brand" aria-label="Electrical Engineering — beranda">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M13.2 2 4 13.4h6.1L9.6 22 20 10.2h-6.3L13.2 2Z" fill="currentColor" />
        </svg>
        <span>
          Electrical<em>Engineering</em>
        </span>
      </a>

      <nav className="topbar-nav" aria-label="Navigasi utama">
        {NAV.map((item) => (
          <a key={item.href} href={item.href} className="topbar-link">
            {item.label}
          </a>
        ))}
        <span className="topbar-clock" aria-label="Waktu Indonesia Barat">
          {clock} <em>WIB</em>
        </span>
      </nav>

      <div className="topbar-mobile">
        <span className="topbar-clock topbar-clock--mobile" aria-label="Waktu Indonesia Barat">
          {clock}
        </span>
        <button
          type="button"
          className="topbar-menu"
          aria-expanded={menu}
          aria-label="Buka menu"
          onClick={() => setMenu((v) => !v)}
        >
          {menu ? 'TUTUP' : 'MENU'}
        </button>
      </div>

      {menu && (
        <div className="topbar-sheet" role="dialog" aria-label="Menu navigasi">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="topbar-sheet-link"
              onClick={() => setMenu(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
