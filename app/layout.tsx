import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { RootProvider } from '@/components/layout/RootProvider';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'KASH - Professional Marketplace',
  description: 'Join the elite marketplace. Professional products, premium shops, and secure enterprise-grade transactions.',
  keywords: ['marketplace', 'professional', 'enterprise', 'shopping', 'KASH', 'Cameroon', 'business'],
  authors: [{ name: 'KASH Enterprise' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  manifest: '/manifest.json',
  themeColor: '#00d084',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KASH',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'KASH - Professional Marketplace',
    description: 'Join the community of elite sellers and premium buyers on KASH.',
    url: 'https://kash.pro',
    siteName: 'KASH Marketplace',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'KASH Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KASH - Professional Marketplace',
    description: 'The elite professional marketplace.',
    images: ['/logo.png'],
  },
};

import { PWAInstallPrompt } from '@/components/common/PWAInstallPrompt';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased bg-background text-text`}>
        <RootProvider>
          {children}
          <PWAInstallPrompt />
        </RootProvider>
      </body>
    </html>
  );
}
