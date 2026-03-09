import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/lib/i18n';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Bali Trip 2024',
  description: 'Our personalized 15-day itinerary in Bali',
};

export const viewport = {
  themeColor: '#81B29A',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${outfit.variable} ${inter.variable} font-sans antialiased text-foreground bg-background min-h-screen`}>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
