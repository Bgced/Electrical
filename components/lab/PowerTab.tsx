'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, LabCard, Readout, Segmented, Slider, fmt } from './LabPrimitives';

type System = '1p' | '3p';

const DEG = Math.PI / 180;

export default function PowerTab() {
  const [system, setSystem] = useState<System>('1p');
  const [current, setCurrent] = useState(32);
  const [pf, setPf] = useState(0.82);
  const [paused, setPaused] = useState(false);

  const voltage = system === '1p' ? 220 : 380;

  const result = useMemo(() => {
    const s = (system === '1p' ? voltage * current : Math.sqrt(3) * voltage * current) / 1000;
    const p = s * pf;
    const phi = Math.acos(Math.min(1, Math.max(0.01, pf)));
    const q = s * Math.sin(phi);
    const tanNow = Math.tan(phi);
    const tanTarget = Math.tan(Math.acos(0.95));
    const qc = Math.max(0, p * (tanNow - tanTarget));
    const apparentAfter = qc > 0 ? Math.sqrt(p * p + Math.pow(q - qc, 2)) : s;
    const pfAfter = apparentAfter > 0 ? p / apparentAfter : 1;
    return { s, p, q, qc, phi, pfAfter };
  }, [system, voltage, current, pf]);

  const good = pf >= 0.85;

  return (
    <div className="lab-tab-grid">
      <div className="lab-tab-main">
        <LabCard
          title="Osiloskop gelombang"
          hint={system === '1p' ? 'V(t) vs I(t) — pergeseran fasa φ' : 'Fasa R · S · T (120° antar fasa)'}
        >
          <ScopeCanvas system={system} pf={pf} current={current} paused={paused} />
          <div className="lab-scope-foot">
            <button type="button" className="lab-btn" onClick={() => setPaused((v) => !v)}>
              {paused ? '▶ Jalankan gelombang' : '❚❚ Jeda gelombang'}
            </button>
            <span className="lab-scope-meta">
              φ = {fmt(result.phi / DEG, 1)}° · f = 50 Hz · {system === '1p' ? 'L-N 220 V' : 'L-L 380 V'}
            </span>
          </div>
        </LabCard>

        <LabCard title="Segitiga daya" hint={`P ${fmt(result.p, 2)} kW · Q ${fmt(result.q, 2)} kVAR · S ${fmt(result.s, 2)} kVA`}>
          <PowerTriangle p={result.p} q={result.q} s={result.s} phi={result.phi} />
        </LabCard>
      </div>

      <div className="lab-tab-side">
        <LabCard title="Parameter beban">
          <div className="lab-stack">
            <Segmented<System>
              label="Sistem tegangan"
              value={system}
              onChange={setSystem}
              options={[
                { value: '1p', label: '1 Fasa (220 V L-N)' },
                { value: '3p', label: '3 Fasa (380 V L-L)' },
              ]}
            />
            <Slider
              label="Arus beban"
              value={current}
              min={1}
              max={150}
              step={1}
              unit="A"
              onChange={setCurrent}
            />
            <Slider
              label="Faktor daya (cos φ)"
              value={pf}
              min={0.5}
              max={1}
              step={0.01}
              display={fmt(pf, 2)}
              onChange={setPf}
            />
          </div>
        </LabCard>

        <LabCard title="Hasil daya" hint="S = V·I · P = S·cosφ · Q = S·sinφ">
          <div className="lab-readouts">
            <Readout label="Daya semu (S)" value={fmt(result.s, 2)} unit="kVA" />
            <Readout label="Daya aktif (P)" value={fmt(result.p, 2)} unit="kW" tone="good" />
            <Readout label="Daya reaktif (Q)" value={fmt(result.q, 2)} unit="kVAR" />
            <Readout
              label="Kapasitor bank (Qc)"
              value={fmt(result.qc, 2)}
              unit="kVAR"
              tone={result.qc > 0 ? 'warn' : 'good'}
              hint={`Target cos φ 0.95 → cos φ baru ${fmt(result.pfAfter, 3)}`}
            />
          </div>

          <div className="lab-foot">
            {good ? (
              <Badge tone="good">Efisiensi optimal — cos φ ≥ 0.85</Badge>
            ) : (
              <Badge tone="warn">Peringatan denda kVARH — butuh kapasitor bank</Badge>
            )}
          </div>
        </LabCard>
      </div>
    </div>
  );
}

/* ------------------------------- oscilloscope ------------------------------- */

function ScopeCanvas({
  system,
  pf,
  current,
  paused,
}: {
  system: System;
  pf: number;
  current: number;
  paused: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const state = useRef({ system, pf, current, paused });
  state.current = { system, pf, current, paused };

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let t = 0;
    let width = 620;
    const height = 220;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(320, canvas.offsetWidth || 620);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const wave = (x: number, amp: number, phase: number, cycles: number) =>
      height / 2 - Math.sin((x / width) * Math.PI * 2 * cycles + phase) * amp;

    const plot = (amp: number, phase: number, color: string, dashed = false) => {
      ctx.beginPath();
      for (let x = 0; x <= width; x += 2) {
        const y = wave(x, amp, phase, 2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.2;
      ctx.setLineDash(dashed ? [6, 6] : []);
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.setLineDash([]);
    };

    const draw = () => {
      const s = state.current;
      const phi = Math.acos(Math.min(1, Math.max(0.01, s.pf)));
      const amp = Math.min(74, 30 + (s.current / 150) * 50);
      ctx.clearRect(0, 0, width, height);

      // grid
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (s.system === '3p') {
        const phase120 = 120 * DEG;
        plot(amp, t, '#ef5350');
        plot(amp, t - phase120, '#f5c451');
        plot(amp, t - 2 * phase120, '#42a5f5');
      } else {
        plot(amp, t, '#38d9d0');
        plot(amp * 0.92, t - phi, '#f5c451', true);
      }

      // legend
      ctx.font = '600 11px ui-sans-serif, system-ui';
      ctx.textAlign = 'left';
      if (s.system === '3p') {
        dotLegend(ctx, 12, 18, '#ef5350', 'V_R 0°');
        dotLegend(ctx, 92, 18, '#f5c451', 'V_S 120°');
        dotLegend(ctx, 180, 18, '#42a5f5', 'V_T 240°');
      } else {
        dotLegend(ctx, 12, 18, '#38d9d0', 'V(t)');
        dotLegend(ctx, 72, 18, '#f5c451', 'I(t) lagging');
      }

      if (!s.paused) t += 0.045;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="lab-canvas lab-canvas-scope" aria-label="Osiloskop gelombang tegangan dan arus" />;
}

function dotLegend(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, text: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(233,238,245,0.75)';
  ctx.fillText(text, x + 8, y + 4);
}

/* ------------------------------- power triangle ------------------------------- */

function PowerTriangle({ p, q, s, phi }: { p: number; q: number; s: number; phi: number }) {
  const W = 360;
  const H = 230;
  const padX = 44;
  const padY = 34;
  const maxW = W - padX * 2;
  const maxH = H - padY * 2;
  const scale = Math.max(s, 0.001);
  const w = Math.max(6, (p / scale) * maxW);
  const h = Math.max(2, (q / scale) * maxH);

  const x0 = padX;
  const y0 = H - padY;
  const x1 = x0 + w;
  const y1 = y0 - h;

  const arcR = Math.min(52, Math.max(26, Math.min(w, h) * 0.55));
  const arcEnd = y1 <= y0 ? -phi : 0;

  return (
    <div className="lab-triangle">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Segitiga daya dinamis">
        <defs>
          <linearGradient id="labTriFill" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(56,217,208,0.28)" />
            <stop offset="1" stopColor="rgba(245,196,81,0.22)" />
          </linearGradient>
        </defs>

        <path d={`M${x0} ${y0} L${x1} ${y0} L${x1} ${y1} Z`} fill="url(#labTriFill)" stroke="none" />

        <line x1={x0} y1={y0} x2={x1} y2={y0} stroke="#38d9d0" strokeWidth="3" strokeLinecap="round" />
        <line x1={x1} y1={y0} x2={x1} y2={y1} stroke="#f5c451" strokeWidth="3" strokeLinecap="round" />
        <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="#e9eef5" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="7 6" />

        {h > 26 && (
          <path
            d={`M${x0 + arcR} ${y0} A ${arcR} ${arcR} 0 0 ${arcEnd < 0 ? 1 : 0} ${
              x0 + arcR * Math.cos(phi)
            } ${y0 - arcR * Math.sin(phi)}`}
            fill="none"
            stroke="rgba(233,238,245,0.65)"
            strokeWidth="1.6"
          />
        )}
        <text x={x0 + arcR + 8} y={y0 - 8} fill="rgba(233,238,245,0.85)" fontSize="12" fontWeight="600">
          φ {fmt(phi * (180 / Math.PI), 1)}°
        </text>

        <text x={(x0 + x1) / 2} y={y0 + 22} textAnchor="middle" fill="#38d9d0" fontSize="12" fontWeight="700">
          P {fmt(p, 2)} kW
        </text>
        <text x={x1 + 8} y={(y0 + y1) / 2} fill="#f5c451" fontSize="12" fontWeight="700">
          Q {fmt(q, 2)}
        </text>
        <text
          x={(x0 + x1) / 2 - 12}
          y={(y0 + y1) / 2 - 8}
          textAnchor="middle"
          fill="rgba(233,238,245,0.9)"
          fontSize="12"
          fontWeight="700"
        >
          S {fmt(s, 2)} kVA
        </text>
      </svg>
    </div>
  );
}
