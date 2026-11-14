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
function num(n: number, digits = 2) {
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function Converter() {
  const { t } = useApp();
  const [kw, setKw] = useState(1);
  const [system, setSystem] = useState<'1p' | '3p'>('1p');
  const [pf, setPf] = useState(0.95);

  const voltage = system === '1p' ? 220 : 380;
  const wattsIn = kw * 1000;

  const hp = (kw * 1.34102).toFixed(2);
  const btu = Math.round(kw * 3412.14).toLocaleString('en-US');
  const amp = wattsIn > 0 && pf > 0
    ? system === '1p'
      ? wattsIn / (voltage * pf)
      : wattsIn / (Math.sqrt(3) * voltage * pf)
    : 0;
  const kva = amp > 0 ? (system === '1p' ? (voltage * amp) / 1000 : (Math.sqrt(3) * voltage * amp) / 1000) : 0;

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
                aria-label="Daya dalam kW"
              />
              <span className="conv-unit">kW</span>
            </div>

            <div className="conv-sys" role="group" aria-label="Sistem tegangan">
              <button
                type="button"
                className={system === '1p' ? 'is-on' : ''}
                aria-pressed={system === '1p'}
                onClick={() => setSystem('1p')}
              >
                1P · 220 V
              </button>
              <button
                type="button"
                className={system === '3p' ? 'is-on' : ''}
                aria-pressed={system === '3p'}
                onClick={() => setSystem('3p')}
              >
                3P · 380 V
              </button>
            </div>

            <label className="conv-pf">
              <span>
                Faktor daya <strong>cos φ {num(pf, 2)}</strong>
              </span>
              <input
                type="range"
                min={0.5}
                max={1}
                step={0.01}
                value={pf}
                onChange={(e) => setPf(parseFloat(e.target.value))}
                aria-label="Faktor daya"
              />
            </label>

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
                <span>Arus @{voltage} V ({system === '1p' ? '1P' : '3P'})</span>
                <strong>{num(amp, 2)} A</strong>
              </div>
              <div className="conv-result">
                <span>Daya semu</span>
                <strong>{num(kva, 2)} kVA</strong>
              </div>
            </div>

            <p className="conv-note">
              In = P ÷ ({system === '1p' ? 'V' : '√3 · V'} · cos φ) — {system === '1p' ? '1 fasa 220 V' : '3 fasa 380 V'},
              cos φ {num(pf, 2)}.
            </p>
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
    <section className="cta-section" id="kontak">
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