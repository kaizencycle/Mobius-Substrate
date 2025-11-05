import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Integrity Pulse | Kaizen OS',
  description: 'Real-time 3D visualization of sentinel integrity metrics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
