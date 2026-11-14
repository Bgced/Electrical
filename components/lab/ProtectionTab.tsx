'use client';

import { useEffect, useRef, useState } from 'react';
import { Badge, LabCard, Readout, fmt } from './LabPrimitives';

type Scenario = 'normal' | 'overload' | 'short' | 'ground';
type Trip = null | 'tor' | 'mccb' | 'rccb';

const SCENARIOS: { id: Scenario; label: string; desc: string }[] = [
  { id: 'normal', label: 'Operasi Normal', desc: '11.8 A · bocor 2 mA · TOR 38 °C' },
  { id: 'overload', label: 'Overload 140%', desc: '19.6 A · bimetal memanas 3 detik' },
  { id: 'short', label: 'Short Circuit', desc: '480 A · trip magnetik instan' },
  { id: 'ground', label: 'Ground Fault', desc: 'Bocor 48 mA > 30 mA · RCCB trip' },
];

const DIAGNOSTIC: Record<Scenario, { cause: string; device: string; standard: string; tone: 'good' | 'warn' | 'bad' }> = {
  normal: {
    cause: 'Beban motor 7.5 kW beroperasi pada arus nominal 11.8 A. Tidak ada anomali termal maupun kebocoran isolasi.',
    device: 'Seluruh proteksi siaga — MCCB, RCCB, dan TOR dalam kondisi tertutup.',
    standard: 'PUIL 2021 §5.5 · IEC 60364-4-43',
    tone: 'good',
  },
  overload: {
    cause: 'Arus beban naik ke 19.6 A (140% In). Bimetal TOR memanas bertahap hingga mencapai kurva trip termal.',
    device: 'Thermal Overload Relay memutus sirkuit kontrol kontaktor setelah akumulasi panas 100% (±3 detik).',
    standard: 'PUIL 2021 §5.5.3 · IEC 60947-4-1 (kelas 10A)',
    tone: 'warn',
  },
  short: {
    cause: 'Hubung singkat fasa-fasa memicu arus 480 A (± 13× In) dalam waktu kurang dari satu siklus.',
    device: 'MCCB Utama trip seketika melalui elemen magnetik (instantaneous), membatasi energi let-through.',
    standard: 'PUIL 2021 §5.5.2 · IEC 60947-2 (kurva C, Icu 36 kA)',
    tone: 'bad',
  },
  ground: {
    cause: 'Isolasi motor bocor ke pembumian sebesar 48 mA — melampaui ambang sensitivitas 30 mA.',
    device: 'ELCB/RCCB 30 mA memutus rangkaian melalui elemen diferensial dalam < 30 ms.',
    standard: 'PUIL 2021 §5.6 · IEC 61008-1 (tipe AC, 30 mA)',
    tone: 'bad',
  },
};

export default function ProtectionTab() {
  const [scenario, setScenario] = useState<Scenario>('normal');
  const [heat, setHeat] = useState(0);
  const [trip, setTrip] = useState<Trip>(null);
  const [arc, setArc] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setHeat(0);
    setTrip(null);
    setArc(false);

    if (scenario === 'overload') {
      const start = Date.now();
      const id = window.setInterval(() => {
        const pct = Math.min(100, ((Date.now() - start) / 3000) * 100);
        setHeat(pct);
        if (pct >= 100) {
          window.clearInterval(id);
          setTrip('tor');
        }
      }, 50);
      return () => window.clearInterval(id);
    }

    if (scenario === 'short') {
      const id = window.setTimeout(() => {
        setTrip('mccb');
        setArc(true);
      }, 90);
      const id2 = window.setTimeout(() => setArc(false), 900);
      return () => {
        window.clearTimeout(id);
        window.clearTimeout(id2);
      };
    }

    if (scenario === 'ground') {
      const id = window.setTimeout(() => setTrip('rccb'), 120);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [scenario]);

  const tripped = trip !== null;
  const live = scenario === 'normal' || (scenario === 'overload' && !tripped) || (scenario === 'short' && !tripped) || (scenario === 'ground' && !tripped);
  const current = trip
    ? 0
    : scenario === 'overload'
      ? 19.6
      : scenario === 'short'
        ? 480
        : 11.8;
  const leakage = trip ? 0 : scenario === 'ground' ? 48 : 2;
  const temp = trip ? 96 : scenario === 'overload' ? 38 + (heat / 100) * 58 : 38;

  const diag = trip
    ? { ...DIAGNOSTIC[scenario], tone: 'bad' as const }
    : DIAGNOSTIC[scenario];

  return (
    <div className="lab-tab-grid">
      <div className="lab-tab-main">
        <LabCard title="Single-line diagram" hint="Grid 380 V → proteksi berlapis → motor 7.5 kW">
          <div className="lab-sld-wrap">
            <svg viewBox="0 0 900 230" className="lab-sld" role="img" aria-label="Diagram proteksi panel motor tiga fasa">
              <defs>
                <linearGradient id="sldWire" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="rgba(56,217,208,0.85)" />
                  <stop offset="1" stopColor="rgba(245,196,81,0.55)" />
                </linearGradient>
              </defs>

              <line x1="30" y1="115" x2="120" y2="115" stroke="url(#sldWire)" strokeWidth="3" />
              <line x1="228" y1="115" x2="300" y2="115" stroke="#38d9d0" strokeWidth="3" opacity={trip === 'mccb' ? 0.15 : 0.9} />
              <line x1="404" y1="115" x2="476" y2="115" stroke="#38d9d0" strokeWidth="3" opacity={trip === 'rccb' ? 0.15 : 0.9} />
              <line x1="580" y1="115" x2="652" y2="115" stroke="#38d9d0" strokeWidth="3" opacity={trip === 'tor' ? 0.15 : 0.9} />
              <line x1="752" y1="115" x2="824" y2="115" stroke="#38d9d0" strokeWidth="3" opacity={trip === 'tor' ? 0.15 : 0.9} />

              <GridNode />
              <BreakerNode x={120} label="MCCB" rating="32 A" state={trip === 'mccb' ? 'trip' : 'on'} y={115} />
              <BreakerNode x={300} label="ELCB/RCCB" rating="30 mA" state={trip === 'rccb' ? 'trip' : 'on'} y={115} />
              <Contactor x={476} label="KONTAKTOR" state={trip ? 'trip' : 'on'} />
              <TorNode x={652} state={trip === 'tor' ? 'trip' : 'on'} />
              <MotorNode x={824} spinning={!tripped && scenario !== 'normal' ? true : !tripped} />

              {arc && (
                <g className="lab-arc">
                  <circle cx="174" cy="115" r="24" fill="rgba(249,115,22,0.25)" />
                  <path d="M162 96 L178 112 L166 116 L184 136" stroke="#fbbf24" strokeWidth="3" fill="none" strokeLinecap="round" />
                </g>
              )}
            </svg>
          </div>

          <div className="lab-sld-legend">
            <span><i className="dot dot-green" /> Proteksi aktif</span>
            <span><i className="dot dot-red" /> Trip</span>
            <span><i className="dot dot-amber" /> Akumulasi panas TOR {fmt(heat, 0)}%</span>
          </div>
        </LabCard>

        <LabCard title="Panel diagnostik">
          <div className={`lab-diag is-${diag.tone}`}>
            <div>
              <span className="lab-diag-k">Penyebab</span>
              <p className="lab-diag-v">{diag.cause}</p>
            </div>
            <div>
              <span className="lab-diag-k">Komponen yang bekerja</span>
              <p className="lab-diag-v">{diag.device}</p>
            </div>
            <div>
              <span className="lab-diag-k">Referensi standar</span>
              <p className="lab-diag-v">{diag.standard}</p>
            </div>
          </div>
        </LabCard>
      </div>

      <div className="lab-tab-side">
        <LabCard title="Skenario pengujian">
          <div className="lab-actions">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`lab-action${scenario === s.id ? ' is-on' : ''}`}
                onClick={() => setScenario(s.id)}
              >
                <strong>{s.label}</strong>
                <span>{s.desc}</span>
              </button>
            ))}
          </div>
          <button type="button" className="lab-btn lab-btn-wide" onClick={() => setScenario('normal')}>
            ⟲ Reset semua proteksi
          </button>
        </LabCard>

        <LabCard title="Telemetri instan">
          <div className="lab-readouts">
            <Readout label="Arus beban" value={fmt(current, 1)} unit="A" tone={current > 20 ? 'bad' : 'good'} />
            <Readout label="Arus bocor" value={String(leakage)} unit="mA" tone={leakage > 30 ? 'bad' : 'good'} />
            <Readout label="Suhu TOR" value={fmt(temp, 0)} unit="°C" tone={temp > 70 ? 'bad' : temp > 50 ? 'warn' : 'good'} />
            <Readout label="Status proteksi" value={trip ? 'TRIP' : 'CLOSED'} tone={trip ? 'bad' : 'good'} />
          </div>
          <div className="lab-heat">
            <span>Akumulasi panas bimetal TOR</span>
            <div className="lab-heat-bar">
              <i style={{ width: `${heat}%` }} />
            </div>
            <b>{fmt(heat, 0)}%</b>
          </div>
          <div className="lab-foot">
            {trip === 'tor' && <Badge tone="warn">THERMAL TRIP — TOR memutus, MCCB tetap ON</Badge>}
            {trip === 'mccb' && <Badge tone="bad">INSTANTANEOUS MAGNETIC TRIP &lt; 0.1 s</Badge>}
            {trip === 'rccb' && <Badge tone="bad">DIFFERENTIAL TRIP — 48 mA terdeteksi</Badge>}
            {!trip && <Badge tone="good">Sistem {scenario === 'normal' ? 'normal' : 'uji berjalan'} · {live ? 'bertegangan' : 'terputus'}</Badge>}
          </div>
        </LabCard>
      </div>
    </div>
  );
}

/* ---------------------------------- svg nodes ---------------------------------- */

function nodeShell(active: boolean) {
  return active ? 'rgba(16,22,28,0.96)' : 'rgba(30,16,16,0.96)';
}

function GridNode() {
  return (
    <g>
      <rect x="30" y="88" width="90" height="54" rx="10" fill="rgba(12,18,24,0.95)" stroke="rgba(56,217,208,0.7)" strokeWidth="1.6" />
      <text x="75" y="110" textAnchor="middle" fill="#38d9d0" fontSize="12" fontWeight="700">GRID</text>
      <text x="75" y="128" textAnchor="middle" fill="rgba(233,238,245,0.72)" fontSize="11">380 V · 50 Hz</text>
    </g>
  );
}

function BreakerNode({ x, label, rating, state, y }: { x: number; label: string; rating: string; state: 'on' | 'trip'; y: number }) {
  const on = state === 'on';
  return (
    <g>
      <rect x={x} y={y - 34} width="108" height="68" rx="10" fill={nodeShell(on)} stroke={on ? 'rgba(56,217,208,0.75)' : 'rgba(239,83,80,0.85)'} strokeWidth="1.6" />
      <text x={x + 54} y={y - 12} textAnchor="middle" fill={on ? '#e9eef5' : '#ff8a80'} fontSize="11.5" fontWeight="700">{label}</text>
      <text x={x + 54} y={y + 5} textAnchor="middle" fill="rgba(233,238,245,0.65)" fontSize="10.5">{rating}</text>
      <text x={x + 54} y={y + 24} textAnchor="middle" fill={on ? '#7ee7c7' : '#ff8a80'} fontSize="10" fontWeight="700">
        {on ? 'CLOSED' : 'TRIP'}
      </text>
    </g>
  );
}

function Contactor({ x, label, state }: { x: number; label: string; state: 'on' | 'trip' }) {
  const on = state === 'on';
  return (
    <g>
      <rect x={x} y="81" width="104" height="68" rx="10" fill={nodeShell(on)} stroke={on ? 'rgba(245,196,81,0.7)' : 'rgba(239,83,80,0.85)'} strokeWidth="1.6" />
      <text x={x + 52} y="104" textAnchor="middle" fill="#f5c451" fontSize="10.5" fontWeight="700">{label}</text>
      <path d={`M${x + 26} 112 l14 16 l14 -16`} stroke={on ? '#7ee7c7' : '#ff8a80'} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <text x={x + 52} y="140" textAnchor="middle" fill={on ? '#7ee7c7' : '#ff8a80'} fontSize="10" fontWeight="700">{on ? 'ENERGISED' : 'OPEN'}</text>
    </g>
  );
}

function TorNode({ x, state }: { x: number; state: 'on' | 'trip' }) {
  const on = state === 'on';
  return (
    <g>
      <rect x={x} y="81" width="100" height="68" rx="10" fill={nodeShell(on)} stroke={on ? 'rgba(245,196,81,0.7)' : 'rgba(239,83,80,0.85)'} strokeWidth="1.6" />
      <text x={x + 50} y="103" textAnchor="middle" fill="#f5c451" fontSize="10.5" fontWeight="700">TOR</text>
      <text x={x + 50} y="118" textAnchor="middle" fill="rgba(233,238,245,0.65)" fontSize="10">14 A · klas 10</text>
      <text x={x + 50} y="138" textAnchor="middle" fill={on ? '#7ee7c7' : '#ff8a80'} fontSize="10" fontWeight="700">{on ? 'STANDBY' : 'TRIPPED'}</text>
    </g>
  );
}

function MotorNode({ x, spinning }: { x: number; spinning: boolean }) {
  return (
    <g>
      <circle cx={x + 38} cy="115" r="38" fill="rgba(12,18,24,0.95)" stroke="rgba(56,217,208,0.75)" strokeWidth="1.8" />
      <g className={`lab-rotor${spinning ? ' is-spinning' : ''}`} style={{ transformOrigin: `${x + 38}px 115px` }}>
        <path d={`M${x + 38} 91 L${x + 52} 115 L${x + 38} 139 L${x + 24} 115 Z`} fill="rgba(56,217,208,0.28)" stroke="#38d9d0" strokeWidth="1.4" />
      </g>
      <text x={x + 38} y="170" textAnchor="middle" fill="rgba(233,238,245,0.8)" fontSize="11" fontWeight="700">MOTOR 3Ø</text>
      <text x={x + 38} y="185" textAnchor="middle" fill="rgba(233,238,245,0.55)" fontSize="10">7.5 kW · 380 V</text>
    </g>
  );
}
