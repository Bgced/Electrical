'use client';

import { useState } from 'react';
import { useApp } from '@/lib/app-context';
import type { I18nKey } from '@/lib/i18n';
import Lightbox from '@/components/Lightbox';
import SafeImg from '@/components/SafeImg';

function BlockHead({ label }: { label: I18nKey }) {
  const { t } = useApp();
  return (
    <div className="block-head">
      <span className="block-label">{t(label)}</span>
      <span className="block-line" />
    </div>
  );
}

/* ---------------- Projects ---------------- */
const PROJECTS: {
  title: I18nKey;
  desc: I18nKey;
  tag: I18nKey;
  img: string;
  fallback: string;
  meta: string[];
}[] = [
  {
    title: 'projects.p1.title',
    desc: 'projects.p1.desc',
    tag: 'projects.p1.tag',
    img: '/foto/panel-distribusi.jpg',
    fallback: '/foto/komponen-listrik.jpg',
    meta: ['400 V', '3 Phase', 'MCCB'],
  },
  {
    title: 'projects.p2.title',
    desc: 'projects.p2.desc',
    tag: 'projects.p2.tag',
    img: '/foto/audit-termal.jpg',
    fallback: '/foto/thermal-relay.jpg',
    meta: ['15 kW', 'Thermal Relay', 'Kontaktor'],
  },
  {
    title: 'projects.p3.title',
    desc: 'projects.p3.desc',
    tag: 'projects.p3.tag',
    img: '/foto/panel-plc.jpg',
    fallback: '/foto/komponen-listrik.jpg',
    meta: ['Thermal Camera', 'Thermography', 'Preventif'],
  },
];

export function Projects() {
  const { t } = useApp();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = PROJECTS.map((p) => ({ src: p.img, caption: t(p.title), fallback: p.fallback }));

  return (
    <section id="proyek" className="block">
      <div className="container">
        <BlockHead label="projects.label" />
        <div className="project-grid">
          {PROJECTS.map((p, i) => (
            <article className="project-card" key={p.title}>
              <button
                type="button"
                className="project-media"
                aria-label={`Pratinjau foto: ${t(p.title)}`}
                onClick={() => setOpenIndex(i)}
              >
                <SafeImg src={p.img} fallback={p.fallback} alt={t(p.title)} />
                <span className="project-tag">{t(p.tag)}</span>
                <span className="project-zoom" aria-hidden="true">
                  ⤢
                </span>
              </button>
              <div className="project-body">
                <h3>{t(p.title)}</h3>
                <p>{t(p.desc)}</p>
                <div className="project-meta">
                  {p.meta.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Lightbox items={items} index={openIndex} onClose={() => setOpenIndex(null)} onSelect={setOpenIndex} />
    </section>
  );
}

/* ---------------- Process ---------------- */
const PROCESS: { title: I18nKey; desc: I18nKey }[] = [
  { title: 'process.s1.title', desc: 'process.s1.desc' },
  { title: 'process.s2.title', desc: 'process.s2.desc' },
  { title: 'process.s3.title', desc: 'process.s3.desc' },
  { title: 'process.s4.title', desc: 'process.s4.desc' },
];

export function Process() {
  const { t } = useApp();
  return (
    <section id="proses" className="block">
      <div className="container">
        <BlockHead label="process.label" />
        <div className="process-grid">
          {PROCESS.map((p, i) => (
            <div className="process-step" key={p.title}>
              <span className="process-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{t(p.title)}</h3>
              <p>{t(p.desc)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Gallery ---------------- */
const GALLERY: { src: string; caption: I18nKey; wide?: boolean; fallback?: string }[] = [
  {
    src: '/foto/pekerja-listrik.jpg',
    caption: 'gallery.c1',
    wide: true,
  },
  { src: '/foto/panel-distribusi.jpg', caption: 'gallery.c2' },
  { src: '/foto/thermal-relay.jpg', caption: 'gallery.c3' },
  { src: '/foto/superkonduktor.jpg', caption: 'gallery.c4' },
  { src: '/foto/komponen-listrik.jpg', caption: 'gallery.c5' },
  { src: '/foto/komponen-listrik-2.jpg', caption: 'gallery.c6' },
  { src: '/foto/logo-pertamina.jpg', caption: 'gallery.c7' },
  { src: '/foto/audit-termal.jpg', caption: 'gallery.c8', fallback: '/foto/thermal-relay.jpg' },
  { src: '/foto/panel-plc.jpg', caption: 'gallery.c9', fallback: '/foto/komponen-listrik.jpg' },
];

export function Gallery() {
  const { t } = useApp();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = GALLERY.map((g) => ({ src: g.src, caption: t(g.caption), fallback: g.fallback }));

  return (
    <section id="galeri" className="block">
      <div className="container">
        <BlockHead label="gallery.label" />
        <div className="gallery-grid">
          {GALLERY.map((g, i) => (
            <figure key={g.src} className={`gallery-item${g.wide ? ' gallery-wide' : ''}`}>
              <button
                type="button"
                className="gallery-open"
                aria-label={`Perbesar foto: ${t(g.caption)}`}
                onClick={() => setOpenIndex(i)}
              >
                <SafeImg src={g.src} fallback={g.fallback} alt={t(g.caption)} />
              </button>
              <figcaption>{t(g.caption)}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      <Lightbox items={items} index={openIndex} onClose={() => setOpenIndex(null)} onSelect={setOpenIndex} />
    </section>
  );
}

/* ---------------- Technical data ---------------- */
const SPECS: {
  title: I18nKey;
  rows: { label: I18nKey; value: string }[];
}[] = [
  {
    title: 'spec.power.title',
    rows: [
      { label: 'spec.voltage', value: '220 / 380 V' },
      { label: 'spec.freq', value: '50 Hz' },
      { label: 'spec.phase', value: '3 Fasa + N + PE' },
      { label: 'spec.breaker', value: 'MCCB 3P' },
      { label: 'spec.earthing', value: '< 5 Ω' },
      { label: 'spec.cable', value: 'NYFGbY 4×25 mm²' },
    ],
  },
  {
    title: 'spec.motor.title',
    rows: [
      { label: 'spec.motorType', value: 'Induksi 3 fasa' },
      { label: 'spec.motorPower', value: '1,5 – 30 kW' },
      { label: 'spec.starter', value: 'DOL / Star-Delta' },
      { label: 'spec.protection', value: 'Thermal + MCB' },
      { label: 'spec.control', value: 'Kontaktor + PLC' },
      { label: 'spec.sensor', value: 'Proximity / Limit' },
    ],
  },
  {
    title: 'spec.solar.title',
    rows: [
      { label: 'spec.panel', value: 'Monocrystalline' },
      { label: 'spec.inverter', value: 'Grid-tie / Hybrid' },
      { label: 'spec.battery', value: 'LiFePO₄' },
      { label: 'spec.irradiance', value: '4,5 kWh/m²/hari' },
      { label: 'spec.derate', value: '80%' },
      { label: 'spec.monitor', value: 'IoT real-time' },
    ],
  },
];

export function Specs() {
  const { t } = useApp();
  return (
    <section id="spesifikasi" className="block">
      <div className="container">
        <BlockHead label="spec.label" />
        <div className="spec-layout">
          {SPECS.map((card) => (
            <div className="spec-card" key={card.title}>
              <h3>{t(card.title)}</h3>
              <table className="spec-table">
                <tbody>
                  {card.rows.map((r) => (
                    <tr key={r.label}>
                      <td>{t(r.label)}</td>
                      <td>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Components (philosophy) ---------------- */
const COMPONENTS: {
  img: string;
  badge: I18nKey;
  title: I18nKey;
  desc: I18nKey;
  phi: I18nKey;
  specs: { label: I18nKey; value: I18nKey }[];
}[] = [
  {
    img: 'foto/komponen-listrik.jpg',
    badge: 'comp.b1',
    title: 'comp.t1',
    desc: 'comp.d1',
    phi: 'comp.p1',
    specs: [
      { label: 'comp.s1', value: 'comp.s1v' },
      { label: 'comp.s2', value: 'comp.s2v' },
      { label: 'comp.s3', value: 'comp.s3v' },
    ],
  },
  {
    img: 'foto/thermal-relay.jpg',
    badge: 'comp.b2',
    title: 'comp.t2',
    desc: 'comp.d2',
    phi: 'comp.p2',
    specs: [
      { label: 'comp.s4', value: 'comp.s4v' },
      { label: 'comp.s5', value: 'comp.s5v' },
      { label: 'comp.s6', value: 'comp.s6v' },
    ],
  },
];

export function Components() {
  const { t } = useApp();
  return (
    <section id="komponen" className="block">
      <div className="container">
        <BlockHead label="comp.label" />
        <div className="comp-grid">
          {COMPONENTS.map((c) => (
            <article className="comp-card" key={c.title}>
              <div className="comp-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img} alt={t(c.title)} loading="lazy" />
                <span className="comp-badge">{t(c.badge)}</span>
              </div>
              <div className="comp-body">
                <h3>{t(c.title)}</h3>
                <p className="comp-desc">{t(c.desc)}</p>
                <dl className="comp-specs">
                  {c.specs.map((s) => (
                    <div key={s.label} style={{ display: 'contents' }}>
                      <dt>{t(s.label)}</dt>
                      <dd>{t(s.value)}</dd>
                    </div>
                  ))}
                </dl>
                <div className="comp-philosophy">
                  <span className="comp-philo-label">{t('comp.philo')}</span>
                  <p>{t(c.phi)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}