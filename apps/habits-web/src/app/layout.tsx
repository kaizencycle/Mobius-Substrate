import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mobius Habits - Daily Reflections & Citizen Shield',
  description: 'Small rituals. Strong integrity. Daily reflections and weekly cybersecurity for a calmer mind and safer world.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
