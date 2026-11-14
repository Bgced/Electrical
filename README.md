# Electrical Engineering — Next.js

Website portofolio teknik elektro. Dibangun dengan Next.js 15 (App Router) + React 19.

## Jalankan

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build produksi
npm start        # jalankan hasil build
```

## Struktur

```
app/
  layout.tsx      — shell: provider audio, header, footer, intro overlay, scroll UI
  page.tsx        — komposisi semua section
  globals.css     — design system lama (tetap dipakai sebagai dasar)
  refined.css     — lapisan desain v2: header, hero, musik, kartu, responsif

components/
  Header.tsx      — nav ringkas + dropdown, scrollspy, toggle tema/bahasa, info drawer
  Hero.tsx        — slideshow 6 foto, panel standar, CTA ganda
  MusicPlayer.tsx — tombol musik di header + mini player
  Stats.tsx       — counter animasi, quick-link bar, insights
  Sections.tsx    — video band, tentang, layanan, industri, K3
  Sections2.tsx   — proyek, proses, galeri, data teknis, komponen
  Interactive.tsx — inti energi 3D, simulator Hukum Ohm, kode warna resistor
  Sections3.tsx   — konversi daya + timeline, FAQ, CTA
  Footer.tsx      — footer multi-kolom
  IntroOverlay.tsx— gerbang sambutan saat kunjungan pertama
  ScrollUI.tsx    — progress bar scroll + tombol kembali ke atas
  ScrollReveal.tsx— animasi masuk per section (menghormati prefers-reduced-motion)

lib/
  i18n.ts         — kamus EN/ID (satu sumber untuk semua teks)
  app-context.tsx — provider bahasa + tema
  audio.tsx       — state musik latar (play/pause, volume, preferensi tersimpan)
  assets.ts       — helper path aset agar aman di Vercel maupun GitHub Pages

public/
  foto/           — foto galeri, hero, komponen
  video/          — video latar
  audio/theme.mp3 — musik latar
```

## Menambah section baru

1. Buat komponen di `components/`, pakai `useApp()` untuk `t(key)` dan `lang`
2. Daftarkan di `app/page.tsx`
3. Tambahkan kunci terjemahan di **kedua** blok `en` dan `id` pada `lib/i18n.ts`
4. Style pakai class yang sudah ada di `app/globals.css` — tambahkan bila perlu

## Catatan

- Semua teks bilingual. `lib/i18n.ts` adalah satu-satunya sumber terjemahan;
  kunci yang hilang akan jatuh kembali ke bahasa Indonesia lalu ke nama kunci.
- Tema dan bahasa disimpan di `localStorage`, bukan server.
- **Musik latar**: browsers melarang autoplay tanpa interaksi. `AudioProvider`
  mencoba memutar saat halaman dibuka; bila ditolak, pemutaran dimulai pada
  klik/sentuhan pertama dan ikon di header menandai status itu. Preferensi
  (`musicEnabled`) disimpan, jadi pilihan "tanpa suara" tidak dibatalkan sendiri.
  Semua kontrol ada di header + mini player kiri bawah.
- Aset publik selalu lewat `asset()` (`lib/assets.ts`) — jangan menulis
  `/foto/...` langsung, karena build GitHub Pages memakai base path `/Electrical`.