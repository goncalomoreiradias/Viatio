import type { Metadata, Viewport } from 'next';
import { Outfit, Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';

const outcrop = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Viatio',
  description: 'The extreme travel companion for orchestrating itineraries.',
};

export const viewport: Viewport = {
  themeColor: '#81B29A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${outcrop.variable} ${inter.variable} ${playfair.variable} font-sans antialiased text-foreground bg-background min-h-screen`}>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
