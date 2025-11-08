'use client';
import React from 'react';

export default function FeatureGrid({ 
  items = [] 
}: { 
  items?: { title: string; desc: string }[] 
}) {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-10 md:grid-cols-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-2xl border border-zinc-800 p-6 bg-zinc-900/40">
          <h4 className="text-lg font-semibold">{it.title}</h4>
          <p className="mt-2 opacity-80">{it.desc}</p>
        </div>
      ))}
    </section>
  );
}
