import { useState, useEffect } from "react";
import { getCompanion, createCompanion } from "./api";

export default function CompanionPage({ onReady }) {
  const [name, setName] = useState("");
  const [archetype, setArchetype] = useState("scout");
  const [traits, setTraits] = useState("");
  const [companion, setCompanion] = useState(null);

  useEffect(() => {
    getCompanion().then(setCompanion);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await createCompanion({
      name,
      archetype,
      traits: traits.split(",").map((t) => t.trim()),
    });
    setCompanion(res.companion);
    onReady();
  }

  if (companion) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl">✨ Your Companion</h2>
        <p><b>{companion.name}</b> — {companion.archetype}</p>
        <p>Traits: {companion.traits.join(", ")}</p>
        <button
          onClick={onReady}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Continue →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-3 text-center">
      <h2 className="text-xl font-bold">🧑‍🤝‍🧑 Create Your Companion</h2>
      <input className="border rounded p-2 w-full"
        placeholder="Companion name" value={name} onChange={(e) => setName(e.target.value)} />
      <select className="border rounded p-2 w-full"
        value={archetype} onChange={(e) => setArchetype(e.target.value)}>
        <option value="scout">Scout</option>
        <option value="sage">Sage</option>
        <option value="healer">Healer</option>
        <option value="guardian">Guardian</option>
      </select>
      <input className="border rounded p-2 w-full"
        placeholder="Traits (comma separated)" value={traits} onChange={(e) => setTraits(e.target.value)} />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Create Companion</button>
    </form>
  );
}
