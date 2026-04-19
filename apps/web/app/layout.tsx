import { Geist, Geist_Mono } from 'next/font/google';
import { ReactNode } from 'react';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import { ThemeProvider } from '@/components/theme-provider';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'Render Lite',
  description: 'Deploy anything, instantly.',
};
type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
