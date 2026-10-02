import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kingstar Admin Console',
  description: 'Administrator-only platform controls for Kingstar.',
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
