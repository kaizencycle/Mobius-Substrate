import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Mobius Systems — Integrity Before Intelligence",
  description: "Mobius Systems is a civic AI substrate that embeds integrity, reflection, and consensus into intelligent systems before they scale.",
  openGraph: {
    title: "Mobius Systems — Integrity Before Intelligence",
    description: "A civic AI substrate that embeds integrity, reflection, and consensus into intelligent systems — so they remain answerable to their purpose even as they scale.",
    images: ["/og.jpg"],
    type: "website",
  },
  twitter: { 
    card: "summary_large_image",
    title: "Mobius Systems — Integrity Before Intelligence",
    description: "Intelligence with a spine. A civic AI substrate for researchers, civic builders, and stewards.",
  },
  keywords: ["AI governance", "civic AI", "AI safety", "integrity", "consensus", "Kaizen Turing Test", "DVA"],
  authors: [{ name: "Michael Judan" }],
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
