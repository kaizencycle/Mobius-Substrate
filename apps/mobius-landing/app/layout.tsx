import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Mobius Systems — Integrity OS",
  description: "The first OS architected to pass the Kaizen Turing Test (KTT).",
  openGraph: {
    title: "Mobius Systems — Integrity OS",
    description: "MII, MIC, and integrity-gated autonomy.",
    images: ["/og.jpg"]
  },
  twitter: { 
    card: "summary_large_image" 
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#0a0a0a] text-white">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
