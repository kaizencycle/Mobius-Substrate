import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title: 'KaizenCycle Hub — Civic OS', description: 'KaizenCycle Initiative Hub' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
