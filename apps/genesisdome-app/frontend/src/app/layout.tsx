import type { Metadata } from 'next'
import '../globals.css'
export const metadata: Metadata = {
  title: 'Genesis Dome',
  description: 'The Dome is not a company. It is a world — of echoes, crowns, and festivals.',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
