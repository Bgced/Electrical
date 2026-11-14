'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import EngineerCharacter2D from '@/components/EngineerCharacter2D';
import SafeImg from '@/components/SafeImg';

const MIN_X = 5;
const MAX_X = 85;
const START_X = 34;
const SPEED = 26; // % of the room per second

/** Speech follows the performer: three inspection zones across the room. */
const ZONES = [
  { from: MIN_X, to: 30, text: 'Inspeksi jalur masuk & proteksi MCCB utama...' },
  { from: 31, to: 60, text: 'Panel EE-01 stabil: 380V · 50Hz · PF 0.96 ⚡' },
  { from: 61, to: MAX_X, text: 'Klik meja osiloskop buat tes rangkaian!' },
];

const TAP_MESSAGES = [
  'Halo! Klik meja alat buat tes rangkaian ⚡',
  'Tegangan 380V 3-fasa aman terkendali!',
  'Klik di meja buat geser posisi saya.',
];

const clamp = (v: number, min = MIN_X, max = MAX_X) => Math.min(max, Math.max(min, v));
const dragBounds = (): [number, number] =>
  typeof window !== 'undefined' && window.innerWidth < 768 ? [8, 72] : [6, 82];
const zoneOf = (x: number) => ZONES.findIndex((z) => x >= z.from && x <= z.to);

const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function Hero() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const actorRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);

  const pos = useRef(START_X);
  const target = useRef(START_X);
  const keys = useRef({ left: false, right: false });
  const zone = useRef(zoneOf(START_X));

  const [dir, setDir] = useState<'left' | 'right'>('right');
  const [walking, setWalking] = useState(false);
  const [waveKey, setWaveKey] = useState(0);
  const [zoneIndex, setZoneIndex] = useState(zoneOf(START_X));
  const [manualBubble, setManualBubble] = useState<number | null>(null);
  const [bubbleSide, setBubbleSide] = useState<'left' | 'center' | 'right'>('center');
  const [dragging, setDragging] = useState(false);

  const sideRef = useRef<'left' | 'center' | 'right'>('center');
  const drag = useRef({
    active: false,
    id: -1,
    x: 0,
    startX: 0,
    startPos: START_X,
    moved: false,
  });

  // single rAF loop drives click-to-walk and held keys
  useEffect(() => {
    let raf = 0;
    let last = 0;

    const frame = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;

      if (keys.current.left) target.current = clamp(target.current - SPEED * dt);
      if (keys.current.right) target.current = clamp(target.current + SPEED * dt);

      const delta = target.current - pos.current;
      if (drag.current.active) {
        // the pointer owns the position while dragging
      } else if (Math.abs(delta) > 0.05) {
        pos.current += Math.sign(delta) * Math.min(Math.abs(delta), SPEED * 1.15 * dt);
        if (actorRef.current) actorRef.current.style.setProperty('--x', `${pos.current}%`);
        const nextDir = delta < 0 ? 'left' : 'right';
        setDir((d) => (d === nextDir ? d : nextDir));
        setWalking(true);
      } else if (pos.current !== target.current) {
        pos.current = target.current;
        if (actorRef.current) actorRef.current.style.setProperty('--x', `${pos.current}%`);
        setWalking(false);
      } else {
        setWalking(false);
      }

      const nextZone = zoneOf(pos.current);
      if (nextZone !== zone.current && nextZone !== -1) {
        zone.current = nextZone;
        setZoneIndex(nextZone);
      }

      const side = pos.current < 38 ? 'left' : pos.current > 62 ? 'right' : 'center';
      if (side !== sideRef.current) {
        sideRef.current = side;
        setBubbleSide(side);
      }

      const scene = sceneRef.current;
      const actor = actorRef.current;
      const bubble = bubbleRef.current;
      if (scene && actor && bubble) {
        const width = scene.clientWidth;
        const bw = bubble.offsetWidth;
        const center = (pos.current / 100) * width;
        const ideal = Math.min(Math.max(center - bw / 2, 8), Math.max(8, width - bw - 8));
        actor.style.setProperty('--bubble-shift', `${ideal - (center - bw / 2)}px`);
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const typing = (el: EventTarget | null) => {
      const node = el as HTMLElement | null;
      if (!node) return false;
      const tag = node.tagName?.toLowerCase();
      return tag === 'input' || tag === 'textarea' || tag === 'select' || node.isContentEditable;
    };

    const down = (e: KeyboardEvent) => {
      if (typing(e.target)) return;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') {
        keys.current.left = true;
        setManualBubble(null);
        e.preventDefault();
      }
      if (k === 'arrowright' || k === 'd') {
        keys.current.right = true;
        setManualBubble(null);
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keys.current.left = false;
      if (k === 'arrowright' || k === 'd') keys.current.right = false;
    };
    const blur = () => {
      keys.current.left = false;
      keys.current.right = false;
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, []);

  const walkTo = useCallback((clientX: number) => {
    const box = sceneRef.current?.getBoundingClientRect();
    if (!box) return;
    target.current = clamp(((clientX - box.left) / box.width) * 100);
    setManualBubble(null);
  }, []);

  const onActorPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      active: true,
      id: e.pointerId,
      x: e.clientX,
      startX: e.clientX,
      startPos: pos.current,
      moved: false,
    };
    setDragging(true);
    setManualBubble(null);
  };

  const onActorPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active || d.id !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > 5) d.moved = true;
    if (!d.moved) return;

    const box = sceneRef.current?.getBoundingClientRect();
    if (!box) return;
    const [lo, hi] = dragBounds();
    const half = (actorRef.current?.offsetWidth ?? 160) / 2;
    const safeLo = Math.max(lo, (half / box.width) * 100 + 1);
    const safeHi = Math.min(hi, 100 - (half / box.width) * 100 - 1);
    const next = Math.min(safeHi, Math.max(safeLo, d.startPos + (dx / box.width) * 100));
    pos.current = next;
    target.current = next;
    actorRef.current?.style.setProperty('--x', `${next}%`);
    setDir(dx < 0 ? 'left' : 'right');
    setWalking(true);
  };

  const onActorPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d.id !== e.pointerId) return;
    const wasMoved = d.moved;
    d.active = false;
    d.id = -1;
    setDragging(false);
    setWalking(false);

    if (!wasMoved) {
      setWaveKey((n) => n + 1);
      setManualBubble((m) => (m === null ? 0 : (m + 1) % TAP_MESSAGES.length));
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.target as HTMLElement;
    if (el.closest('[data-object]') || el.closest('[data-no-walk]')) return;
    walkTo(e.clientX);
  };

  return (
    <section
      id="hero"
      className="dio"
      ref={sceneRef}
      onPointerDown={onPointerDown}
      aria-label="Ruang kerja teknisi listrik interaktif"
    >
      <div className="dio-photo" aria-hidden="true">
        <SafeImg
          src="/foto/hero-control-room.jpg"
          fallback="/foto/panel-distribusi.jpg"
          alt=""
          loading="eager"
        />
      </div>

      <svg className="dio-room" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="rmWin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f7d79a" stopOpacity="0.5" />
            <stop offset="1" stopColor="#c98a3c" stopOpacity="0.06" />
          </linearGradient>
          <radialGradient id="rmLamp" cx="0.5" cy="0" r="1">
            <stop offset="0" stopColor="#ffd89a" stopOpacity="0.42" />
            <stop offset="1" stopColor="#ffd89a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="rmFloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1014" stopOpacity="0.1" />
            <stop offset="1" stopColor="#05080a" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="rmWall" x1="0" y1="0" x2="0.2" y2="1">
            <stop offset="0" stopColor="#1a2429" stopOpacity="0.94" />
            <stop offset="0.55" stopColor="#101a20" stopOpacity="0.95" />
            <stop offset="1" stopColor="#080d10" stopOpacity="0.97" />
          </linearGradient>
          <radialGradient id="rmSun" cx="0.1" cy="0.3" r="0.7">
            <stop offset="0" stopColor="#ffcf92" stopOpacity="0.28" />
            <stop offset="1" stopColor="#ffcf92" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width="1440" height="900" fill="url(#rmWall)" />
        <rect x="0" y="0" width="1440" height="900" fill="url(#rmSun)" />

        <g stroke="#7f8f98" strokeOpacity="0.09" strokeWidth="2">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <line key={`rib${i}`} x1={60 + i * 110} y1="90" x2={60 + i * 110} y2="700" />
          ))}
        </g>

        <g opacity="0.9">
          <rect x="34" y="150" width="210" height="330" rx="6" fill="url(#rmWin)" />
          <g stroke="#0a0e11" strokeWidth="7" strokeOpacity="0.65">
            <line x1="139" y1="150" x2="139" y2="480" />
            <line x1="34" y1="285" x2="244" y2="285" />
            <line x1="34" y1="390" x2="244" y2="390" />
          </g>
          <rect x="34" y="150" width="210" height="330" rx="6" fill="none" stroke="#2b373d" strokeWidth="4" />
        </g>

        <g stroke="#5b6a73" strokeOpacity="0.55" strokeWidth="5" fill="none">
          <path d="M300 92v250h150" />
          <path d="M300 92h520v120" />
          <path d="M1180 90v190h180" />
        </g>
        <g fill="#1a242a" stroke="#66757e" strokeOpacity="0.6" strokeWidth="2">
          <rect x="282" y="330" width="36" height="26" rx="3" />
          <rect x="800" y="196" width="38" height="28" rx="3" />
          <rect x="1146" y="264" width="34" height="26" rx="3" />
        </g>

        <g>
          <line x1="520" y1="0" x2="520" y2="96" stroke="#3b474e" strokeWidth="3" />
          <path d="M492 96h56l14 26h-84z" fill="#26333a" stroke="#4a585f" strokeWidth="2" />
          <ellipse cx="520" cy="126" rx="120" ry="60" fill="url(#rmLamp)" />
          <line x1="980" y1="0" x2="980" y2="78" stroke="#3b474e" strokeWidth="3" />
          <path d="M955 78h50l12 22h-74z" fill="#26333a" stroke="#4a585f" strokeWidth="2" />
          <ellipse cx="980" cy="104" rx="110" ry="54" fill="url(#rmLamp)" opacity="0.7" />
        </g>

        <rect x="0" y="626" width="1440" height="16" fill="#020507" opacity="0.6" />
        <line x1="0" y1="626" x2="1440" y2="626" stroke="#7c8b93" strokeOpacity="0.28" strokeWidth="2" />

        <rect x="0" y="640" width="1440" height="260" fill="url(#rmFloor)" />
        <g stroke="#8fa2aa" strokeOpacity="0.07" strokeWidth="2">
          <line x1="0" y1="700" x2="1440" y2="700" />
          <line x1="0" y1="770" x2="1440" y2="770" />
          <line x1="120" y1="640" x2="40" y2="900" />
          <line x1="1320" y1="640" x2="1404" y2="900" />
        </g>

        <g opacity="0.6">
          <rect x="596" y="108" width="248" height="46" rx="4" fill="#0c1216" stroke="#48575f" strokeWidth="2" />
          <text
            x="720"
            y="138"
            textAnchor="middle"
            fill="#c9d6db"
            fontSize="18"
            fontFamily="ui-monospace, monospace"
            letterSpacing="4"
          >
            BAY 03 · POWER
          </text>
        </g>
      </svg>

      <div className="dio-wash" aria-hidden="true" />

      {/* wall schematic board → #tentang */}
      <button
        type="button"
        data-object="board"
        className="dio-obj dio-board"
        onClick={() => scrollToId('tentang')}
        aria-label="Buka Tentang Kami"
      >
        <span className="dio-art" aria-hidden="true">
          <svg viewBox="0 0 320 220" role="presentation">
            <rect x="6" y="6" width="308" height="208" rx="10" fill="#0f1519" stroke="#3d4a52" strokeWidth="2" />
            <g stroke="#1e2b33" strokeWidth="1">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <line key={`h${i}`} x1="18" y1={30 + i * 32} x2="302" y2={30 + i * 32} />
              ))}
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <line key={`v${i}`} x1={36 + i * 36} y1="18" x2={36 + i * 36} y2="204" />
              ))}
            </g>
            <g fill="none" stroke="#f5c451" strokeWidth="2.4" strokeLinecap="round">
              <path d="M40 96h34l10-14 14 28 10-14h30" />
              <path d="M40 96v52h108" />
              <circle cx="106" cy="148" r="9" />
              <path d="M180 62v56h44l12-12 18 24 12-12h28" />
              <circle cx="224" cy="118" r="7" />
            </g>
            <g fill="#4fd1c5">
              <rect x="40" y="44" width="46" height="18" rx="3" />
              <rect x="40" y="176" width="86" height="12" rx="3" />
              <rect x="196" y="176" width="106" height="12" rx="3" />
            </g>
            <g fill="#c3d2d8" fontSize="12" letterSpacing="1" fontFamily="ui-monospace, monospace">
              <text x="40" y="38">
                PUIL 2021
              </text>
              <text x="234" y="150">
                IEC 60364
              </text>
            </g>
          </svg>
        </span>
        <span className="dio-tag">Papan Skematik · Tentang</span>
      </button>

      {/* distribution cabinet → #proyek */}
      <button
        type="button"
        data-object="cabinet"
        className="dio-obj dio-cabinet"
        onClick={() => scrollToId('proyek')}
        aria-label="Buka Proyek"
      >
        <span className="dio-art" aria-hidden="true">
          <svg viewBox="0 0 180 320" role="presentation">
            <rect x="10" y="8" width="160" height="304" rx="8" fill="#141c22" stroke="#46545d" strokeWidth="3" />
            <rect x="24" y="22" width="132" height="34" rx="4" fill="#0b1116" stroke="#33424b" />
            <circle cx="42" cy="39" r="6" fill="#4ade80" />
            <circle cx="62" cy="39" r="6" fill="#f5c451" />
            <circle cx="82" cy="39" r="6" fill="#f87171" />
            <g fill="#0b1116" stroke="#33424b">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <rect key={i} x="26" y={76 + i * 26} width="128" height="16" rx="3" />
              ))}
            </g>
            <g fill="#8aa0ab" fontSize="11" fontFamily="ui-monospace, monospace">
              <text x="34" y="88">
                R
              </text>
              <text x="34" y="114">
                S
              </text>
              <text x="34" y="140">
                T
              </text>
              <text x="34" y="166">
                N
              </text>
            </g>
            <g stroke="#f5c451" strokeWidth="2">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <line key={i} x1="120" y1={80 + i * 26} x2="146" y2={88 + i * 26} />
              ))}
            </g>
            <rect x="24" y="266" width="132" height="30" rx="4" fill="#0b1116" stroke="#33424b" />
            <text x="34" y="286" fill="#8aa0ab" fontSize="11" fontFamily="ui-monospace, monospace">
              380V · 3~
            </text>
          </svg>
        </span>
        <span className="dio-tag">Panel Distribusi · Proyek</span>
      </button>

      {/* performer */}
      <div
        className={`dio-actor${dragging ? ' is-dragging' : ''}`}
        ref={actorRef}
        data-object="engineer"
        data-side={bubbleSide}
        role="button"
        tabIndex={0}
        aria-label="Geser teknisi, atau ketuk untuk menyapa"
        draggable={false}
        style={{ touchAction: 'none' }}
        onPointerDown={onActorPointerDown}
        onPointerMove={onActorPointerMove}
        onPointerUp={onActorPointerUp}
        onPointerCancel={onActorPointerUp}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setWaveKey((n) => n + 1);
            setManualBubble((m) => (m === null ? 0 : (m + 1) % TAP_MESSAGES.length));
          }
        }}
      >
        <span
          className="dio-bubble"
          role="status"
          ref={bubbleRef}
          key={manualBubble ?? `z${zoneIndex}`}
        >
          {manualBubble !== null ? TAP_MESSAGES[manualBubble] : ZONES[zoneIndex].text}
        </span>
        <span className="dio-flip" data-dir={dir}>
          <EngineerCharacter2D active={walking} waveKey={waveKey} walking={walking} />
        </span>
      </div>

      {/* foreground bench */}
      <div className="dio-desk" aria-hidden="true">
        <div className="dio-desk-top" />
        <div className="dio-desk-face">
          <span className="dio-desk-grille" />
          <span className="dio-desk-led" />
          <span className="dio-desk-label">MAIN PANEL · EE-01</span>
        </div>
      </div>

      {/* oscilloscope bench → #simulator */}
      <button
        type="button"
        data-object="rig"
        className="dio-obj dio-rig"
        onClick={() => scrollToId('simulator')}
        aria-label="Buka Electrical Engineering Lab"
      >
        <span className="dio-art" aria-hidden="true">
          <svg viewBox="0 0 220 150" role="presentation">
            <rect x="8" y="10" width="204" height="96" rx="8" fill="#0c1216" stroke="#47555e" strokeWidth="3" />
            <rect x="22" y="24" width="118" height="66" rx="4" fill="#081015" stroke="#2c3d46" />
            <path
              d="M30 74c10 0 12-30 22-30s10 34 20 34 10-26 20-26 10 22 20 22 8-12 20-12"
              fill="none"
              stroke="#4fd1c5"
              strokeWidth="2"
            />
            <g fill="none" stroke="#f5c451" strokeWidth="2">
              <path d="M30 60c10 0 12-18 22-18s10 22 20 22 10-16 20-16 10 14 20 14" opacity="0.75" />
            </g>
            <circle cx="176" cy="42" r="15" fill="#111b21" stroke="#5b6a73" strokeWidth="2" />
            <line x1="176" y1="42" x2="186" y2="34" stroke="#f5c451" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="160" cy="78" r="7" fill="#f87171" />
            <circle cx="182" cy="78" r="7" fill="#4ade80" />
          </svg>
        </span>
        <span className="dio-tag">Meja Osiloskop · Lab</span>
      </button>

      <a className="dio-scroll" href="#tentang" data-no-walk>
        <span aria-hidden="true">↓</span> Scroll
      </a>
    </section>
  );
}
