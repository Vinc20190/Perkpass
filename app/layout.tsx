import './globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Providers } from '@/components/providers';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://perkpass.africa'),
  manifest: '/manifest.json',
  title: {
    default: "PerkPass — Unlock More. Spend Less. | Africa's Lifestyle Membership",
    template: '%s | PerkPass',
  },
  description: 'The largest African platform for lifestyle, rewards, benefits and experiences. One membership for dining, hotels, travel, fitness and exclusive deals across all 54 African countries.',
  keywords: ['PerkPass', 'Africa', 'lifestyle membership', 'rewards', 'benefits', 'employee benefits', 'corporate perks', 'deals', 'experiences', 'dining', 'hotels', 'travel'],
  authors: [{ name: 'PerkPass' }],
  creator: 'PerkPass',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://perkpass.africa',
    siteName: 'PerkPass',
    title: 'PerkPass — Unlock More. Spend Less.',
    description: "Africa's Lifestyle Membership. One membership. Unlimited benefits across 54 countries.",
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'PerkPass' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PerkPass — Unlock More. Spend Less.',
    description: "Africa's Lifestyle Membership. One membership. Unlimited benefits across 54 countries.",
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://perkpass.africa' },
  appleWebApp: {
    capable: true,
    title: 'PerkPass',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F4F6F9' },
    { media: '(prefers-color-scheme: dark)', color: '#0F1C2E' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{})})}`,
          }}
        />
      </head>
      <body className={`${jakarta.variable} font-body antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
