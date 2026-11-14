'use client';

import { useMemo, useState } from 'react';
import { Badge, LabCard, Readout, Segmented, Slider, fmt, amps } from './LabPrimitives';

type System = '1p' | '3p';
type Load = 'resistive' | 'motor';

const MCB = [2, 4, 6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
const CABLES: { size: number; kha: number }[] = [
  { size: 1.5, kha: 18 },
  { size: 2.5, kha: 25 },
  { size: 4, kha: 34 },
  { size: 6, kha: 44 },
  { size: 10, kha: 60 },
  { size: 16, kha: 80 },
  { size: 25, kha: 105 },
  { size: 35, kha: 130 },
  { size: 50, kha: 160 },
];
const RHO = 0.0175; // Ω·mm²/m — tembaga

export default function SizingTab() {
  const [power, setPower] = useState(4500);
  const [system, setSystem] = useState<System>('1p');
  const [load, setLoad] = useState<Load>('resistive');
  const [length, setLength] = useState(35);

  const voltage = system === '1p' ? 220 : 380;
  const cosPhi = load === 'motor' ? 0.8 : 1;
  const mcbFactor = load === 'motor' ? 1.25 : 1;

  const calc = useMemo(() => {
    const iNom = system === '1p' ? power / (voltage * cosPhi) : power / (Math.sqrt(3) * voltage * cosPhi);
    const required = iNom * mcbFactor;
    const rating = MCB.find((r) => r >= required) ?? 125;
    const overLimit = required > 125;
    const cable = CABLES.find((c) => c.kha >= rating) ?? CABLES[CABLES.length - 1];

    const vd = (current: number, area: number) =>
      system === '1p' ? (2 * length * current * RHO) / area : (Math.sqrt(3) * length * current * RHO) / area;

    const drop = vd(iNom, cable.size);
    const dropPct = (drop / voltage) * 100;

    let suggested = cable;
    let suggestedDrop = drop;
    for (const c of CABLES) {
      if (c.size < cable.size) continue;
      const d = vd(iNom, c.size);
      if ((d / voltage) * 100 <= 3) {
        suggested = c;
        suggestedDrop = d;
        break;
      }
    }

    return {
      iNom,
      required,
      rating,
      overLimit,
      cable,
      drop,
      dropPct,
      suggested,
      suggestedDrop,
      suggestedPct: (suggestedDrop / voltage) * 100,
    };
  }, [power, system, cosPhi, mcbFactor, length, voltage]);

  const safe = calc.dropPct <= 3;
  const inA = amps(calc.iNom);

  return (
    <div className="lab-tab-grid">
      <div className="lab-tab-main">
        <LabCard title="Parameter instalasi" hint="PUIL 2021 · kabel tembaga NYM/NYY">
          <div className="lab-stack">
            <Slider
              label="Daya beban"
              value={power}
              min={100}
              max={50000}
              step={100}
              display={`${fmt(power, 0)} W`}
              onChange={setPower}
            />
            <div className="lab-inline-2">
              <span className="lab-inline-note">
                Padanan: <strong>{fmt(power / 1000, 2)} kW</strong>
              </span>
              <span className="lab-inline-note">
                cos φ beban: <strong>{fmt(cosPhi, 2)}</strong>
              </span>
            </div>

            <Segmented<System>
              label="Sistem tegangan"
              value={system}
              onChange={setSystem}
              options={[
                { value: '1p', label: '1 Fasa (220 V)' },
                { value: '3p', label: '3 Fasa (380 V)' },
              ]}
            />

            <Segmented<Load>
              label="Karakteristik beban"
              value={load}
              onChange={setLoad}
              options={[
                { value: 'resistive', label: 'Resistif · cos φ 1.0' },
                { value: 'motor', label: 'Motor induksi · cos φ 0.8' },
              ]}
            />

            <Slider
              label="Panjang tarikan kabel"
              value={length}
              min={1}
              max={200}
              step={1}
              unit="m"
              onChange={setLength}
            />
          </div>
        </LabCard>

        <LabCard title="Jatuh tegangan (voltage drop)" hint="ΔV = k · L · I · ρ / A">
          <div className={`lab-vd${safe ? ' is-safe' : ' is-bad'}`}>
            <div className="lab-vd-bar">
              <span style={{ width: `${Math.min(100, (calc.dropPct / 5) * 100)}%` }} />
              <i className="lab-vd-limit" title="Batas 3%" />
            </div>
            <div className="lab-vd-meta">
              <span>
                ΔV <strong>{fmt(calc.drop, 2)} V</strong> · {fmt(calc.dropPct, 2)}%
              </span>
              <span>Batas aman 3% ({fmt(voltage * 0.03, 1)} V)</span>
            </div>
          </div>

          {!safe && (
            <div className="lab-callout">
              <strong>Jatuh tegangan melebihi 3%.</strong> Naikkan penampang kabel ke{' '}
              <b>{fmt(calc.suggested.size, 1)} mm²</b> agar ΔV turun ke {fmt(calc.suggestedPct, 2)}% (
              {fmt(calc.suggestedDrop, 2)} V).
            </div>
          )}
        </LabCard>
      </div>

      <div className="lab-tab-side">
        <LabCard title="Rekomendasi proteksi & kabel">
          <div className="lab-readouts">
            <Readout
              label="Arus nominal (In)"
              value={inA.value}
              unit={inA.unit}
              hint={`In = P / (${system === '1p' ? 'V · cos φ' : '√3 · V · cos φ'})`}
            />
            <Readout
              label="Rating MCB / MCCB"
              value={calc.overLimit ? '—' : String(calc.rating)}
              unit={calc.overLimit ? undefined : 'A'}
              tone={calc.overLimit ? 'bad' : 'good'}
              hint={`In × faktor ${fmt(mcbFactor, 2)} = ${fmt(calc.required, 2)} A → nilai standar terdekat`}
            />
            <Readout
              label="Kabel minimum"
              value={fmt(calc.cable.size, 1)}
              unit="mm²"
              tone="good"
              hint={`KHA ${calc.cable.kha} A ≥ rating ${calc.rating} A`}
            />
            <Readout
              label="Voltage drop"
              value={fmt(calc.dropPct, 2)}
              unit="%"
              tone={safe ? 'good' : 'bad'}
              hint={`${fmt(calc.drop, 2)} V dari ${voltage} V · ${length} m`}
            />
          </div>

          <div className="lab-foot">
            {calc.overLimit ? (
              <Badge tone="bad">Arus melebihi 125 A — gunakan MCCB industri, bukan MCB modular</Badge>
            ) : safe ? (
              <Badge tone="good">Desain memenuhi PUIL 2021 — ΔV ≤ 3%</Badge>
            ) : (
              <Badge tone="warn">Perbesar kabel atau perpendek tarikan untuk menekan ΔV</Badge>
            )}
          </div>
        </LabCard>

        <LabCard title="Tabel penampang (KHA PUIL)">
          <table className="lab-table">
            <thead>
              <tr>
                <th>Penampang</th>
                <th>KHA</th>
                <th>ΔV</th>
              </tr>
            </thead>
            <tbody>
              {CABLES.map((c) => {
                const d = system === '1p'
                  ? (2 * length * calc.iNom * RHO) / c.size
                  : (Math.sqrt(3) * length * calc.iNom * RHO) / c.size;
                const pct = (d / voltage) * 100;
                const active = c.size === calc.cable.size;
                return (
                  <tr key={c.size} className={active ? 'is-active' : undefined}>
                    <td>{fmt(c.size, 1)} mm²</td>
                    <td>{c.kha} A</td>
                    <td className={pct > 3 ? 'is-bad' : 'is-good'}>{fmt(pct, 2)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </LabCard>
      </div>
    </div>
  );
}
