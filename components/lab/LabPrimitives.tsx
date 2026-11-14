'use client';

import type { ReactNode } from 'react';

/* ============================ shared lab primitives ============================ */

export function LabCard({
  title,
  hint,
  children,
  className = '',
}: {
  title?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`lab-card ${className}`}>
      {(title || hint) && (
        <header className="lab-card-head">
          {title && <h3 className="lab-card-title">{title}</h3>}
          {hint && <span className="lab-card-hint">{hint}</span>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string; disabled?: boolean }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="lab-seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`lab-seg-btn${o.value === value ? ' is-on' : ''}`}
          aria-pressed={o.value === value}
          disabled={o.disabled}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  display,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  display?: string;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className={`lab-slider${disabled ? ' is-disabled' : ''}`}>
      <span className="lab-slider-top">
        <span className="lab-slider-label">{label}</span>
        <span className="lab-slider-value">
          {display ?? value}
          {unit && <em>{unit}</em>}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={label}
        style={{ ['--fill' as string]: `${Math.max(0, Math.min(100, pct))}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export function Readout({
  label,
  value,
  unit,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  tone?: 'default' | 'good' | 'warn' | 'bad';
}) {
  return (
    <div className={`lab-readout is-${tone}`}>
      <span className="lab-readout-label">{label}</span>
      <span className="lab-readout-value">
        {value}
        {unit && <em>{unit}</em>}
      </span>
      {hint && <span className="lab-readout-hint">{hint}</span>}
    </div>
  );
}

export function Badge({ tone, children }: { tone: 'good' | 'warn' | 'bad'; children: ReactNode }) {
  return (
    <span className={`lab-badge is-${tone}`}>
      <i aria-hidden="true" />
      {children}
    </span>
  );
}

/* ------------------------------- number formatting ------------------------------- */

const id = (n: number, digits: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** Engineering formatting: 1,234.56 */
export function fmt(n: number, digits = 2) {
  if (!Number.isFinite(n)) return '—';
  return id(n, digits);
}

/** Auto-format amps: 0.0545 A → 54.55 mA */
export function amps(a: number) {
  if (!Number.isFinite(a)) return { value: '—', unit: 'A' };
  if (a >= 1) return { value: fmt(a, 2), unit: 'A' };
  return { value: fmt(a * 1000, 2), unit: 'mA' };
}

/** Auto-format ohms: 470 Ω / 4,70 kΩ / 1,20 MΩ */
export function ohms(o: number) {
  if (!Number.isFinite(o)) return { value: '—', unit: 'Ω' };
  if (o >= 1e6) return { value: fmt(o / 1e6, 2), unit: 'MΩ' };
  if (o >= 1e3) return { value: fmt(o / 1e3, 2), unit: 'kΩ' };
  return { value: fmt(o, o < 100 ? 1 : 0), unit: 'Ω' };
}

/** Auto-format watts: 0,65 W / 1,25 kW */
export function watts(w: number) {
  if (!Number.isFinite(w)) return { value: '—', unit: 'W' };
  if (Math.abs(w) >= 1000) return { value: fmt(w / 1000, 2), unit: 'kW' };
  return { value: fmt(w, 2), unit: 'W' };
}
