import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Freaky Guys - Dashboard de Tráfego Pago',
  description: 'Dashboard premium para análise de campanhas de tráfego pago do Meta Ads e Google Ads',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-dark-blue text-white`}>
        {children}
      </body>
    </html>
  );
}
