import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tarombo Digital — Interactive Batak Family Tree Generator',
  description:
    'Generate an interactive, visual Batak Tarombo (family tree) from your Excel file. Client-side, no backend required. Supports 1000+ family members across 30+ generations.',
  keywords: ['tarombo', 'batak', 'family tree', 'silsilah', 'marga', 'genealogy'],
  authors: [{ name: 'Tarombo Digital' }],
  openGraph: {
    title: 'Tarombo Digital',
    description: 'Interactive Batak Family Tree Generator',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
