'use client';

import { useState } from 'react';
import { useApp } from '@/lib/app-context';
import type { I18nKey } from '@/lib/i18n';

function BlockHead({ label }: { label: I18nKey }) {
  const { t } = useApp();
  return (
    <div className="block-head">
      <span className="block-label">{t(label)}</span>
      <span className="block-line" />
    </div>
  );
}

/* ---------------- Converter + Timeline ---------------- */
export function Converter() {
  const { t } = useApp();
  const [kw, setKw] = useState(1);

  const hp = (kw * 1.34102).toFixed(2);
  const btu = Math.round(kw * 3412.14).toLocaleString('id-ID');
  const amp = ((kw * 1000) / 220).toFixed(2);

  const timeline = [
    { year: '1800', title: 'timeline.t1', desc: 'timeline.d1' },
    { year: '1831', title: 'timeline.t2', desc: 'timeline.d2' },
    { year: '1888', title: 'timeline.t3', desc: 'timeline.d3' },
    { year: '1893', title: 'timeline.t4', desc: 'timeline.d4' },
    { year: '2021', title: 'timeline.t5', desc: 'timeline.t5d' },
  ];

  return (
    <section id="konverter" className="block">
      <div className="container">
        <BlockHead label="conv.label" />
        <div className="conv-layout">
          <div className="conv-card">
            <h3>{t('conv.title')}</h3>
            <p className="conv-desc">{t('conv.desc')}</p>
            <div className="conv-input-row">
              <input
                type="number"
                className="conv-input"
                value={kw}
                min={0}
                step={0.1}
                onChange={(e) => setKw(parseFloat(e.target.value) || 0)}
                aria-label="kW"
              />
              <span className="conv-unit">kW</span>
            </div>
            <div className="conv-results">
              <div className="conv-result">
                <span>{t('conv.hp')}</span>
                <strong>{hp} HP</strong>
              </div>
              <div className="conv-result">
                <span>{t('conv.btu')}</span>
                <strong>{btu} BTU/h</strong>
              </div>
              <div className="conv-result">
                <span>{t('conv.amp')}</span>
                <strong>{kw > 0 ? `${amp} A` : '0.00 A'}</strong>
              </div>
            </div>
          </div>

          <div className="timeline">
            <h3 className="timeline-title">{t('timeline.title')}</h3>
            <div className="timeline-list">
              {timeline.map((item) => (
                <div className="timeline-item" key={item.year}>
                  <span className="timeline-year">{item.year}</span>
                  <div>
                    <h4>{t(item.title as I18nKey)}</h4>
                    <p>{t(item.desc as I18nKey)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
const FAQS: { q: I18nKey; a: I18nKey }[] = [
  { q: 'faq.q1', a: 'faq.a1' },
  { q: 'faq.q2', a: 'faq.a2' },
  { q: 'faq.q3', a: 'faq.a3' },
  { q: 'faq.q4', a: 'faq.a4' },
  { q: 'faq.q5', a: 'faq.a5' },
];

export function Faq() {
  const { t } = useApp();
  return (
    <section id="faq" className="block">
      <div className="container">
        <BlockHead label="faq.label" />
        <div className="faq-list">
          {FAQS.map((item, i) => (
            <details className="faq-item" key={item.q} open={i === 0}>
              <summary>{t(item.q)}</summary>
              <p>{t(item.a)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */
export function Cta() {
  const { t } = useApp();
  return (
    <section className="cta-section">
      <div className="container">
        <h2 className="cta-title">{t('cta.title')}</h2>
        <p className="cta-desc">{t('cta.desc')}</p>
        <div className="cta-actions">
          <a
            className="btn btn-primary"
            href="https://wa.me/6281218554350?text=Halo%2C%20saya%20ingin%20konsultasi%20mengenai%20proyek%20kelistrikan."
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('cta.btn1')}
          </a>
          <a className="btn btn-secondary" href="#simulator">
            {t('cta.btn2')}
          </a>
        </div>
      </div>
    </section>
  );
}