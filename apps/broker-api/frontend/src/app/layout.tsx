import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Thought Broker Dashboard',
  description: 'Multi-LLM consensus engine for Mobius Systems',
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
