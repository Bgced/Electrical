'use client';

import ElectricalLabSimulator from './lab/ElectricalLabSimulator';

export default function LabSection() {
  return (
    <section id="simulator" className="block">
      <div className="container">
        <div className="block-head">
          <span className="block-label">SIMULATOR · LAB INTERAKTIF</span>
          <span className="block-line" />
        </div>

        <div className="lab-head">
          <div>
            <h2 className="lab-head-title">
              Electrical Engineering <span>Lab</span>
            </h2>
            <p className="lab-head-sub">
              Enam modul perhitungan dan simulasi kelistrikan — dari hukum Ohm DC, daya AC tiga fasa, sizing
              proteksi PUIL 2021, hingga bank baterai LiFePO4. Semua hasil dihitung ulang secara real-time.
            </p>
          </div>
          <ul className="lab-head-stats">
            <li>
              <b>6</b>
              <span>Modul uji</span>
            </li>
            <li>
              <b>60 fps</b>
              <span>Visualisasi</span>
            </li>
            <li>
              <b>PUIL</b>
              <span>2021 / IEC</span>
            </li>
          </ul>
        </div>

        <ElectricalLabSimulator />
      </div>
    </section>
  );
}
