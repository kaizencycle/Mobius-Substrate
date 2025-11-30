'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_HABITS_API_BASE || 'http://localhost:4005';

type ShieldItemKey =
  | 'update_devices'
  | 'router_hygiene'
  | 'browser_lockdown'
  | '2fa_check'
  | 'backup_essentials';

const SHIELD_ITEMS: { key: ShieldItemKey; label: string; description: string }[] = [
  {
    key: 'update_devices',
    label: 'Update devices',
    description: 'OS, apps, browser updated',
  },
  {
    key: 'router_hygiene',
    label: 'Router hygiene',
    description: 'Password changed, remote management off',
  },
  {
    key: 'browser_lockdown',
    label: 'Browser lockdown',
    description: 'Extensions reviewed, cookies cleaned',
  },
  {
    key: '2fa_check',
    label: 'Two-factor check',
    description: '2FA enabled for email, bank, work',
  },
  {
    key: 'backup_essentials',
    label: 'Backup essentials',
    description: 'Backups done and tested',
  },
];

export default function ShieldPage() {
  const [checks, setChecks] = useState<Record<ShieldItemKey, boolean>>({
    update_devices: false,
    router_hygiene: false,
    browser_lockdown: false,
    '2fa_check': false,
    backup_essentials: false,
  });
  const [status, setStatus] = useState<string | null>(null);
  const [completionScore, setCompletionScore] = useState<number>(0);

  useEffect(() => {
    // Load current week's shield status
    fetch(`${API_BASE}/habits/dashboard?userId=kaizen`)
      .then((res) => res.json())
      .then((data) => {
        if (data.shield) {
          const shield = data.shield;
          setChecks({
            update_devices: shield.step_update_devices || false,
            router_hygiene: shield.step_router_hygiene || false,
            browser_lockdown: shield.step_browser_lockdown || false,
            '2fa_check': shield.step_2fa_check || false,
            backup_essentials: shield.step_backup_essentials || false,
          });
          setCompletionScore(shield.completion_score || 0);
        }
      })
      .catch((err) => console.error('Failed to load shield:', err));
  }, []);

  function toggle(key: ShieldItemKey) {
    const newChecks = { ...checks, [key]: !checks[key] };
    setChecks(newChecks);
    submitStep(key, newChecks[key]);
  }

  async function submitStep(key: ShieldItemKey, completed: boolean) {
    setStatus('saving');
    try {
      const res = await fetch(`${API_BASE}/habits/shield/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'kaizen', // TODO: Get from auth
          step: key,
          completed,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save shield step');
      }

      const data = await res.json();
      setCompletionScore(data.completion_score || 0);
      setStatus('saved');
    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
    }
  }

  const completedCount = Object.values(checks).filter(Boolean).length;

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-mobius-violet mb-2">
            Citizen Shield
          </h1>
          <p className="text-gray-600">Weekly 5-step security ritual</p>
        </header>

        <div className="space-y-4 mb-6">
          {SHIELD_ITEMS.map((item) => (
            <label
              key={item.key}
              className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={checks[item.key]}
                onChange={() => toggle(item.key)}
                className="mt-1 mr-4 w-5 h-5"
              />
              <div>
                <div className="font-semibold">{item.label}</div>
                <div className="text-sm text-gray-600">{item.description}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="p-6 bg-gray-50 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Completion</span>
            <span className="text-2xl font-bold text-mobius-violet">
              {completedCount}/5
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-mobius-violet h-2 rounded-full transition-all"
              style={{ width: `${completionScore * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Shield Score: {Math.round(completionScore * 100)}%
          </p>
        </div>

        {status === 'saved' && (
          <div className="p-4 bg-integrity-green/10 border border-integrity-green rounded-lg mb-4">
            <p className="font-semibold text-integrity-green">
              Shield updated! 🛡️
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="text-red-700">Something went wrong. Please try again.</p>
          </div>
        )}

        <div className="mt-8">
          <Link href="/" className="text-mobius-violet hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
