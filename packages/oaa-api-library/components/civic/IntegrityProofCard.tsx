// Stub component for Integrity Proof Card
import React from 'react';

interface RegistryData {
  label: string;
  owner?: string;
  resolver?: string;
  integrityProof?: string;
}

interface IntegrityProofCardProps {
  data: RegistryData;
}

export default function IntegrityProofCard({ data }: IntegrityProofCardProps) {
  return (
    <div className="p-4 border rounded" style={{ background: '#0a1a2e', border: '1px solid #1e3a8a', borderRadius: '8px', marginTop: '16px' }}>
      <h3 className="font-bold" style={{ color: '#60a5fa' }}>{data.label}.gic</h3>
      <p style={{ color: '#9ca3af', fontSize: '14px' }}>Owner: {data.owner || 'Unknown'}</p>
      <p style={{ color: '#9ca3af', fontSize: '14px' }}>Resolver: {data.resolver || 'Unknown'}</p>
      {data.integrityProof && (
        <p style={{ color: '#22c55e', fontSize: '12px', marginTop: '8px' }}>
          ✓ Integrity Proof: {data.integrityProof.substring(0, 20)}...
        </p>
      )}
    </div>
  );
}
