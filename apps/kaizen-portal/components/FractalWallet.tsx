/**
 * Fractal Wallet Component
 * Version: 1.0 (C-155)
 * 
 * Displays a citizen's Mobius Fractal Shards (MFS) portfolio
 * with visual fractal representation and contribution metrics.
 */

import React, { useMemo } from "react";

// =============================================================================
// Type Definitions
// =============================================================================

type ArchetypeKey = "REF" | "LRN" | "CIV" | "STB" | "STW" | "INV" | "GRD";

interface ArchetypeInfo {
  name: string;
  color: string;
  description: string;
}

interface FractalWalletProps {
  citizenId: string;
  totals: {
    count: number;
    weightedSum: number;
    deltaMiiLastEpoch?: number;
  };
  byArchetype: Record<ArchetypeKey, number>;
  qualityStats?: {
    average: number;
    min: number;
    max: number;
  };
  governancePower?: number;
  recentShards?: RecentShard[];
  onViewDetails?: () => void;
}

interface RecentShard {
  mfs_id: string;
  archetype: ArchetypeKey;
  quality_score: number;
  timestamp: string;
  description?: string;
}

// =============================================================================
// Constants
// =============================================================================

const ARCHETYPE_INFO: Record<ArchetypeKey, ArchetypeInfo> = {
  REF: { name: "Reflection", color: "#6366f1", description: "Self-similarity" },
  LRN: { name: "Learning", color: "#8b5cf6", description: "Knowledge recursion" },
  CIV: { name: "Civic", color: "#06b6d4", description: "Social coherence" },
  STB: { name: "Stability", color: "#22c55e", description: "Homeostasis" },
  STW: { name: "Stewardship", color: "#eab308", description: "Entropy reduction" },
  INV: { name: "Innovation", color: "#f97316", description: "Boundary expansion" },
  GRD: { name: "Guardian", color: "#ef4444", description: "Security integrity" }
};

const ARCHETYPE_WEIGHTS: Record<ArchetypeKey, number> = {
  REF: 0.20,
  LRN: 0.15,
  CIV: 0.25,
  STB: 0.15,
  STW: 0.10,
  INV: 0.10,
  GRD: 0.05
};

// =============================================================================
// Sub-Components
// =============================================================================

const StatCard: React.FC<{
  label: string;
  value: string | number;
  subtitle?: string;
}> = ({ label, value, subtitle }) => (
  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
    <div className="text-slate-400 text-sm">{label}</div>
    <div className="text-2xl font-bold text-white mt-1">{value}</div>
    {subtitle && <div className="text-slate-500 text-xs mt-1">{subtitle}</div>}
  </div>
);

const ArchetypeBar: React.FC<{
  archetype: ArchetypeKey;
  count: number;
  maxCount: number;
}> = ({ archetype, count, maxCount }) => {
  const info = ARCHETYPE_INFO[archetype];
  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
  
  return (
    <div className="flex items-center gap-3 py-2">
      <div 
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: info.color }}
      />
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-300">{info.name}</span>
          <span className="text-slate-400">{count}</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: info.color 
            }}
          />
        </div>
      </div>
    </div>
  );
};

const FractalVisualization: React.FC<{
  byArchetype: Record<ArchetypeKey, number>;
  totalCount: number;
}> = ({ byArchetype, totalCount }) => {
  // Simple SVG fractal representation
  // In production, this would be a more sophisticated canvas/WebGL renderer
  
  const segments = useMemo(() => {
    const archetypes = Object.entries(byArchetype) as [ArchetypeKey, number][];
    let cumulativeAngle = 0;
    
    return archetypes.map(([key, count]) => {
      const percentage = totalCount > 0 ? count / totalCount : 0;
      const angle = percentage * 360;
      const startAngle = cumulativeAngle;
      cumulativeAngle += angle;
      
      return {
        key,
        color: ARCHETYPE_INFO[key].color,
        startAngle,
        angle,
        count
      };
    });
  }, [byArchetype, totalCount]);

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background circle */}
        <circle 
          cx="50" cy="50" r="45" 
          fill="none" 
          stroke="#334155" 
          strokeWidth="2"
        />
        
        {/* Archetype segments */}
        {segments.map((seg, i) => {
          if (seg.count === 0) return null;
          
          const startRad = (seg.startAngle - 90) * Math.PI / 180;
          const endRad = (seg.startAngle + seg.angle - 90) * Math.PI / 180;
          
          const x1 = 50 + 40 * Math.cos(startRad);
          const y1 = 50 + 40 * Math.sin(startRad);
          const x2 = 50 + 40 * Math.cos(endRad);
          const y2 = 50 + 40 * Math.sin(endRad);
          
          const largeArc = seg.angle > 180 ? 1 : 0;
          
          return (
            <path
              key={seg.key}
              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={seg.color}
              opacity={0.8}
              className="transition-opacity hover:opacity-100"
            />
          );
        })}
        
        {/* Center circle */}
        <circle cx="50" cy="50" r="15" fill="#0f172a" />
        
        {/* Center text */}
        <text 
          x="50" y="52" 
          textAnchor="middle" 
          className="fill-white text-xs font-bold"
        >
          {totalCount}
        </text>
      </svg>
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          {/* Fractal icon would go here */}
        </div>
      </div>
    </div>
  );
};

const RecentShardItem: React.FC<{ shard: RecentShard }> = ({ shard }) => {
  const info = ARCHETYPE_INFO[shard.archetype];
  const timeAgo = getTimeAgo(shard.timestamp);
  
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-700 last:border-0">
      <div 
        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
        style={{ backgroundColor: `${info.color}20`, color: info.color }}
      >
        {shard.archetype}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-slate-300 truncate">
          {shard.description || info.name}
        </div>
        <div className="text-xs text-slate-500">{timeAgo}</div>
      </div>
      <div className="text-sm text-slate-400">
        ×{shard.quality_score.toFixed(1)}
      </div>
    </div>
  );
};

// =============================================================================
// Main Component
// =============================================================================

export const FractalWallet: React.FC<FractalWalletProps> = ({
  citizenId,
  totals,
  byArchetype,
  qualityStats,
  governancePower,
  recentShards,
  onViewDetails
}) => {
  const maxArchetypeCount = Math.max(...Object.values(byArchetype));
  const dominantArchetype = useMemo(() => {
    let max = 0;
    let dominant: ArchetypeKey = "REF";
    for (const [key, count] of Object.entries(byArchetype) as [ArchetypeKey, number][]) {
      if (count > max) {
        max = count;
        dominant = key;
      }
    }
    return dominant;
  }, [byArchetype]);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600/20 to-cyan-600/20 px-6 py-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Fractal Wallet</h2>
            <p className="text-slate-400 text-sm mt-1">
              Citizen: {citizenId.slice(0, 12)}...
            </p>
          </div>
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ 
              backgroundColor: `${ARCHETYPE_INFO[dominantArchetype].color}30`,
              borderColor: ARCHETYPE_INFO[dominantArchetype].color,
              borderWidth: 2
            }}
          >
            <span className="text-xs font-bold" style={{ color: ARCHETYPE_INFO[dominantArchetype].color }}>
              {dominantArchetype}
            </span>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard 
            label="Total Shards" 
            value={totals.count.toLocaleString()}
            subtitle="Lifetime earned"
          />
          <StatCard 
            label="Weighted Sum" 
            value={totals.weightedSum.toFixed(2)}
            subtitle="Integrity contribution"
          />
          {totals.deltaMiiLastEpoch !== undefined && (
            <StatCard 
              label="ΔMII (Last Epoch)" 
              value={totals.deltaMiiLastEpoch.toFixed(6)}
              subtitle="Your impact"
            />
          )}
        </div>

        {/* Fractal Visualization */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-400 mb-4">Your Fractal</h3>
          <FractalVisualization 
            byArchetype={byArchetype} 
            totalCount={totals.count}
          />
        </div>

        {/* Archetype Breakdown */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3">By Archetype</h3>
          <div className="space-y-1">
            {(Object.entries(byArchetype) as [ArchetypeKey, number][])
              .sort((a, b) => b[1] - a[1])
              .map(([key, count]) => (
                <ArchetypeBar 
                  key={key}
                  archetype={key}
                  count={count}
                  maxCount={maxArchetypeCount}
                />
              ))}
          </div>
        </div>

        {/* Quality & Governance */}
        {(qualityStats || governancePower !== undefined) && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {qualityStats && (
              <div className="bg-slate-800/30 rounded-lg p-4">
                <div className="text-slate-400 text-sm">Quality Average</div>
                <div className="text-lg font-bold text-white">
                  ×{qualityStats.average.toFixed(2)}
                </div>
                <div className="text-slate-500 text-xs">
                  Range: {qualityStats.min.toFixed(1)} – {qualityStats.max.toFixed(1)}
                </div>
              </div>
            )}
            {governancePower !== undefined && (
              <div className="bg-slate-800/30 rounded-lg p-4">
                <div className="text-slate-400 text-sm">Governance Power</div>
                <div className="text-lg font-bold text-cyan-400">
                  {(governancePower * 100).toFixed(2)}%
                </div>
                <div className="text-slate-500 text-xs">
                  √-weighted influence
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Shards */}
        {recentShards && recentShards.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Recent Shards</h3>
            <div className="bg-slate-800/30 rounded-lg p-3">
              {recentShards.slice(0, 5).map((shard) => (
                <RecentShardItem key={shard.mfs_id} shard={shard} />
              ))}
            </div>
          </div>
        )}

        {/* Projection Section */}
        <div className="bg-gradient-to-r from-indigo-900/30 to-cyan-900/30 rounded-lg p-4 border border-indigo-800/30">
          <h3 className="text-sm font-medium text-slate-300 mb-2">
            Projected Rewards
          </h3>
          <p className="text-slate-400 text-sm">
            As your city's MII improves, your Fractal Shards will shape your share
            of future integrity rewards (MIA) and, eventually, MIC.
          </p>
        </div>

        {/* View Details Button */}
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
          >
            View Full History
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-800">
        <p className="text-slate-500 text-xs text-center">
          "Every action you take is a shard of the whole."
        </p>
      </div>
    </div>
  );
};

// =============================================================================
// Helper Functions
// =============================================================================

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diff = now.getTime() - then.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// =============================================================================
// Export
// =============================================================================

export default FractalWallet;
