import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { RootProvider } from '@/components/layout/RootProvider';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'KASH - Marketplace',
  description: 'The professional marketplace for everyone.',
};

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
        </RootProvider>
      </body>
    </html>
  );
}
