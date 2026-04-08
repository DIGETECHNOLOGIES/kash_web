import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { RootProvider } from '@/components/layout/RootProvider';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'KASH Marketplace - Buy & Sell in Cameroon',
  description: 'The leading professional marketplace in Cameroon. Shop the best products, follow premium stores, and enjoy secure escrow payments with KASH.',
  keywords: ['marketplace cameroon', 'ecommerce cameroon', 'kash marketplace', 'online shopping cameroon', 'MTN MoMo payments', 'Orange Money Cameroon', 'KASH', 'trusted sellers'],
  authors: [{ name: 'KASH Enterprise' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  manifest: '/manifest.json',
  themeColor: '#00d084',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KASH Marketplace',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'KASH Marketplace - The #1 Trusted Shop in Cameroon',
    description: 'Discover thousands of professional products and verified shops. Pay securely with Mobile Money and get fast delivery.',
    url: 'https://kash.pro',
    siteName: 'KASH Marketplace',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'KASH Marketplace Logo',
      },
    ],
    locale: 'en_CM',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KASH Marketplace - Shop Securely in Cameroon',
    description: 'Verified shops and secure payments at your fingertips.',
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
