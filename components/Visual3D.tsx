'use client';

import { useEffect, useRef, useState } from 'react';

type Freq = 50 | 60;

const TAU = Math.PI * 2;
const PHASES = [
  { key: 'R', label: 'Fasa R', deg: 0, css: '#ff6b6b', tint: 'rgba(255,107,107,0.18)' },
  { key: 'S', label: 'Fasa S', deg: 120, css: '#f5c451', tint: 'rgba(245,196,81,0.18)' },
  { key: 'T', label: 'Fasa T', deg: 240, css: '#4fd1c5', tint: 'rgba(79,209,197,0.18)' },
] as const;

export default function Visual3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, x: 0, y: 0, yaw: -24, tilt: 34, id: -1 });

  const [freq, setFreq] = useState<Freq>(50);
  const freqRef = useRef<Freq>(50);
  const resetRef = useRef(false);
  const [dragging, setDragging] = useState(false);

  freqRef.current = freq;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let phaseClock = 0;
    let last = 0;

    const resize = () => {
      // measure the canvas CSS box (aspect-ratio drives the height); writing an
      // inline height here would feed back into the observer and grow forever.
      const box = canvas.getBoundingClientRect();
      if (box.width < 2 || box.height < 2) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = box.width;
      h = box.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;

      if (resetRef.current) {
        phaseClock = 0;
        drag.current.yaw = -24;
        drag.current.tilt = 34;
        resetRef.current = false;
      }

      // visual scale: 50 Hz is far too fast to sample, so the rings turn at a
      // proportional rate that keeps the 50/60 ratio honest and readable.
      const hz = freqRef.current === 60 ? 60 : 50;
      phaseClock += dt * (hz / 41.6);

      const { yaw, tilt } = drag.current;
      const tiltRad = (tilt * Math.PI) / 180;
      const yawRad = (yaw * Math.PI) / 180;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.36;
      const squash = Math.max(0.18, Math.sin(tiltRad));

      ctx.clearRect(0, 0, w, h);

      // floor grid, projected with the same tilt so the rings sit in the scene
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(yawRad * 0.4);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      for (let i = -5; i <= 5; i += 1) {
        const p = (i / 5) * radius * 1.25;
        ctx.beginPath();
        ctx.moveTo(-radius * 1.25, p * squash);
        ctx.lineTo(radius * 1.25, p * squash);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(p, -radius * 1.25 * squash);
        ctx.lineTo(p, radius * 1.25 * squash);
        ctx.stroke();
      }
      ctx.restore();

      PHASES.forEach((p) => {
        const theta = phaseClock * TAU + (p.deg * Math.PI) / 180;
        const angle = theta + yawRad;

        // ring
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(yawRad * 0.35);
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * squash, 0, 0, TAU);
        ctx.strokeStyle = p.tint;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // vector tip projected: x = cos, y = sin * squash
        const vx = cx + Math.cos(angle) * radius;
        const vy = cy + Math.sin(angle) * radius * squash;

        // vector
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(vx, vy);
        ctx.strokeStyle = p.css;
        ctx.lineWidth = 2.2;
        ctx.stroke();

        // propagating arc just behind the vector
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy,
          radius,
          radius * squash,
          yawRad * 0.35,
          angle - yawRad * 0.35 - 0.55,
          angle - yawRad * 0.35,
        );
        ctx.strokeStyle = p.css;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // tip
        ctx.beginPath();
        ctx.arc(vx, vy, 5.2, 0, TAU);
        ctx.fillStyle = p.css;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(vx, vy, 10, 0, TAU);
        ctx.fillStyle = p.tint;
        ctx.fill();

        // label
        ctx.font = '600 12px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx.fillStyle = p.css;
        ctx.textAlign = vx > cx ? 'left' : 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${p.key} · ${p.deg}°`, vx + (vx > cx ? 14 : -14), vy);
      });

      // core
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26);
      core.addColorStop(0, 'rgba(255,255,255,0.9)');
      core.addColorStop(0.4, 'rgba(245,196,81,0.55)');
      core.addColorStop(1, 'rgba(245,196,81,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, 26, 0, TAU);
      ctx.fillStyle = core;
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current.active = true;
    drag.current.id = e.pointerId;
    drag.current.x = e.clientX;
    drag.current.y = e.clientY;
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active || drag.current.id !== e.pointerId) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current.x = e.clientX;
    drag.current.y = e.clientY;
    drag.current.yaw += dx * 0.6;
    drag.current.tilt = Math.max(12, Math.min(74, drag.current.tilt + dy * 0.35));
  };

  const end = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current.id !== e.pointerId) return;
    drag.current.active = false;
    drag.current.id = -1;
    setDragging(false);
  };

  return (
    <section id="visual3d" className="block v3">
      <div className="container">
        <div className="block-head">
          <span className="block-label">VISUALISASI 3D</span>
          <span className="block-line" />
        </div>

        <div className="v3-layout">
          <div
            className={`v3-stage${dragging ? ' is-dragging' : ''}`}
            ref={frameRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={end}
            onPointerCancel={end}
            style={{ touchAction: 'none' }}
            role="img"
            aria-label="Tiga vektor fasa R, S, dan T berputar dengan beda sudut 120 derajat"
          >
            <canvas ref={canvasRef} className="v3-canvas" />
            <span className="v3-hint">Drag untuk memutar sudut pandang</span>
          </div>

          <div className="v3-info">
            <h2 className="v3-title">Inti Energi 3 Fasa</h2>
            <p className="v3-desc">
              Tiga vektor tegangan berputar pada kecepatan sudut yang sama, terpisah 120° satu sama
              lain. Resultan sesaatnya selalu nol — itulah sebabnya sistem 3 fasa seimbang tidak
              membutuhkan penghantar netral untuk arus beban seimbang.
            </p>

            <ul className="v3-legend">
              {PHASES.map((p) => (
                <li key={p.key}>
                  <i style={{ background: p.css }} />
                  <b>{p.label}</b>
                  <span>{p.deg}°</span>
                </li>
              ))}
            </ul>

            <div className="v3-controls">
              <div className="v3-freq" role="group" aria-label="Frekuensi sistem">
                {[50, 60].map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={freq === f ? 'is-on' : ''}
                    aria-pressed={freq === f}
                    onClick={() => setFreq(f as Freq)}
                  >
                    {f} Hz
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="v3-reset"
                onClick={() => {
                  resetRef.current = true;
                }}
              >
                Reset Sudut
              </button>
            </div>

            <p className="v3-note">
              Beda fasa 120° · urutan R–S–T · {freq} Hz → periode {((1 / freq) * 1000).toFixed(2)} ms
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
