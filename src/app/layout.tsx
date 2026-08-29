import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#fbfbfa',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Agricultural Cold-Chain Monitoring System',
  description:
    'Continuous agricultural produce monitoring from farm origin through refrigerated transit to destination delivery.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fbfbfa] text-[#18181b] font-sans">
        {children}
      </body>
    </html>
  );
}
