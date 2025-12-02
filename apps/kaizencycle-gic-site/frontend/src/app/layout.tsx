import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'kaizencycle.gic — Civic OS',
  description: 'Civic OS — the operating system for democratic integrity. NYC Cycle 0 Pilot.',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
