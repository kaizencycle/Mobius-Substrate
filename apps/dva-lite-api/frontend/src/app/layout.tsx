import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DVA.LITE Observability Dashboard',
  description: 'GI early-warning service for the Mobius stack',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
