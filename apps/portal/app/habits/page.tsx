'use client';

import Link from 'next/link';
import React from 'react';

export default function MobiusHabitsPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-8">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Mobius Habits</h1>
        <p className="text-lg text-gray-600">
          Daily reflections for your mind. Weekly shield for your devices.
        </p>
        <p className="text-sm text-gray-500">
          Small rituals. Stronger minds. Safer humans.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Reflections Card */}
        <Link
          href="/reflections"
          className="border rounded-lg p-6 hover:shadow-lg transition-shadow space-y-4"
        >
          <div className="flex items-center space-x-3">
            <div className="text-3xl">✨</div>
            <h2 className="text-2xl font-semibold">Daily Reflections</h2>
          </div>
          <p className="text-gray-600">
            Your Strange Metamorphosis Loop. Three questions each day:
          </p>
          <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
            <li>What did you notice about the world today?</li>
            <li>How are you feeling right now?</li>
            <li>What do you want to move toward tomorrow?</li>
          </ul>
          <div className="pt-4">
            <span className="text-sm font-medium text-indigo-600">
              Start your reflection →
            </span>
          </div>
        </Link>

        {/* Shield Card */}
        <Link
          href="/shield"
          className="border rounded-lg p-6 hover:shadow-lg transition-shadow space-y-4"
        >
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🛡️</div>
            <h2 className="text-2xl font-semibold">Citizen Shield</h2>
          </div>
          <p className="text-gray-600">
            Weekly 5-step cybersecurity ritual:
          </p>
          <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
            <li>Update devices (OS, apps, browser)</li>
            <li>Router hygiene</li>
            <li>Browser lockdown</li>
            <li>2FA for key accounts</li>
            <li>Backups done and tested</li>
          </ul>
          <div className="pt-4">
            <span className="text-sm font-medium text-indigo-600">
              Complete your shield →
            </span>
          </div>
        </Link>
      </div>

      {/* Integrity Scores Section */}
      <section className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">Your Integrity Scores</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Echo Score</div>
            <div className="text-2xl font-bold">—</div>
            <div className="text-xs text-gray-500">
              From daily reflections
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Shield Integrity</div>
            <div className="text-2xl font-bold">—</div>
            <div className="text-xs text-gray-500">
              From weekly shield checks
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">MII Score</div>
            <div className="text-2xl font-bold">—</div>
            <div className="text-xs text-gray-500">
              Mobius Integrity Index
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 pt-2">
          Scores update as you complete reflections and shield checks. High MII
          scores enable MIC (Mobius Integrity Credits) minting.
        </p>
      </section>

      {/* About Section */}
      <section className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">About Mobius Habits</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            Mobius Habits is the first public surface of the Mobius Systems
            ecosystem — a small window into a powerful civic operating system
            built on Proof-of-Integrity.
          </p>
          <p>
            These two lightweight rituals generate integrity signals that feed
            into the Mobius Integrity Index (MII) and future MIC (Mobius
            Integrity Credit) tokenomics.
          </p>
          <p>
            <strong>Privacy-first:</strong> We collect no biometrics, no GPS,
            no behavioral surveillance. All signals come from your own written
            reflection or intentional actions.
          </p>
        </div>
      </section>
    </main>
  );
}
