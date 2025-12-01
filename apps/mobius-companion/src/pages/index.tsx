// Mobius Companion - Main Page
// Cycle: C-151

import { useState, useEffect } from 'react';
import { WalletCard } from '../components/WalletCard';
import { ReflectionInput } from '../components/ReflectionInput';
import { LedgerView } from '../components/LedgerView';
import { SyncStatus } from '../components/SyncStatus';
import { MIIGauge } from '../components/MIIGauge';

interface WalletState {
  mic: number;
  ks: number;
  pending: number;
}

interface MIIState {
  score: number;
  aboveThreshold: boolean;
}

export default function CompanionHome() {
  const [wallet, setWallet] = useState<WalletState>({ mic: 0, ks: 0, pending: 0 });
  const [mii, setMii] = useState<MIIState>({ score: 0.90, aboveThreshold: false });
  const [isConnected, setIsConnected] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Initialize local ledger connection
    const initLedger = async () => {
      try {
        // In production: Initialize LocalLedger and WalletManager
        setIsConnected(true);
        setWallet({ mic: 0.42, ks: 420000, pending: 0.05 });
        setMii({ score: 0.97, aboveThreshold: true });
      } catch (error) {
        console.error('Failed to initialize ledger:', error);
      }
    };
    initLedger();
  }, []);

  const handleReflection = async (content: string) => {
    // In production: Call ledger.recordReflection
    console.log('Recording reflection:', content.substring(0, 50));
    
    // Simulate MIC minting
    const mintedMic = 0.02;
    setWallet(prev => ({
      ...prev,
      mic: prev.mic + mintedMic,
      ks: prev.ks + Math.round(mintedMic * 1_000_000)
    }));
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <span className="text-lg">🌀</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold">Mobius Companion</h1>
              <p className="text-xs text-slate-500">Local Node v0.1.0</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <SyncStatus isConnected={isConnected} />
            <button
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Wallet & MII */}
          <div className="space-y-6">
            <WalletCard
              mic={wallet.mic}
              ks={wallet.ks}
              pending={wallet.pending}
            />
            <MIIGauge
              score={mii.score}
              threshold={0.95}
              aboveThreshold={mii.aboveThreshold}
            />
          </div>

          {/* Center Column - Reflection */}
          <div className="lg:col-span-2 space-y-6">
            <ReflectionInput onSubmit={handleReflection} />
            <LedgerView />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-4 mt-auto">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-slate-500">
          <p>Cycle C-151 | 1 MIC = 1,000,000 KS</p>
          <p>"We heal as we walk."</p>
        </div>
      </footer>
    </div>
  );
}
