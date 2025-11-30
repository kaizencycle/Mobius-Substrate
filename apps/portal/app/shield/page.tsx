'use client';

import React, { useEffect, useState } from 'react';

type ShieldItemKey =
  | 'devices_updated'
  | 'router_secure'
  | 'browser_locked'
  | 'two_factor_enabled'
  | 'backups_ok';

interface ShieldChecklist {
  devices_updated: boolean;
  router_secure: boolean;
  browser_locked: boolean;
  two_factor_enabled: boolean;
  backups_ok: boolean;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

// Get the current week's Monday (ISO week start)
const getWeekStart = (): string => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().slice(0, 10);
};

export default function CitizenShieldPage() {
  const [weekStart] = useState(getWeekStart());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [checks, setChecks] = useState<ShieldChecklist>({
    devices_updated: false,
    router_secure: false,
    browser_locked: false,
    two_factor_enabled: false,
    backups_ok: false,
  });
  const [lastCompleted, setLastCompleted] = useState<string | null>(null);
  const [shieldScore, setShieldScore] = useState<number | null>(null);

  const userId = 'demo_user'; // TODO: wire to real auth / ledger identity
  const baseUrl =
    process.env.NEXT_PUBLIC_ECHO_API_BASE ||
    process.env.NEXT_PUBLIC_BROKER_API_URL ||
    'http://localhost:4005';

  useEffect(() => {
    const fetchExisting = async () => {
      if (!baseUrl) return;
      setLoading(true);
      setMessage(null);
      try {
        const res = await fetch(
          `${baseUrl}/v1/shield/checklist/${encodeURIComponent(
            userId
          )}?week_start=${weekStart}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.checks) {
            setChecks(data.checks);
          }
          if (data.last_completed) {
            setLastCompleted(data.last_completed);
          }
          if (data.shield_score !== undefined) {
            setShieldScore(data.shield_score);
          }
          setMessage('Loaded this week\'s shield checklist.');
        } else if (res.status === 404) {
          setMessage('No shield checklist yet for this week. Start fresh 🛡️');
        } else {
          setMessage('Error loading shield checklist.');
        }
      } catch (err) {
        console.error(err);
        setMessage('Network error while loading shield checklist.');
      } finally {
        setLoading(false);
      }
    };

    fetchExisting();
  }, [baseUrl, userId, weekStart]);

  const toggle = (key: ShieldItemKey) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseUrl) {
      setMessage('Shield API base URL not configured.');
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${baseUrl}/v1/shield/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          week_start: weekStart,
          checks,
          metadata: { source: 'frontend_shield_page' },
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Shield API error: ${res.status} ${text}`);
      }

      const data = await res.json();
      const completedCount = Object.values(checks).filter(Boolean).length;
      const score = completedCount / 5;
      setShieldScore(score);
      setLastCompleted(new Date().toISOString().slice(0, 10));
      setMessage(
        `Saved. Shield integrity: ${(score * 100).toFixed(0)}% (${completedCount}/5 completed)`
      );
    } catch (err) {
      console.error(err);
      setMessage('Failed to save shield checklist.');
    } finally {
      setSaving(false);
    }
  };

  const completedCount = Object.values(checks).filter(Boolean).length;
  const completionPercent = (completedCount / 5) * 100;

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Citizen Shield</h1>
        <p className="text-sm text-gray-600">
          Weekly 5-step security ritual. Week of {weekStart}
        </p>
        {lastCompleted && (
          <p className="text-xs text-gray-500">
            Last completed: {lastCompleted}
          </p>
        )}
      </header>

      {message && (
        <div className="text-sm border rounded-md px-3 py-2 bg-gray-50">
          {message}
        </div>
      )}

      {shieldScore !== null && (
        <div className="border rounded-md px-4 py-3 bg-blue-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Shield Integrity</span>
            <span className="text-lg font-semibold">
              {(shieldScore * 100).toFixed(0)}%
            </span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <ul className="space-y-3">
          <li className="border rounded-md p-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checks.devices_updated}
                onChange={() => toggle('devices_updated')}
                disabled={loading || saving}
                className="mt-1"
              />
              <div className="flex-1">
                <span className="block text-sm font-medium">
                  Devices Updated
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  OS, apps, browser updated to latest versions
                </span>
              </div>
            </label>
          </li>

          <li className="border rounded-md p-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checks.router_secure}
                onChange={() => toggle('router_secure')}
                disabled={loading || saving}
                className="mt-1"
              />
              <div className="flex-1">
                <span className="block text-sm font-medium">
                  Router Secure
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  Router password changed, remote management disabled
                </span>
              </div>
            </label>
          </li>

          <li className="border rounded-md p-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checks.browser_locked}
                onChange={() => toggle('browser_locked')}
                disabled={loading || saving}
                className="mt-1"
              />
              <div className="flex-1">
                <span className="block text-sm font-medium">
                  Browser Lockdown
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  Extensions reviewed, cookies cleaned, privacy settings checked
                </span>
              </div>
            </label>
          </li>

          <li className="border rounded-md p-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checks.two_factor_enabled}
                onChange={() => toggle('two_factor_enabled')}
                disabled={loading || saving}
                className="mt-1"
              />
              <div className="flex-1">
                <span className="block text-sm font-medium">
                  2FA Enabled
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  Two-factor authentication on email, bank, work accounts
                </span>
              </div>
            </label>
          </li>

          <li className="border rounded-md p-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checks.backups_ok}
                onChange={() => toggle('backups_ok')}
                disabled={loading || saving}
                className="mt-1"
              />
              <div className="flex-1">
                <span className="block text-sm font-medium">
                  Backups Done & Tested
                </span>
                <span className="block text-xs text-gray-500 mt-1">
                  Backups completed and recovery tested
                </span>
              </div>
            </label>
          </li>
        </ul>

        <div className="text-sm text-gray-600">
          Completed: {completedCount}/5 ({completionPercent.toFixed(0)}%)
        </div>

        <button
          type="submit"
          disabled={saving || loading}
          className="w-full px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-100 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Shield Check'}
        </button>
      </form>
    </main>
  );
}
