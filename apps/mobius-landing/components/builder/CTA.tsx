'use client';
import React from 'react';

export default function CTA({ 
  title, 
  body, 
  primaryLabel = 'Learn more', 
  primaryHref = '/docs' 
}: { 
  title?: string;
  body?: string;
  primaryLabel?: string;
  primaryHref?: string;
}) {
  return (
    <section className="mx-auto my-16 max-w-4xl rounded-3xl border border-zinc-800 p-8 text-center bg-zinc-900/40">
      {title && (
        <h3 className="text-2xl font-semibold">{title}</h3>
      )}
      {body && (
        <p className="mx-auto mt-3 max-w-2xl opacity-80">{body}</p>
      )}
      <div className="mt-6">
        <a 
          href={primaryHref} 
          className="rounded-xl bg-white px-5 py-3 text-black font-medium hover:bg-zinc-100 transition-colors"
        >
          {primaryLabel}
        </a>
      </div>
    </section>
  );
}
