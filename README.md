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
  layout.tsx      — shell: header, footer, intro overlay, scroll UI
  page.tsx        — komposisi semua section
  globals.css     — seluruh style (design system, komponen, responsive)

components/
  Header.tsx      — nav, toggle tema/bahasa, jam, indikator online
  Hero.tsx        — slideshow 6 foto tiap 3 detik + slide dots
  Stats.tsx       — counter animasi, quick-link bar, insights
  Sections.tsx    — video band, tentang, layanan, industri, K3
  Sections2.tsx   — proyek, proses, galeri, data teknis, komponen
  Interactive.tsx — inti energi 3D, simulator Hukum Ohm, kode warna resistor
  Sections3.tsx   — konversi daya + timeline, FAQ, CTA
  Footer.tsx      — footer multi-kolom
  IntroOverlay.tsx— gerbang sambutan saat kunjungan pertama
  ScrollUI.tsx    — progress bar scroll + tombol kembali ke atas

lib/
  i18n.ts         — kamus EN/ID (satu sumber untuk semua teks)
  app-context.tsx — provider bahasa + tema

public/
  foto/           — foto galeri, hero, komponen
  video/          — video latar
  tantejj/        — musik latar
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
- Musik tidak autoplay lewat elemen audio: `IntroOverlay` memicu pemutaran setelah
  pengunjung menekan tombol lanjut, sesuai aturan autoplay browser.