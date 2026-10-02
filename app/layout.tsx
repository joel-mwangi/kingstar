import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kingstar Trading Terminal',
  description: 'Deriv-connected options research and trading terminal with deterministic risk controls and advisory AI.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
