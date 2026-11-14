'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Badge, LabCard, Readout, Segmented, Slider, amps, fmt, ohms, watts } from './LabPrimitives';

type Topology = 'single' | 'series' | 'parallel';

const PRESETS = [
  { id: 'led', name: 'LED Indikator', v: 12, r1: 470, r2: 330 },
  { id: 'relay', name: 'Relay Industri', v: 24, r1: 120, r2: 330 },
  { id: 'heater', name: 'Heater DC', v: 48, r1: 24, r2: 330 },
] as const;

export type OhmsData = {
  v: number;
  r1: number;
  r2: number;
  topology: Topology;
  rTotal: number;
  current: number;
  v1: number;
  v2: number;
  i1: number;
  i2: number;
  power: number;
};

export default function OhmsLawTab() {
  const [v, setV] = useState(12);
  const [r1, setR1] = useState(220);
  const [r2, setR2] = useState(330);
  const [topology, setTopology] = useState<Topology>('single');

  const data = useMemo<OhmsData>(() => {
    if (topology === 'series') {
      const rTotal = r1 + r2;
      const current = rTotal > 0 ? v / rTotal : 0;
      return {
        v,
        r1,
        r2,
        topology,
        rTotal,
        current,
        v1: current * r1,
        v2: current * r2,
        i1: current,
        i2: current,
        power: v * current,
      };
    }
    if (topology === 'parallel') {
      const rTotal = r1 + r2 > 0 ? (r1 * r2) / (r1 + r2) : 0;
      const current = rTotal > 0 ? v / rTotal : 0;
      return {
        v,
        r1,
        r2,
        topology,
        rTotal,
        current,
        v1: v,
        v2: v,
        i1: r1 > 0 ? v / r1 : 0,
        i2: r2 > 0 ? v / r2 : 0,
        power: v * current,
      };
    }
    const current = r1 > 0 ? v / r1 : 0;
    return {
      v,
      r1,
      r2,
      topology,
      rTotal: r1,
      current,
      v1: v,
      v2: 0,
      i1: current,
      i2: 0,
      power: v * current,
    };
  }, [v, r1, r2, topology]);

  const iTotal = amps(data.current);
  const hot = data.power > 5;
  const energy = data.power * 24;

  return (
    <div className="lab-tab-grid">
      <div className="lab-tab-main">
        <LabCard
          title="Skema rangkaian dinamis"
          hint={hot ? 'Peringatan disipasi > 5 W' : 'Aliran elektron mengikuti arus total'}
        >
          <CircuitCanvas data={data} hot={hot} />
          <div className="lab-legend">
            <span>
              <i className="dot dot-cyan" /> Elektron (kecepatan ∝ I)
            </span>
            <span>
              <i className="dot dot-amber" /> Mode panas (P &gt; 5 W)
            </span>
            <span>
              <i className="dot dot-line" /> Konduktor tembaga
            </span>
          </div>
        </LabCard>

        <LabCard title="Preset cepat">
          <div className="lab-presets">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`lab-preset${v === p.v && r1 === p.r1 && topology === 'single' ? ' is-on' : ''}`}
                onClick={() => {
                  setV(p.v);
                  setR1(p.r1);
                  setR2(p.r2);
                  setTopology('single');
                }}
              >
                <strong>{p.name}</strong>
                <span>
                  {p.v} V · {p.r1} Ω
                </span>
              </button>
            ))}
          </div>
        </LabCard>
      </div>

      <div className="lab-tab-side">
        <LabCard title="Kontrol sumber & beban">
          <div className="lab-stack">
            <Segmented<Topology>
              label="Topologi rangkaian"
              value={topology}
              onChange={setTopology}
              options={[
                { value: 'single', label: 'Tunggal (R1)' },
                { value: 'series', label: 'Seri (R1 + R2)' },
                { value: 'parallel', label: 'Paralel (R1 ∥ R2)' },
              ]}
            />
            <Slider label="Tegangan sumber" value={v} min={1} max={240} step={1} unit="V" onChange={setV} />
            <Slider label="R1" value={r1} min={10} max={1000} step={10} unit="Ω" onChange={setR1} />
            <Slider
              label="R2"
              value={r2}
              min={10}
              max={1000}
              step={10}
              unit="Ω"
              disabled={topology === 'single'}
              onChange={setR2}
            />
          </div>
        </LabCard>

        <LabCard title="Hasil perhitungan" hint="Hukum Ohm · V = I × R">
          <div className="lab-readouts">
            <Readout label="R total" value={ohms(data.rTotal).value} unit={ohms(data.rTotal).unit} />
            <Readout
              label="Arus total (I)"
              value={iTotal.value}
              unit={iTotal.unit}
              tone={hot ? 'warn' : 'good'}
              hint={`I = V / R = ${fmt(data.v, 0)} / ${fmt(data.rTotal, 0)} Ω`}
            />
            <Readout
              label="Daya total (P)"
              value={fmt(data.power, 2)}
              unit="W"
              tone={hot ? 'bad' : 'good'}
              hint={hot ? 'Melebihi 5 W — cek rating komponen' : 'Dalam batas aman komponen'}
            />
            <Readout
              label="Energi harian"
              value={fmt(energy, 2)}
              unit="Wh/hari"
              hint="P × 24 jam operasi kontinu"
            />
            {topology !== 'single' ? (
              <>
                <Readout label="Tegangan V1" value={fmt(data.v1, 2)} unit="V" />
                <Readout label="Tegangan V2" value={fmt(data.v2, 2)} unit="V" />
                <Readout label="Arus I1" value={amps(data.i1).value} unit={amps(data.i1).unit} />
                <Readout label="Arus I2" value={amps(data.i2).value} unit={amps(data.i2).unit} />
              </>
            ) : (
              <Readout label="Tegangan V1" value={fmt(data.v1, 2)} unit="V" hint="Tunggal — seluruh tegangan jatuh di R1" />
            )}
          </div>

          <div className="lab-foot">
            {hot ? (
              <Badge tone="bad">Disipasi {watts(data.power).value} {watts(data.power).unit} — gunakan resistor daya lebih tinggi</Badge>
            ) : (
              <Badge tone="good">
                Rangkaian stabil · {iTotal.value} {iTotal.unit}
              </Badge>
            )}
          </div>
        </LabCard>
      </div>
    </div>
  );
}

/* ------------------------------- canvas ------------------------------- */

type Pt = [number, number];

function drawZigzag(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string
) {
  const segs = 6;
  const amp = 9;
  const horizontal = Math.abs(x2 - x1) >= Math.abs(y2 - y1);
  const len = horizontal ? x2 - x1 : y2 - y1;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  for (let i = 1; i <= segs; i++) {
    const t = i / segs;
    const off = i === 0 || i === segs ? 0 : i % 2 === 0 ? amp : -amp;
    if (horizontal) ctx.lineTo(x1 + len * t, y1 + off);
    else ctx.lineTo(x1 + off, y1 + len * t);
  }
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function pointAt(pts: Pt[], d: number): Pt {
  let travelled = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0];
    const dy = pts[i][1] - pts[i - 1][1];
    const seg = Math.hypot(dx, dy);
    if (travelled + seg >= d) {
      const t = seg === 0 ? 0 : (d - travelled) / seg;
      return [pts[i - 1][0] + dx * t, pts[i - 1][1] + dy * t];
    }
    travelled += seg;
  }
  return pts[pts.length - 1];
}

function polyLength(pts: Pt[]) {
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  }
  return total;
}

function CircuitCanvas({ data, hot }: { data: OhmsData; hot: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef = useRef({ data, hot });
  dataRef.current = { data, hot };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let phase = 0;
    let width = 520;
    const height = 300;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(320, canvas.offsetWidth || 520);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const { data: d, hot: isHot } = dataRef.current;
      const accent = isHot ? '#f97316' : '#38d9d0';
      const wire = 'rgba(160, 186, 205, 0.55)';
      ctx.clearRect(0, 0, width, height);

      // grid
      ctx.strokeStyle = 'rgba(255,255,255,0.045)';
      ctx.lineWidth = 1;
      for (let x = 20; x < width; x += 28) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 20; y < height; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const pad = 46;
      const left = pad + 44;
      const right = width - pad - 24;
      const top = 88;
      const bottom = 232;
      const midY = (top + bottom) / 2;

      // main loop wires
      ctx.strokeStyle = wire;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(left, bottom);
      ctx.lineTo(left, top);
      ctx.lineTo(right, top);
      ctx.lineTo(right, bottom);
      ctx.lineTo(left, bottom);
      ctx.stroke();

      // source
      ctx.fillStyle = 'rgba(12,18,24,0.95)';
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(left, midY, 27, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = accent;
      ctx.beginPath();
      ctx.moveTo(left - 8, midY - 6);
      ctx.lineTo(left + 8, midY - 6);
      ctx.moveTo(left - 14, midY + 6);
      ctx.lineTo(left + 14, midY + 6);
      ctx.stroke();

      ctx.fillStyle = 'rgba(233,238,245,0.9)';
      ctx.font = '600 13px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${d.v} V`, left, midY + 52);

      // resistors
      const topStart = left + 60;
      const topEnd = right - 60;
      const color = accent;

      if (d.topology === 'parallel') {
        drawZigzag(ctx, topStart, top, right - 30, top, color);
        drawZigzag(ctx, topStart, bottom, right - 30, bottom, color);
        // branch joins
        ctx.strokeStyle = wire;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(topStart - 18, top);
        ctx.lineTo(topStart - 18, bottom);
        ctx.stroke();

        label(ctx, `R1 ${d.r1} Ω`, (topStart + topEnd) / 2, top - 16, 'rgba(233,238,245,0.75)');
        label(ctx, `R2 ${d.r2} Ω`, (topStart + topEnd) / 2, bottom + 26, 'rgba(233,238,245,0.75)');
      } else if (d.topology === 'series') {
        const mid1 = topStart + (topEnd - topStart) * 0.3;
        const mid2 = topStart + (topEnd - topStart) * 0.7;
        drawZigzag(ctx, topStart, top, mid1, top, color);
        drawZigzag(ctx, mid2, top, right - 30, top, color);
        label(ctx, `R1 ${d.r1} Ω`, (topStart + mid1) / 2, top - 16, 'rgba(233,238,245,0.75)');
        label(ctx, `R2 ${d.r2} Ω`, (mid2 + right - 30) / 2, top - 16, 'rgba(233,238,245,0.75)');
      } else {
        drawZigzag(ctx, topStart, top, right - 30, top, color);
        label(ctx, `R1 ${d.r1} Ω`, (topStart + right - 30) / 2, top - 16, 'rgba(233,238,245,0.75)');
      }

      // node markers + labels
      ctx.fillStyle = accent;
      [[left, top], [right, top], [right, bottom], [left, bottom]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.fill();
      });

      label(ctx, 'V', left + 34, top - 10, 'rgba(56,217,208,0.9)');
      label(ctx, 'I', right - 16, bottom + 20, 'rgba(245,196,81,0.95)');
      label(ctx, `I = ${amps(d.current).value} ${amps(d.current).unit}`, width / 2, height - 18, accent);

      // electron dots
      const speed = Math.min(220, 24 + d.current * 2600);
      const paths: { pts: Pt[]; share: number }[] =
        d.topology === 'parallel'
          ? [
              { pts: [[left, midY - 27], [left, top], [right, top], [right, midY - 27]], share: d.i1 },
              { pts: [[left, midY + 27], [left, bottom], [right, bottom], [right, midY + 27]], share: d.i2 },
            ]
          : [
              {
                pts: [
                  [left, midY],
                  [left, top],
                  [right, top],
                  [right, bottom],
                  [left, bottom],
                  [left, midY],
                ],
                share: d.current,
              },
            ];

      phase += 0.9;
      const hotColor = isHot ? '#f97316' : '#67e8f9';
      paths.forEach((path, pi) => {
        const len = polyLength(path.pts);
        const count = Math.max(6, Math.round(len / 46));
        const localSpeed = speed * (d.topology === 'parallel' ? (path.share / Math.max(d.current, 1e-9)) : 1);
        for (let i = 0; i < count; i++) {
          const dist = ((phase * localSpeed * 0.016 + (i * len) / count + pi * 20) % len + len) % len;
          const [x, y] = pointAt(path.pts, dist);
          ctx.beginPath();
          ctx.fillStyle = hotColor;
          if (isHot) {
            ctx.shadowColor = 'rgba(249,115,22,0.85)';
            ctx.shadowBlur = 12;
          } else {
            ctx.shadowColor = 'rgba(103,232,249,0.7)';
            ctx.shadowBlur = 8;
          }
          ctx.arc(x, y, isHot ? 3 : 2.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="lab-canvas lab-canvas-circuit" aria-label="Skema rangkaian DC dinamis" />;
}

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.font = '600 12px ui-sans-serif, system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
}
