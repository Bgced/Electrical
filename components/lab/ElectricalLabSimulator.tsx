'use client';

import { useState } from 'react';
import OhmsLawTab from './OhmsLawTab';
import PowerTab from './PowerTab';
import SizingTab from './SizingTab';
import ProtectionTab from './ProtectionTab';
import SolarTab from './SolarTab';
import ResistorTab from './ResistorTab';

type TabId = 'dc' | 'ac' | 'sizing' | 'protection' | 'solar' | 'resistor';

const TABS: { id: TabId; index: string; label: string; short: string }[] = [
  { id: 'dc', index: '01', label: 'Rangkaian DC & Hukum Ohm', short: 'DC · Ohm' },
  { id: 'ac', index: '02', label: 'Daya AC & Faktor Daya', short: 'AC · cos φ' },
  { id: 'sizing', index: '03', label: 'Sizing MCB, Kabel & ΔV', short: 'MCB · Kabel' },
  { id: 'protection', index: '04', label: 'Sandbox Proteksi Panel', short: 'Proteksi' },
  { id: 'solar', index: '05', label: 'PLTS Hybrid & Baterai', short: 'PLTS' },
  { id: 'resistor', index: '06', label: 'Dekoder Kode Resistor', short: 'Resistor' },
];

export default function ElectricalLabSimulator() {
  const [tab, setTab] = useState<TabId>('dc');
  const active = TABS.find((t) => t.id === tab)!;

  return (
    <div className="lab">
      <div className="lab-topbar">
        <div className="lab-topbar-id">
          <span className="lab-live">
            <i aria-hidden="true" /> LIVE
          </span>
          <span className="lab-topbar-label">ELECTRICAL ENGINEERING LAB</span>
        </div>
        <p className="lab-topbar-note">Kalkulasi eksak · visualisasi real-time · standar PUIL 2021 / IEC</p>
      </div>

      <div className="lab-tabs" role="tablist" aria-label="Modul laboratorium elektro">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`lab-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`lab-panel-${t.id}`}
            className={`lab-tab${tab === t.id ? ' is-on' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <em>{t.index}</em>
            <span className="lab-tab-full">{t.label}</span>
            <span className="lab-tab-short">{t.short}</span>
          </button>
        ))}
      </div>

      <div
        className="lab-panel"
        role="tabpanel"
        id={`lab-panel-${tab}`}
        aria-labelledby={`lab-tab-${tab}`}
        key={tab}
      >
        {tab === 'dc' && <OhmsLawTab />}
        {tab === 'ac' && <PowerTab />}
        {tab === 'sizing' && <SizingTab />}
        {tab === 'protection' && <ProtectionTab />}
        {tab === 'solar' && <SolarTab />}
        {tab === 'resistor' && <ResistorTab />}
      </div>

      <div className="lab-footerline">
        <span>{active.index} · {active.label}</span>
        <span>Semua nilai dihitung ulang setiap perubahan input — tanpa angka statis.</span>
      </div>
    </div>
  );
}
