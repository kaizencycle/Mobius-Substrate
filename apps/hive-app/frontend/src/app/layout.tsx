import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title: 'HIVE — 8-bit Starter', description: 'HIVE game for Genesis Dome' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
