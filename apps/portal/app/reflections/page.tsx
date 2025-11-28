"use client";

import React, { useEffect, useState } from "react";

type ReflectionForm = {
  worldview_text: string;
  mood_label: string;
  intent_text: string;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function DailyReflectionsPage() {
  const [date] = useState(todayISO());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<ReflectionForm>({
    worldview_text: "",
    mood_label: "",
    intent_text: "",
  });

  const userId = "demo_user"; // TODO: wire to real auth / ledger identity
  const baseUrl =
    process.env.NEXT_PUBLIC_ECHO_API_BASE ||
    process.env.NEXT_PUBLIC_BROKER_API_URL ||
    "http://localhost:4005";

  useEffect(() => {
    const fetchExisting = async () => {
      if (!baseUrl) return;
      setLoading(true);
      setMessage(null);
      try {
        const res = await fetch(
          `${baseUrl}/v1/reflections/daily/${encodeURIComponent(
            userId
          )}?date=${date}`
        );
        if (res.ok) {
          const data = await res.json();
          setForm({
            worldview_text: data.worldviewText || data.worldview_text || "",
            mood_label: data.moodLabel || data.mood_label || "",
            intent_text: data.intentText || data.intent_text || "",
          });
          setMessage("Loaded today's reflection.");
        } else if (res.status === 404) {
          setMessage("No reflection yet for today. Start fresh ✨");
        } else {
          setMessage("Error loading existing reflection.");
        }
      } catch (err) {
        console.error(err);
        setMessage("Network error while loading reflection.");
      } finally {
        setLoading(false);
      }
    };

    fetchExisting();
  }, [baseUrl, userId, date]);

  const handleChange =
    (field: keyof ReflectionForm) =>
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseUrl) {
      setMessage("Echo API base URL not configured.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${baseUrl}/v1/reflections/daily`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          date,
          worldview_text: form.worldview_text,
          mood_label: form.mood_label,
          intent_text: form.intent_text,
          metadata: { source: "frontend_reflections_page" },
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Echo error: ${res.status} ${text}`);
      }

      const data = await res.json();
      setMessage(
        `Saved. Echo score: ${
          data.echoScore ?? data.echo_score ?? "—"
        }, GI: ${data.giScore ?? data.gi_score ?? "—"}`
      );
    } catch (err) {
      console.error(err);
      setMessage("Failed to save reflection.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">
          Daily Reflections (Strange Metamorphosis)
        </h1>
        <p className="text-sm text-gray-600">
          {date} — Three small questions. No judgment, just a mirror.
        </p>
      </header>

      {message && (
        <div className="text-sm border rounded-md px-3 py-2 bg-gray-50">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="space-y-1">
          <label className="block text-sm font-medium">
            1. How do you see the world today?
          </label>
          <textarea
            value={form.worldview_text}
            onChange={handleChange("worldview_text")}
            rows={3}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring"
            placeholder="Write a sentence or two. Honest is better than perfect."
            disabled={loading || saving}
          />
        </section>

        <section className="space-y-1">
          <label className="block text-sm font-medium">
            2. How are you feeling right now?
          </label>
          <input
            value={form.mood_label}
            onChange={handleChange("mood_label")}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring"
            placeholder='e.g. "tired but grateful", "calm", "overwhelmed"'
            disabled={loading || saving}
          />
        </section>

        <section className="space-y-1">
          <label className="block text-sm font-medium">
            3. What do you want to move toward tomorrow?
          </label>
          <textarea
            value={form.intent_text}
            onChange={handleChange("intent_text")}
            rows={3}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring"
            placeholder="One small thing you'd be proud to have done."
            disabled={loading || saving}
          />
        </section>

        <button
          type="submit"
          disabled={saving || loading}
          className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-100 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Reflection"}
        </button>
      </form>
    </main>
  );
}
