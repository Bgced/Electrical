import type { Metadata, Viewport } from 'next';
import './globals.css';
import './refined.css';
import { AppProvider } from '@/lib/app-context';
import { AudioProvider } from '@/lib/audio';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import IntroOverlay from '@/components/IntroOverlay';
import ScrollUI from '@/components/ScrollUI';
import ScrollReveal from '@/components/ScrollReveal';
import { NowPlaying } from '@/components/MusicPlayer';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ee-engineering.id'),
  title: 'Electrical Engineering — Powering Progress',
  description:
    'Sistem kelistrikan, otomasi industri, energi terbarukan, dan keselamatan kerja.',
  applicationName: 'Electrical Engineering',
  keywords: [
    'teknik elektro',
    'instalasi listrik',
    'panel distribusi',
    'otomasi industri',
    'energi terbarukan',
    'PUIL 2021',
  ],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Electrical Engineering — Powering Progress',
    description:
      'Perancangan sistem kelistrikan, otomasi industri, dan infrastruktur energi terbarukan.',
    type: 'website',
    images: ['/foto/panel-distribusi.jpg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#08090b',
  colorScheme: 'dark light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProvider>
          <AudioProvider>
            <IntroOverlay />
            <ScrollUI />
            <ScrollReveal />
            <Header />
            <div className="layout">
              <main className="main-content" id="konten">
                {children}
              </main>
            </div>
            <Footer />
            <NowPlaying />
          </AudioProvider>
        </AppProvider>
      </body>
    </html>
  );
}