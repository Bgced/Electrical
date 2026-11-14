'use client';

import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/lib/app-context';
import type { I18nKey } from '@/lib/i18n';

const LINKS: { href: string; key: I18nKey; icon: string }[] = [
  { href: '#layanan', key: 'ql.services', icon: 'bolt' },
  { href: '#proyek', key: 'ql.projects', icon: 'grid' },
  { href: '#komponen', key: 'ql.components', icon: 'chip' },
  { href: '#visual3d', key: 'ql.three', icon: 'cube' },
  { href: '#simulator', key: 'ql.simulator', icon: 'clock' },
  { href: '#konverter', key: 'ql.tools', icon: 'calc' },
  { href: 'https://wa.me/6281218554350', key: 'ql.contact', icon: 'chat' },
];

function Icon({ name }: { name: string }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
  } as const;

  switch (name) {
    case 'bolt':
      return (
        <svg {...common}>
          <path d="M13 2L3 14H11L11 22L21 10H13V2Z" />
        </svg>
      );
    case 'grid':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9h18M8 4v5" />
        </svg>
      );
    case 'chip':
      return (
        <svg {...common}>
          <rect x="6" y="6" width="12" height="12" rx="2" />
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
        </svg>
      );
    case 'cube':
      return (
        <svg {...common}>
          <path d="M12 2l9 5v10l-9 5-9-5V7z" />
          <path d="M12 22V12M3 7l9 5 9-5" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 'calc':
      return (
        <svg {...common}>
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M8 6h8M8 11h2M12 11h2M16 11h.01M8 15h2M12 15h2M16 15h.01M8 19h6" />
        </svg>
      );
    case 'chat':
      return (
        <svg {...common}>
          <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 12.5 3a8.4 8.4 0 0 1 8.5 8.5z" />
        </svg>
      );
    default:
      return null;
  }
}

export function Stats() {
  const { t } = useApp();
  const [nums, setNums] = useState([0, 0, 0, 0]);
  const wrapRef = useRef<HTMLDivElement>(null);

  const items = [
    { target: 150, suffix: '+' },
    { target: 12, suffix: ' MW' },
    { target: 100, suffix: '%' },
    { target: 24, suffix: '/7' },
  ];

  const labels: I18nKey[] = [
    'stats.projects',
    'stats.capacity',
    'stats.safety',
    'stats.support',
  ];

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let done = false;

    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || done) return;
        done = true;
        obs.disconnect();

        items.forEach((item, i) => {
          const dur = 1200;
          const t0 = performance.now();
          const step = (now: number) => {
            const p = Math.min((now - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setNums((prev) => {
              const copy = [...prev];
              copy[i] = Math.floor(eased * item.target);
              return copy;
            });
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.3 }
    );

    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="stats">
      <div className="container">
        <div className="stats-inner" ref={wrapRef}>
          {labels.map((key, i) => (
            <div className="stat" key={key}>
              <span className="stat-num">
                {nums[i]}
                {items[i].suffix}
              </span>
              <span className="stat-label">{t(key)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function QuickLinks() {
  const { t } = useApp();

  return (
    <section className="quicklinks">
      <div className="container">
        <div className="ql-grid">
          {LINKS.map((l) => (
            <a
              key={l.key}
              href={l.href}
              className="ql-item"
              {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <span className="ql-icon">
                <Icon name={l.icon} />
              </span>
              <span className="ql-label">{t(l.key)}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Insights() {
  const { t } = useApp();

  return (
    <section id="wawasan" className="block">
      <div className="container">
        <div className="block-head">
          <span className="block-label">{t('ins.label')}</span>
          <span className="block-line" />
        </div>

        <div className="ins-layout">
          <a href="#komponen" className="ins-feature">
            <div className="ins-feature-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="foto/panel-distribusi.jpg" alt="Panel distribusi" loading="lazy" />
              <span className="ins-feature-tag">{t('ins.tag1')}</span>
            </div>
            <div className="ins-feature-body">
              <span className="ins-date">{t('ins.date1')}</span>
              <h3>{t('ins.t1')}</h3>
              <p>{t('ins.d1')}</p>
              <span className="ins-more">{t('ins.read')}</span>
            </div>
          </a>

          <div className="ins-list">
            {(
              [
                ['ins.t2', 'ins.d2', '13 Nov 2026', '#komponen'],
                ['ins.t3', 'ins.d3', '11 Nov 2026', '#komponen'],
                ['ins.t4', 'ins.d4', '9 Nov 2026', '#spesifikasi'],
                ['ins.t5', 'ins.d5', '7 Nov 2026', '#konverter'],
              ] as [I18nKey, I18nKey, string, string][]
            ).map(([title, desc, date, href]) => (
              <a key={title} href={href} className="ins-item">
                <span className="ins-date">{date}</span>
                <h4>{t(title)}</h4>
                <p>{t(desc)}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}