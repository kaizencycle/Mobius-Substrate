'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_HABITS_API_BASE || 'http://localhost:4005';

export default function ReflectionsPage() {
  const [worldview, setWorldview] = useState('');
  const [moodLabel, setMoodLabel] = useState('');
  const [moodIntensity, setMoodIntensity] = useState(0.5);
  const [intent, setIntent] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<{
    mii_daily?: number;
    mic_awarded?: number;
  } | null>(null);

  const submitReflection = useCallback(async () => {
    setStatus('saving');

    try {
      const res = await fetch(`${API_BASE}/habits/reflection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'kaizen', // TODO: Get from auth
          worldviewText: worldview,
          moodLabel: moodLabel,
          moodIntensity: moodIntensity,
          intentText: intent,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save reflection');
      }

      const data = await res.json();
      setResult(data);
      setStatus('saved');
    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
    }
  }, [worldview, moodLabel, moodIntensity, intent]);

  const handleWorldviewChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setWorldview(e.target.value);
  }, []);

  const handleMoodLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMoodLabel(e.target.value);
  }, []);

  const handleMoodIntensityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMoodIntensity(parseFloat(e.target.value));
  }, []);

  const handleIntentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIntent(e.target.value);
  }, []);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-mobius-violet mb-2">
            Daily Reflection
          </h1>
          <p className="text-gray-600">Three questions for today</p>
        </header>

        <div className="space-y-6">
          <section className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-3">1. Worldview</h2>
            <p className="text-sm text-gray-600 mb-3">
              What did you notice or learn about the world today?
            </p>
            <textarea
              value={worldview}
              onChange={handleWorldviewChange}
              placeholder="Share your thoughts..."
              className="w-full p-3 border rounded-lg min-h-[120px]"
            />
          </section>

          <section className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-3">2. Mood</h2>
            <p className="text-sm text-gray-600 mb-3">
              How are you feeling right now?
            </p>
            <input
              type="text"
              value={moodLabel}
              onChange={handleMoodLabelChange}
              placeholder="One word (e.g., 'hopeful', 'calm')"
              className="w-full p-3 border rounded-lg mb-3"
            />
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Intensity: {Math.round(moodIntensity * 100)}%
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={moodIntensity}
                onChange={handleMoodIntensityChange}
                className="w-full"
              />
            </div>
          </section>

          <section className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-3">3. Tomorrow's Intent</h2>
            <p className="text-sm text-gray-600 mb-3">
              What is one thing you want Future-You to move toward tomorrow?
            </p>
            <input
              type="text"
              value={intent}
              onChange={handleIntentChange}
              placeholder="One thing to carry forward..."
              className="w-full p-3 border rounded-lg"
            />
          </section>

          <button
            onClick={submitReflection}
            disabled={status === 'saving' || !worldview || !moodLabel || !intent}
            className="w-full py-3 bg-mobius-violet text-white rounded-lg font-semibold hover:bg-mobius-deep-violet disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'saving' ? 'Saving...' : 'Save Reflection'}
          </button>

          {status === 'saved' && result && (
            <div className="p-4 bg-integrity-green/10 border border-integrity-green rounded-lg">
              <p className="font-semibold text-integrity-green mb-2">
                Reflection saved! 🌱
              </p>
              {result.mii_daily && (
                <p className="text-sm text-gray-700">
                  Today's MII: {result.mii_daily.toFixed(3)}
                </p>
              )}
              {result.mic_awarded !== undefined && result.mic_awarded > 0 && (
                <p className="text-sm text-gray-700">
                  MIC awarded: {result.mic_awarded} points
                </p>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">Something went wrong. Please try again.</p>
            </div>
          )}
        </div>

        <div className="mt-8">
          <Link href="/" className="text-mobius-violet hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
