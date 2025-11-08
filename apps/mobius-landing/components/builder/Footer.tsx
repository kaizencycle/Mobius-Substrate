'use client';
import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-800 py-8 text-center text-sm opacity-70">
      © {new Date().getFullYear()} Mobius Systems · Evaluated by the Kaizen Turing Test
    </footer>
  );
}
