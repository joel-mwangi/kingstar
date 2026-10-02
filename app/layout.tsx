import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Algorun AI - Algorithmic Trading Bot System',
  description: 'Advanced automated algorithmic trading platform featuring ML market prediction engine, risk management controls, backtesting studio, and real-time paper trading simulation.',
  openGraph: {
    title: 'Algorun AI - Algorithmic Trading Bot System',
    description: 'Advanced automated algorithmic trading platform featuring ML market prediction engine, risk management controls, backtesting studio, and real-time paper trading simulation.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Algorun AI - Algorithmic Trading Bot System',
    description: 'Advanced automated algorithmic trading platform featuring ML market prediction engine, risk management controls, backtesting studio, and real-time paper trading simulation.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
