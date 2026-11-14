import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/app-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import IntroOverlay from '@/components/IntroOverlay';
import ScrollUI from '@/components/ScrollUI';

export const metadata: Metadata = {
  title: 'Electrical Engineering — Powering Progress',
  description:
    'Sistem kelistrikan, otomasi industri, energi terbarukan, dan keselamatan kerja.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProvider>
          <IntroOverlay />
          <ScrollUI />
          <Header />
          <div className="layout">
            <main className="main-content">{children}</main>
          </div>
          <Footer />

          <audio id="bgMusic" loop preload="auto">
            <source
              src="tantejj/DJ%20SUDAH%20TERBIASA%20TERJADI%20TANTE%20TEMAN%20DATANG%20KETIKA%20BUTUH%20SAJA%20VIRAL%20TIKTOK%20TERBARU%202025.mp3"
              type="audio/mpeg"
            />
          </audio>
        </AppProvider>
      </body>
    </html>
  );
}