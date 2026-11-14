'use client';

import { useMemo, useState } from 'react';
import { LabCard, Readout, Segmented, fmt, ohms } from './LabPrimitives';

type Mode = '4' | '5';

type ColorKey =
  | 'black'
  | 'brown'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'violet'
  | 'grey'
  | 'white';

const DIGIT_COLORS: { key: ColorKey; name: string; hex: string; digit: number }[] = [
  { key: 'black', name: 'Hitam', hex: '#1b1f24', digit: 0 },
  { key: 'brown', name: 'Coklat', hex: '#7b4a24', digit: 1 },
  { key: 'red', name: 'Merah', hex: '#d84343', digit: 2 },
  { key: 'orange', name: 'Oranye', hex: '#ee8b2d', digit: 3 },
  { key: 'yellow', name: 'Kuning', hex: '#e9c93f', digit: 4 },
  { key: 'green', name: 'Hijau', hex: '#2f9e5f', digit: 5 },
  { key: 'blue', name: 'Biru', hex: '#2f6fd0', digit: 6 },
  { key: 'violet', name: 'Ungu', hex: '#8b5bd6', digit: 7 },
  { key: 'grey', name: 'Abu-abu', hex: '#9aa4ae', digit: 8 },
  { key: 'white', name: 'Putih', hex: '#eef2f6', digit: 9 },
];

type MultKey = ColorKey | 'gold' | 'silver';

const MULTIPLIERS: { key: MultKey; name: string; hex: string; mult: number; label: string }[] = [
  { key: 'black', name: 'Hitam', hex: '#1b1f24', mult: 1, label: '×1' },
  { key: 'brown', name: 'Coklat', hex: '#7b4a24', mult: 10, label: '×10' },
  { key: 'red', name: 'Merah', hex: '#d84343', mult: 100, label: '×100' },
  { key: 'orange', name: 'Oranye', hex: '#ee8b2d', mult: 1e3, label: '×1k' },
  { key: 'yellow', name: 'Kuning', hex: '#e9c93f', mult: 1e4, label: '×10k' },
  { key: 'green', name: 'Hijau', hex: '#2f9e5f', mult: 1e5, label: '×100k' },
  { key: 'blue', name: 'Biru', hex: '#2f6fd0', mult: 1e6, label: '×1M' },
  { key: 'gold', name: 'Emas', hex: '#d4af37', mult: 0.1, label: '×0.1' },
  { key: 'silver', name: 'Perak', hex: '#c6ccd2', mult: 0.01, label: '×0.01' },
];

const TOLERANCES = [
  { key: 'brown', name: 'Coklat', hex: '#7b4a24', pct: 1 },
  { key: 'red', name: 'Merah', hex: '#d84343', pct: 2 },
  { key: 'green', name: 'Hijau', hex: '#2f9e5f', pct: 0.5 },
  { key: 'gold', name: 'Emas', hex: '#d4af37', pct: 5 },
  { key: 'silver', name: 'Perak', hex: '#c6ccd2', pct: 10 },
] as const;

export default function ResistorTab() {
  const [mode, setMode] = useState<Mode>('4');
  const [d1, setD1] = useState<ColorKey>('brown');
  const [d2, setD2] = useState<ColorKey>('black');
  const [d3, setD3] = useState<ColorKey>('black');
  const [mult, setMult] = useState<MultKey>('red');
  const [tol, setTol] = useState<(typeof TOLERANCES)[number]['key']>('gold');

  const calc = useMemo(() => {
    const v1 = DIGIT_COLORS.find((c) => c.key === d1)!.digit;
    const v2 = DIGIT_COLORS.find((c) => c.key === d2)!.digit;
    const v3 = DIGIT_COLORS.find((c) => c.key === d3)!.digit;
    const factor = MULTIPLIERS.find((m) => m.key === mult)!.mult;
    const base = mode === '4' ? v1 * 10 + v2 : v1 * 100 + v2 * 10 + v3;
    const value = base * factor;
    const tolerance = TOLERANCES.find((t) => t.key === tol)!.pct;
    return {
      value,
      tolerance,
      min: value * (1 - tolerance / 100),
      max: value * (1 + tolerance / 100),
      bands: [
        DIGIT_COLORS.find((c) => c.key === d1)!.hex,
        DIGIT_COLORS.find((c) => c.key === d2)!.hex,
        ...(mode === '5' ? [DIGIT_COLORS.find((c) => c.key === d3)!.hex] : []),
        MULTIPLIERS.find((m) => m.key === mult)!.hex,
        TOLERANCES.find((t) => t.key === tol)!.hex,
      ],
    };
  }, [mode, d1, d2, d3, mult, tol]);

  const unit = ohms(calc.value);
  const minU = ohms(calc.min);
  const maxU = ohms(calc.max);

  return (
    <div className="lab-tab-grid">
      <div className="lab-tab-main">
        <LabCard title="Dekoder kode warna" hint={mode === '4' ? '4 gelang — presisi standar' : '5 gelang — presisi tinggi'}>
          <div className="lab-resistor-stage">
            <svg viewBox="0 0 520 170" className="lab-resistor" role="img" aria-label={`Resistor ${mode} gelang`}>
              <line x1="0" y1="85" x2="130" y2="85" stroke="#9aa4ae" strokeWidth="4" strokeLinecap="round" />
              <line x1="390" y1="85" x2="520" y2="85" stroke="#9aa4ae" strokeWidth="4" strokeLinecap="round" />
              <rect x="130" y="40" width="260" height="90" rx="38" fill="#d9c9a3" stroke="#a38f68" strokeWidth="2" />
              <rect x="130" y="52" width="260" height="12" rx="6" fill="rgba(255,255,255,0.35)" />
              {calc.bands.map((hex, i) => {
                const total = calc.bands.length;
                const startX = total === 4 ? 172 : 162;
                const step = total === 4 ? 52 : 45;
                const x = startX + i * step;
                return (
                  <g key={`${hex}-${i}`}>
                    <rect x={x} y="40" width="22" height="90" fill={hex} stroke="rgba(0,0,0,0.35)" strokeWidth="1" />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="lab-resistor-result">
            <span className="lab-resistor-value">
              {unit.value} <em>{unit.unit}</em>
            </span>
            <span className="lab-resistor-range">
              {minU.value} {minU.unit} – {maxU.value} {maxU.unit} · toleransi ±{fmt(calc.tolerance, 1)}%
            </span>
          </div>
        </LabCard>

        <LabCard title="Pita gelang">
          <div className="lab-bands">
            {calc.bands.map((hex, i) => {
              const names =
                i < calc.bands.length - 2
                  ? DIGIT_COLORS.find((c) => c.hex === hex)?.name
                  : i === calc.bands.length - 2
                    ? MULTIPLIERS.find((m) => m.hex === hex)?.name
                    : TOLERANCES.find((t) => t.hex === hex)?.name;
              const role =
                i < calc.bands.length - 2 ? `Digit ${i + 1}` : i === calc.bands.length - 2 ? 'Multiplier' : 'Toleransi';
              return (
                <div key={i} className="lab-band-chip">
                  <i style={{ background: hex }} />
                  <div>
                    <strong>{role}</strong>
                    <span>{names}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </LabCard>
      </div>

      <div className="lab-tab-side">
        <LabCard title="Konfigurasi gelang">
          <div className="lab-stack">
            <Segmented<Mode>
              label="Jumlah gelang"
              value={mode}
              onChange={setMode}
              options={[
                { value: '4', label: '4-Band' },
                { value: '5', label: '5-Band' },
              ]}
            />
            <ColorSelect label="Digit 1" value={d1} onChange={setD1} />
            <ColorSelect label="Digit 2" value={d2} onChange={setD2} />
            {mode === '5' && <ColorSelect label="Digit 3" value={d3} onChange={setD3} />}
            <label className="lab-select">
              <span>Multiplier</span>
              <select value={mult} onChange={(e) => setMult(e.target.value as MultKey)}>
                {MULTIPLIERS.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.name} {m.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="lab-select">
              <span>Toleransi</span>
              <select value={tol} onChange={(e) => setTol(e.target.value as (typeof TOLERANCES)[number]['key'])}>
                {TOLERANCES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.name} ±{t.pct}%
                  </option>
                ))}
              </select>
            </label>
          </div>
        </LabCard>

        <LabCard title="Nilai terhitung">
          <div className="lab-readouts">
            <Readout label="Nilai nominal" value={unit.value} unit={unit.unit} tone="good" />
            <Readout label="Nilai minimum" value={minU.value} unit={minU.unit} />
            <Readout label="Nilai maksimum" value={maxU.value} unit={maxU.unit} />
            <Readout label="Rentang" value={`${fmt(calc.max - calc.min, 2)}`} unit={unit.unit} hint="Selisih min–maks" />
          </div>
          <p className="lab-note">
            Gelang angka hanya memakai 10 warna digit. Emas (×0.1 / ±5%) dan Perak (×0.01 / ±10%) khusus untuk
            multiplier dan toleransi.
          </p>
        </LabCard>
      </div>
    </div>
  );
}

function ColorSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ColorKey;
  onChange: (v: ColorKey) => void;
}) {
  return (
    <label className="lab-select">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as ColorKey)}>
        {DIGIT_COLORS.map((c) => (
          <option key={c.key} value={c.key}>
            {c.name} ({c.digit})
          </option>
        ))}
      </select>
    </label>
  );
}
