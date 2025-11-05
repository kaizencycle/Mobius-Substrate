import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues with Three.js
const MultiAgentGrid = dynamic(
  () => import('@/components/MultiAgentGrid'),
  { ssr: false }
);

export const metadata: Metadata = {
  title: 'Integrity Pulse | Kaizen OS',
  description: 'Real-time visualization of sentinel integrity metrics - Cycle C-125',
};

export default function IntegrityPulsePage() {
  const mockData = process.env.NEXT_PUBLIC_MOCK_DATA !== 'false';
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4001/ws/gi-stream';

  return (
    <main className="w-full h-screen overflow-hidden">
      <MultiAgentGrid
        mockData={mockData}
        wsUrl={wsUrl}
      />
    </main>
  );
}
