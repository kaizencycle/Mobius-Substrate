import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import PulseToggle from '@/components/PulseToggle';

// Dynamically import to avoid SSR issues with Three.js
const SacredViz = dynamic(
  () => import('@/components/SacredViz'),
  { ssr: false }
);

export const metadata: Metadata = {
  title: 'Sacred Viz | Integrity Pulse | Kaizen OS',
  description: 'Audio-reactive sacred geometry visualization of sentinel integrity metrics',
};

export default function SacredVizPage() {
  const mockData = process.env.NEXT_PUBLIC_MOCK_DATA !== 'false';

  return (
    <main className="w-full h-screen overflow-hidden">
      <PulseToggle />
      <SacredViz mockData={mockData} />
    </main>
  );
}
