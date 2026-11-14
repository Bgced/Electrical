'use client';

import { useEffect, useRef, useState } from 'react';
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

/* ---------------- 3D Core ---------------- */
export function ThreeD() {
  const { t } = useApp();
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const [fast, setFast] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    const scene = sceneRef.current;
    if (!stage || !scene) return;

    let rotX = 62;
    let rotZ = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let velocity = 0;

    const apply = () => {
      scene.style.transform = `rotateX(${rotX}deg) rotateZ(${rotZ}deg)`;
    };

    const start = (e: MouseEvent | TouchEvent) => {
      dragging = true;
      const p = 'touches' in e ? e.touches[0] : e;
      lastX = p.clientX;
      lastY = p.clientY;
      velocity = 0;
      coreRef.current?.classList.add('paused');
      scene.style.transition = 'none';
    };

    const move = (e: MouseEvent | TouchEvent) => {
      if (!dragging) return;
      const p = 'touches' in e ? e.touches[0] : e;
      const dx = p.clientX - lastX;
      const dy = p.clientY - lastY;
      lastX = p.clientX;
      lastY = p.clientY;

      rotZ += dx * 0.5;
      rotX = Math.max(20, Math.min(85, rotX - dy * 0.35));
      velocity = dx * 0.5;
      apply();
      if ('cancelable' in e && e.cancelable) e.preventDefault();
    };

    const end = () => {
      if (!dragging) return;
      dragging = false;
      scene.style.transition = 'transform 0.15s linear';

      let v = velocity;
      const glide = () => {
        if (dragging || Math.abs(v) < 0.4) {
          coreRef.current?.classList.remove('paused');
          return;
        }
        rotZ += v;
        v *= 0.94;
        apply();
        requestAnimationFrame(glide);
      };
      glide();
    };

    stage.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    stage.addEventListener('touchstart', start, { passive: true });
    stage.addEventListener('touchmove', move, { passive: false });
    stage.addEventListener('touchend', end);

    return () => {
      stage.removeEventListener('mousedown', start);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', end);
      stage.removeEventListener('touchstart', start);
      stage.removeEventListener('touchmove', move);
      stage.removeEventListener('touchend', end);
    };
  }, []);

  return (
    <section id="visual3d" className="block">
      <div className="container">
        <BlockHead label="three.label" />
        <div className="three-layout">
          <div className="three-stage" ref={stageRef}>
            <div className="scene" ref={sceneRef}>
              <div className={`core${fast ? ' fast' : ''}`} ref={coreRef}>
                <div className="ring ring-1" />
                <div className="ring ring-2" />
                <div className="ring ring-3" />
                <div className="ring ring-4" />
                <div className="core-center">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14H11L11 22L21 10H13V2Z" fill="currentColor" />
                  </svg>
                </div>
                <div className="orbit orbit-1">
                  <span />
                </div>
                <div className="orbit orbit-2">
                  <span />
                </div>
                <div className="orbit orbit-3">
                  <span />
                </div>
              </div>
            </div>
            <span className="three-hint">{t('three.hint')}</span>
          </div>

          <div className="three-info">
            <h2 className="three-title">{t('three.title')}</h2>
            <p className="three-desc">{t('three.desc')}</p>

            <div className="three-facts">
              <div className="three-fact">
                <span className="three-fact-label">{t('three.f1')}</span>
                <span className="three-fact-val">0°</span>
              </div>
              <div className="three-fact">
                <span className="three-fact-label">{t('three.f2')}</span>
                <span className="three-fact-val">120°</span>
              </div>
              <div className="three-fact">
                <span className="three-fact-label">{t('three.f3')}</span>
                <span className="three-fact-val">240°</span>
              </div>
            </div>

            <div className="three-actions">
              <button
                className="sim-btn-run"
                onClick={() => setFast((v) => !v)}
              >
                {fast ? t('three.spin') + ' ✓' : t('three.spin')}
              </button>
              <button
                className="sim-btn-reset"
                onClick={() => {
                  setFast(false);
                  if (sceneRef.current) {
                    sceneRef.current.style.transition = 'transform 0.5s ease';
                    sceneRef.current.style.transform = 'rotateX(62deg) rotateZ(0deg)';
                  }
                }}
              >
                {t('three.reset')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Simulator ---------------- */
export function Simulator() {
  const { t } = useApp();
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(220);
  const [running, setRunning] = useState(false);

  const current = running && resistance > 0 ? voltage / resistance : 0;
  const power = running ? voltage * current : 0;

  return (
    <section id="simulator" className="block">
      <div className="container">
        <BlockHead label="sim.label" />
        <p className="sim-intro">{t('sim.intro')}</p>
        <div className="sim-layout">
          <div className="sim-canvas">
            <div id="simCanvas" dangerouslySetInnerHTML={{ __html: circuitSvg(voltage, resistance, running, current) }} />
            <WaveCanvas />
          </div>

          <div className="sim-panel">
            <div className="sim-row">
              <span>{t('sim.voltage')}</span>
              <input
                type="range"
                min={0}
                max={24}
                value={voltage}
                className="sim-slider"
                onChange={(e) => setVoltage(parseInt(e.target.value, 10))}
              />
              <span className="sim-value">{voltage}V</span>
            </div>

            <div className="sim-row">
              <span>{t('sim.resistance')}</span>
              <input
                type="range"
                min={0}
                max={1000}
                value={resistance}
                className="sim-slider"
                onChange={(e) => setResistance(parseInt(e.target.value, 10))}
              />
              <span className="sim-value">{resistance}Ω</span>
            </div>

            <div className="sim-results">
              <div className="sim-result">
                <span>{t('sim.current')}</span>
                <span className="sim-result-val">{(current * 1000).toFixed(1)} mA</span>
              </div>
              <div className="sim-result">
                <span>{t('sim.power')}</span>
                <span className="sim-result-val">{power.toFixed(2)} W</span>
              </div>
            </div>

            <div className="sim-actions">
              <button
                className="sim-btn-run"
                onClick={() => setRunning((v) => !v)}
              >
                {running ? 'Stop' : t('sim.run')}
              </button>
              <button
                className="sim-btn-reset"
                onClick={() => {
                  setRunning(false);
                  setVoltage(12);
                  setResistance(220);
                }}
              >
                {t('sim.reset')}
              </button>
            </div>
          </div>
        </div>

        <ResistorCalc />
      </div>
    </section>
  );
}

function circuitSvg(v: number, r: number, running: boolean, current: number) {
  const dur = Math.max(0.5, 2 - current);
  return `
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="120" width="60" height="60" rx="8" fill="none" stroke="var(--text-2)" stroke-width="2"/>
      <line x1="35" y1="140" x2="35" y2="160" stroke="var(--text)" stroke-width="3"/>
      <line x1="45" y1="135" x2="45" y2="165" stroke="var(--text-3)" stroke-width="1"/>
      <text x="50" y="200" text-anchor="middle" fill="var(--text-2)" font-size="12">${v}V</text>
      <line x1="80" y1="150" x2="180" y2="150" stroke="var(--text-2)" stroke-width="2"/>
      <line x1="220" y1="150" x2="320" y2="150" stroke="var(--text-2)" stroke-width="2"/>
      <rect x="180" y="135" width="40" height="30" rx="4" fill="none" stroke="var(--text)" stroke-width="2"/>
      <text x="200" y="155" text-anchor="middle" fill="var(--text-2)" font-size="10">${r}Ω</text>
      <circle cx="320" cy="150" r="15" fill="none" stroke="var(--text-2)" stroke-width="2"/>
      ${running && current > 0 ? `<circle cx="320" cy="150" r="8" fill="#34c759" opacity="${Math.min(current * 10, 1)}"/>` : ''}
      <text x="320" y="185" text-anchor="middle" fill="var(--text-2)" font-size="10">LED</text>
      <rect x="280" y="135" width="30" height="30" rx="4" fill="none" stroke="var(--text-2)" stroke-width="2"/>
      ${running ? `<line x1="285" y1="150" x2="305" y2="150" stroke="#34c759" stroke-width="2"/>` : `<line x1="285" y1="150" x2="305" y2="140" stroke="var(--text-2)" stroke-width="2"/>`}
      ${running && current > 0 ? `
        <circle r="3" fill="#c4a06a">
          <animate attributeName="cx" values="80;180;220;320" dur="${dur}s" repeatCount="indefinite"/>
          <animate attributeName="cy" values="150;150;150;150" dur="${dur}s" repeatCount="indefinite"/>
        </circle>` : ''}
      ${running ? `<text x="200" y="130" text-anchor="middle" fill="#c4a06a" font-size="10">${(current * 1000).toFixed(1)}mA</text>` : ''}
    </svg>`;
}

function WaveCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.offsetWidth || 600;
    const h = 160;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let t = 0;
    let raf = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      const cycles = 2;
      const amp = h * 0.35;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = h / 2 - Math.sin((x / w) * Math.PI * 2 * cycles + t) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#00d4aa';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00d4aa';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      t += 0.03;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className="wave-canvas" />;
}

/* ---------------- Resistor calc ---------------- */
const COLORS = [
  { name: 'Hitam', hex: '#1a1a1a', val: 0, mult: 1 },
  { name: 'Coklat', hex: '#6b4226', val: 1, mult: 10 },
  { name: 'Merah', hex: '#d32f2f', val: 2, mult: 100 },
  { name: 'Jingga', hex: '#f57c00', val: 3, mult: 1000 },
  { name: 'Kuning', hex: '#fbc02d', val: 4, mult: 10000 },
  { name: 'Hijau', hex: '#388e3c', val: 5, mult: 100000 },
  { name: 'Biru', hex: '#1976d2', val: 6, mult: 1000000 },
  { name: 'Ungu', hex: '#7b1fa2', val: 7, mult: 10000000 },
  { name: 'Abu-abu', hex: '#9e9e9e', val: 8, mult: 100000000 },
  { name: 'Putih', hex: '#f5f5f5', val: 9, mult: 1000000000 },
  { name: 'Emas', hex: '#d4af37', val: -1, mult: 0.1 },
  { name: 'Perak', hex: '#c0c0c0', val: -1, mult: 0.01 },
];

function formatOhm(v: number) {
  if (v >= 1e6) return `${(v / 1e6).toFixed(2).replace(/\.?0+$/, '')} MΩ`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(2).replace(/\.?0+$/, '')} kΩ`;
  return `${v} Ω`;
}

function ResistorCalc() {
  const { t } = useApp();
  const [b1, setB1] = useState(2);
  const [b2, setB2] = useState(0);
  const [b3, setB3] = useState(1);

  const c1 = COLORS[b1];
  const c2 = COLORS[b2];
  const c3 = COLORS[b3];
  const value = (c1.val * 10 + c2.val) * c3.mult;

  return (
    <div className="resistor-calc">
      <BlockHead label="rc.label" />
      <div className="rc-layout">
        <div className="rc-visual">
          <div className="resistor-body">
            <span className="band" style={{ background: c1.hex }} />
            <span className="band" style={{ background: c2.hex }} />
            <span className="band" style={{ background: c3.hex }} />
            <span className="band gold-band" />
          </div>

          <div className="rc-selects">
            {(
              [
                [t('rc.band1'), b1, setB1],
                [t('rc.band2'), b2, setB2],
                [t('rc.band3'), b3, setB3],
              ] as [string, number, (n: number) => void][]
            ).map(([label, val, set]) => (
              <div className="rc-select-row" key={label}>
                <label>{label}</label>
                <select
                  className="rc-select"
                  value={val}
                  onChange={(e) => set(parseInt(e.target.value, 10))}
                >
                  {COLORS.map((c, i) => (
                    <option key={c.name} value={i}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="rc-result">
          <span className="rc-result-label">{t('rc.result')}</span>
          <span className="rc-result-val">{formatOhm(value)}</span>
        </div>
      </div>
    </div>
  );
}