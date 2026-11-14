'use client';

import { useMemo, useState } from 'react';
import { LabCard, Readout, Segmented, Slider, fmt } from './LabPrimitives';

type Battery = '24' | '48';

const PSH = 4.5;
const DERATE = 0.8;
const DOD = 0.8;
const MODULE_WP = 550;

export default function SolarTab() {
  const [energy, setEnergy] = useState(12);
  const [peak, setPeak] = useState(3000);
  const [autonomy, setAutonomy] = useState(2);
  const [battery, setBattery] = useState<Battery>('48');

  const calc = useMemo(() => {
    const kwp = energy / (PSH * DERATE);
    const modules = Math.ceil((kwp * 1000) / MODULE_WP);
    const arrayActual = (modules * MODULE_WP) / 1000;
    const batteryKwh = (energy * autonomy) / DOD;
    const batteryV = Number(battery);
    const batteryAh = (batteryKwh * 1000) / batteryV;
    const inverter = (peak * 1.25) / 1000;
    const chargeCurrent = (arrayActual * 1000) / batteryV;
    const dailyYield = arrayActual * PSH * DERATE;
    return { kwp, modules, arrayActual, batteryKwh, batteryV, batteryAh, inverter, chargeCurrent, dailyYield };
  }, [energy, peak, autonomy, battery]);

  const coverage = Math.min(100, (calc.dailyYield / energy) * 100);

  return (
    <div className="lab-tab-grid">
      <div className="lab-tab-main">
        <LabCard title="Konfigurasi sistem PLTS hybrid" hint="Iradiasi 4.5 kWh/m²/hari · derating 80%">
          <div className="lab-stack">
            <Slider
              label="Kebutuhan energi harian"
              value={energy}
              min={1}
              max={50}
              step={0.5}
              display={fmt(energy, 1)}
              unit="kWh/hari"
              onChange={setEnergy}
            />
            <Slider
              label="Beban puncak sesaat"
              value={peak}
              min={500}
              max={10000}
              step={100}
              display={fmt(peak, 0)}
              unit="W"
              onChange={setPeak}
            />
            <Slider
              label="Hari otonomi baterai"
              value={autonomy}
              min={1}
              max={3}
              step={1}
              display={String(autonomy)}
              unit="hari"
              onChange={setAutonomy}
            />
            <Segmented<Battery>
              label="Tegangan bank baterai"
              value={battery}
              onChange={setBattery}
              options={[
                { value: '24', label: '24 VDC' },
                { value: '48', label: '48 VDC' },
              ]}
            />
          </div>
        </LabCard>

        <LabCard title="Neraca energi harian" hint="Produksi array vs konsumsi beban">
          <div className="lab-energy">
            <div className="lab-energy-row">
              <span>Produksi array</span>
              <b>{fmt(calc.dailyYield, 2)} kWh</b>
            </div>
            <div className="lab-energy-bar">
              <i style={{ width: `${coverage}%` }} />
              <em style={{ left: `${Math.min(100, (energy / Math.max(calc.dailyYield, energy)) * 100)}%` }} />
            </div>
            <div className="lab-energy-row">
              <span>Konsumsi beban</span>
              <b>{fmt(energy, 1)} kWh</b>
            </div>
            <p className="lab-note">
              Cakupan produksi {fmt(coverage, 0)}% dari kebutuhan harian. Sisa energi disimpan ke bank LiFePO4
              melalui inverter hybrid.
            </p>
          </div>
        </LabCard>
      </div>

      <div className="lab-tab-side">
        <LabCard title="Hasil sizing" hint="Rumus baku PLTS off-grid / hybrid">
          <div className="lab-readouts">
            <Readout
              label="Kapasitas array"
              value={fmt(calc.kwp, 2)}
              unit="kWp"
              tone="good"
              hint={`kWh/hari ÷ (4.5 × 0.8)`}
            />
            <Readout
              label="Jumlah modul 550 Wp"
              value={String(calc.modules)}
              unit="unit"
              hint={`Total terpasang ${fmt(calc.arrayActual, 2)} kWp`}
            />
            <Readout
              label="Bank baterai LiFePO4"
              value={fmt(calc.batteryKwh, 2)}
              unit="kWh"
              hint={`DoD 80% · otonomi ${autonomy} hari`}
            />
            <Readout
              label="Kapasitas baterai (Ah)"
              value={fmt(calc.batteryAh, 0)}
              unit="Ah"
              hint={`@ ${calc.batteryV} VDC`}
            />
            <Readout
              label="Inverter hybrid minimum"
              value={fmt(calc.inverter, 2)}
              unit="kVA"
              hint={`1,25 × beban puncak ${fmt(peak / 1000, 2)} kW`}
            />
            <Readout
              label="Arus charge puncak"
              value={fmt(calc.chargeCurrent, 1)}
              unit="A"
              hint="Array kWp ÷ tegangan bank baterai"
            />
          </div>
        </LabCard>

        <LabCard title="Catatan desain">
          <ul className="lab-list">
            <li>Baterai LiFePO4 dibatasi Depth of Discharge 80% agar siklus hidup tetap &gt; 4.000 kali.</li>
            <li>Inverter hybrid dipilih ≥ 1,25 × beban puncak untuk menoleransi lonjakan start motor.</li>
            <li>Derating 80% memperhitungkan rugi kabel, suhu panel, dan efisiensi MPPT.</li>
            <li>Untuk area dengan PSH &lt; 4 jam, tambahkan 15–25% kapasitas array.</li>
          </ul>
        </LabCard>
      </div>
    </div>
  );
}
