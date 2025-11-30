'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-mobius-violet mb-2">
            Mobius Habits
          </h1>
          <p className="text-gray-600">Small rituals. Strong integrity.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/reflections"
            className="block p-6 border-2 border-mobius-violet rounded-lg hover:bg-mobius-light-violet/10 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">🌀 Daily Reflections</h2>
            <p className="text-gray-600">
              Three questions a day: worldview, mood, and tomorrow's intent.
            </p>
          </Link>

          <Link
            href="/shield"
            className="block p-6 border-2 border-mobius-violet rounded-lg hover:bg-mobius-light-violet/10 transition"
          >
            <h2 className="text-2xl font-semibold mb-2">🛡️ Citizen Shield</h2>
            <p className="text-gray-600">
              Weekly 5-step cybersecurity checklist for digital safety.
            </p>
          </Link>
        </div>

        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">About Mobius Habits</h3>
          <p className="text-gray-700">
            Mobius Habits is the first testnet app for Mobius Systems — a civic
            ritual that combines daily reflection with weekly digital hygiene.
            Your reflections feed the Mobius Integrity Index (MII) and help
            train safer AI, all while keeping you grounded and secure.
          </p>
        </div>
      </div>
    </main>
  );
}
