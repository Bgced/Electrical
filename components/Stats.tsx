'use client';

import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/lib/app-context';
import { asset } from '@/lib/assets';
import type { I18nKey } from '@/lib/i18n';
import ArticleModal, { type Article } from '@/components/ArticleModal';

const LINKS: { href: string; key: I18nKey; icon: string }[] = [
  { href: '#layanan', key: 'ql.services', icon: 'bolt' },
  { href: '#proyek', key: 'ql.projects', icon: 'grid' },
  { href: '#komponen', key: 'ql.components', icon: 'chip' },
  { href: '#visual3d', key: 'ql.three', icon: 'cube' },
  { href: '#simulator', key: 'ql.simulator', icon: 'clock' },
  { href: '#konverter', key: 'ql.tools', icon: 'calc' },
  { href: 'https://wa.me/6281218554350', key: 'ql.contact', icon: 'chat' },
];

function Icon({ name }: { name: string }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
  } as const;

  switch (name) {
    case 'bolt':
      return (
        <svg {...common}>
          <path d="M13 2L3 14H11L11 22L21 10H13V2Z" />
        </svg>
      );
    case 'grid':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9h18M8 4v5" />
        </svg>
      );
    case 'chip':
      return (
        <svg {...common}>
          <rect x="6" y="6" width="12" height="12" rx="2" />
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
        </svg>
      );
    case 'cube':
      return (
        <svg {...common}>
          <path d="M12 2l9 5v10l-9 5-9-5V7z" />
          <path d="M12 22V12M3 7l9 5 9-5" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 'calc':
      return (
        <svg {...common}>
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M8 6h8M8 11h2M12 11h2M16 11h.01M8 15h2M12 15h2M16 15h.01M8 19h6" />
        </svg>
      );
    case 'chat':
      return (
        <svg {...common}>
          <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 12.5 3a8.4 8.4 0 0 1 8.5 8.5z" />
        </svg>
      );
    default:
      return null;
  }
}

/* ---------------- Stats ---------------- */

const STATS = [
  { target: 24, suffix: '+', label: 'stats.projects' as I18nKey },
  { target: 12, suffix: ' MW', label: 'stats.capacity' as I18nKey },
  { target: 100, suffix: '%', label: 'stats.safety' as I18nKey },
  { target: 24, suffix: '/7', label: 'stats.support' as I18nKey },
];

export function Stats() {
  const { t } = useApp();
  // final values first paint — never "0+" while the observer warms up
  const [nums, setNums] = useState(STATS.map((s) => s.target));
  const wrapRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') return;

    let raf = 0;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        obs.disconnect();

        const t0 = performance.now();
        const dur = 1400;
        setNums(STATS.map(() => 0));

        const step = (now: number) => {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setNums(STATS.map((s) => Math.round(eased * s.target)));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.25 }
    );

    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="stats">
      <div className="container">
        <div className="stats-inner" ref={wrapRef}>
          {STATS.map((s, i) => (
            <div className="stat" key={s.label}>
              <span className="stat-num">
                {nums[i]}
                {s.suffix}
              </span>
              <span className="stat-label">{t(s.label)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Quick links ---------------- */

export function QuickLinks() {
  const { t } = useApp();

  return (
    <section className="quicklinks">
      <div className="container">
        <div className="ql-grid">
          {LINKS.map((l) => (
            <a
              key={l.key}
              href={l.href}
              className="ql-item"
              {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <span className="ql-icon">
                <Icon name={l.icon} />
              </span>
              <span className="ql-label">{t(l.key)}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Insights + article modal ---------------- */

const ARTICLES: (Omit<Article, 'title'> & { titleKey: I18nKey; letter: string })[] = [
  {
    id: 'koordinasi',
    titleKey: 'ins.t1',
    letter: 'A',
    date: '15 Nov 2026',
    tag: 'PROTEKSI',
    read: '6 menit baca',
    intro:
      'Koordinasi proteksi menentukan urutan kerja MCCB, RCCB, dan TOR saat terjadi gangguan. Tanpa selektivitas, satu gangguan kecil bisa memadamkan seluruh panel.',
    body: [
      'Prinsip dasarnya sederhana: perangkat paling dekat dengan gangguan harus trip lebih dulu, sehingga area terdampak tetap sempit. Caranya dengan mengatur kurva waktu-arus (time-current curve) tiap perangkat agar tidak saling tumpang tindih.',
      'Pada panel 380 V dengan MCCB utama 32 A, TOR motor 14 A kelas 10, dan RCCB 30 mA, urutan trip yang benar adalah TOR untuk beban lebih, RCCB untuk arus bocor ke tanah, dan MCCB untuk hubung singkat besar. Rasio rating minimal 1,6× antar tingkat agar toleransi manufaktur tidak menyebabkan trip bersamaan.',
      'Pengujian komisioning wajib menyuntik arus sekunder (primary injection test) minimal pada 3 titik: 1,05× In (tidak boleh trip dalam 2 jam), 1,3× In (trip < 1 jam untuk kelas 10), dan 6× In (trip magnetik instan).',
    ],
    points: [
      'Rasio rating antar tingkat proteksi ≥ 1,6× untuk selektivitas arus.',
      'TOR kelas 10: trip dalam 2–10 detik pada 6× In.',
      'RCCB 30 mA wajib trip < 300 ms sesuai IEC 61008-1.',
      'Selalu catat hasil primary injection pada berita acara komisioning.',
    ],
    standard: 'PUIL 2021 §5.5–5.6 · IEC 60364-4-43 · IEC 60947-2',
  },
  {
    id: 'voltage-drop',
    titleKey: 'ins.t2',
    letter: 'B',
    date: '13 Nov 2026',
    tag: 'DESAIN KABEL',
    read: '5 menit baca',
    intro:
      'Jatuh tegangan sering diabaikan karena kabel sudah "cukup besar" menurut KHA. Padahal ΔV di atas 3% membuat motor panas dan lampu berkedip.',
    body: [
      'Rumus praktis untuk sistem 1 fasa: ΔV = 2 · L · I · ρ / A. Faktor 2 muncul karena arus mengalir bolak-balik melalui fasa dan netral. Untuk 3 fasa seimbang, faktor menjadi √3 karena tidak ada arus kembali pada netral.',
      'Dengan ρ tembaga 0,0175 Ω·mm²/m, tarikan 35 m pada arus 20 A membutuhkan penampang minimal 2,5 mm² hanya untuk memenuhi KHA, tetapi ΔV-nya mencapai 9,8 V (4,4%) — melebihi batas 3%. Solusinya menaikkan penampang ke 4 mm² (ΔV 6,1 V / 2,8%) atau memperpendek tarikan.',
      'Batas 3% berlaku untuk rangkaian akhir; untuk kombinasi feeder + rangkaian akhir, total ΔV yang direkomendasikan tetap ≤ 5% dari tegangan nominal.',
    ],
    points: [
      'ΔV 1 fasa = 2 · L · I · ρ / A; 3 fasa = √3 · L · I · ρ / A.',
      'Batas rangkaian akhir 3%, total instalasi 5%.',
      'Naik satu tingkat penampang memotong ΔV ±40%.',
      'Motor induksi: ΔV 5% menurunkan torsi hingga 10%.',
    ],
    standard: 'PUIL 2021 §4.2 · IEC 60364-5-52',
  },
  {
    id: 'cosphi',
    titleKey: 'ins.t3',
    letter: 'C',
    date: '11 Nov 2026',
    tag: 'KUALITAS DAYA',
    read: '4 menit baca',
    intro:
      'Faktor daya rendah membuat PLN membebankan denda kVARH, sementara kapasitas trafo terbuang untuk daya yang tidak dipakai.',
    body: [
      'Beban induktif (motor, ballast, kompresor) menyerap daya reaktif Q. Semakin besar Q, semakin besar sudut φ dan semakin kecil cos φ. Kapasitor bank menyuntik daya reaktif berlawanan sehingga Q bersih mengecil.',
      'Kebutuhan kapasitor dihitung Qc = P · (tan φ_awal − tan φ_target). Untuk beban 100 kW pada cos φ 0,75 menuju 0,95: tan φ awal 0,882 dan tan φ target 0,329, sehingga Qc = 100 × 0,553 = 55,3 kVAR.',
      'Pemasangan kapasitor harus memperhatikan harmonisa. Pada sistem dengan THD tegangan > 5%, gunakan kapasitor detuned reactor 7% agar tidak terjadi resonansi dengan impedansi jaringan.',
    ],
    points: [
      'Target cos φ ≥ 0,95 untuk menghindari denda kVARH.',
      'Qc = P · (tan φ₁ − tan φ₂), satuannya kVAR.',
      'THD > 5% → wajib detuned reactor 7%.',
      'Ukur ulang cos φ pada beban minimum dan maksimum.',
    ],
    standard: 'IEC 60831-1 · IEEE 519 · PUIL 2021 §6.3',
  },
  {
    id: 'plts',
    titleKey: 'ins.t4',
    letter: 'D',
    date: '9 Nov 2026',
    tag: 'ENERGI TERBARUKAN',
    read: '7 menit baca',
    intro:
      'Sizing PLTS hybrid bukan sekadar membagi kWh harian dengan wattpeak modul. Derating, depth of discharge, dan hari otonomi menentukan keandalan sistem.',
    body: [
      'Kapasitas array dihitung dari energi harian dibagi iradiasi (PSH) dan derating sistem. Untuk 12 kWh/hari di lokasi dengan PSH 4,5 dan derating 80%: kWp = 12 / (4,5 × 0,8) = 3,33 kWp, atau 7 modul 550 Wp.',
      'Bank baterai LiFePO4 dibatasi DoD 80% agar usia siklus tetap panjang. Kebutuhan 12 kWh/hari dengan otonomi 2 hari = 12 × 2 / 0,8 = 30 kWh. Pada bank 48 V, kapasitas Ah = 30.000 / 48 = 625 Ah.',
      'Inverter hybrid dipilih ≥ 1,25 × beban puncak agar mampu menanggung lonjakan start motor. Beban puncak 3 kW membutuhkan inverter minimum 3,75 kVA, dibulatkan ke 5 kVA untuk pasar.',
    ],
    points: [
      'kWp = kWh/hari ÷ (PSH × derating).',
      'Baterai kWh = kWh/hari × otonomi ÷ DoD.',
      'Inverter ≥ 1,25 × beban puncak (kVA).',
      'PVsyst atau Helioscope untuk validasi bayangan.',
    ],
    standard: 'IEC 62548 · SNI 8395:2017 · PUIL 2021 §7',
  },
  {
    id: 'grounding',
    titleKey: 'ins.t5',
    letter: 'E',
    date: '7 Nov 2026',
    tag: 'K3 LISTRIK',
    read: '5 menit baca',
    intro:
      'Pembumian yang buruk membuat arus gangguan memilih jalur tubuh manusia. Resistansi < 5 Ω adalah target minimum, bukan angka dekoratif.',
    body: [
      'Sistem pembumian terdiri dari elektroda (rod/plate), konduktor pembumian, dan bar pembumian utama. Nilai resistansi dipengaruhi jenis tanah, kadar air, dan kedalaman elektroda. Tanah lempung basah bisa 20 Ω·m, sedangkan pasir kering > 500 Ω·m.',
      'Untuk mencapai < 5 Ω pada tanah 100 Ω·m, dibutuhkan beberapa rod paralel dengan jarak minimal 2× panjang rod agar tidak saling mempengaruhi. Metode fall-of-potential (3 titik) adalah standar pengukuran yang diterima auditor.',
      'Bonding semua bagian logam (panel, pipa, struktur) wajib dilakukan. Arus bocor 30 mA yang mengalir melalui impedansi pembumian tinggi akan menaikkan tegangan sentuh dan memicu fatalitas.',
    ],
    points: [
      'Target resistansi pembumian ≤ 5 Ω untuk instalasi industri.',
      'Jarak antar rod ≥ 2× panjang elektroda.',
      'Uji dengan metode fall-of-potential, bukan clamp-on saja.',
      'Bonding semua massa logam ke bar pembumian utama.',
    ],
    standard: 'PUIL 2021 §3.6 · IEC 60364-5-54 · NFPA 70E',
  },
];

export function Insights() {
  const { t } = useApp();
  const [openArticle, setOpenArticle] = useState<Article | null>(null);

  const toArticle = (a: (typeof ARTICLES)[number]): Article => ({
    id: a.id,
    title: t(a.titleKey),
    date: a.date,
    tag: a.tag,
    read: a.read,
    intro: a.intro,
    body: a.body,
    points: a.points,
    standard: a.standard,
  });

  const [feature, ...rest] = ARTICLES;

  return (
    <section id="wawasan" className="block">
      <div className="container">
        <div className="block-head">
          <span className="block-label">{t('ins.label')}</span>
          <span className="block-line" />
        </div>

        <div className="ins-layout">
          <article className="ins-feature">
            <div className="ins-feature-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset('/foto/panel-distribusi.jpg')} alt="Panel distribusi" loading="lazy" />
              <span className="ins-feature-tag">{t('ins.tag1')}</span>
            </div>
            <div className="ins-feature-body">
              <span className="ins-date">{t('ins.date1')}</span>
              <h3>{t(feature.titleKey)}</h3>
              <p>{t('ins.d1')}</p>
              <button
                type="button"
                className="ins-more"
                onClick={() => setOpenArticle(toArticle(feature))}
                aria-label={`Baca selengkapnya: ${t(feature.titleKey)}`}
              >
                {t('ins.read')} <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>

          <div className="ins-list">
            {rest.map((a) => (
              <article key={a.id} className="ins-item">
                <span className="ins-date">{a.date}</span>
                <h4>{t(a.titleKey)}</h4>
                <p>{t(`ins.d${rest.indexOf(a) + 2}` as I18nKey)}</p>
                <button
                  type="button"
                  className="ins-more ins-more-sm"
                  onClick={() => setOpenArticle(toArticle(a))}
                  aria-label={`Baca selengkapnya: ${t(a.titleKey)}`}
                >
                  {t('ins.read')} <span aria-hidden="true">→</span>
                </button>
              </article>
            ))}
          </div>
        </div>
      </div>

      <ArticleModal article={openArticle} onClose={() => setOpenArticle(null)} />
    </section>
  );
}
