'use client';
import React from 'react';

export default function Hero({
  eyebrow = 'Mobius Systems',
  title,
  subtitle,
  ctaLabel = 'Get Started',
  ctaHref = '/docs',
  bgFractal = true,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  bgFractal?: boolean;
}) {
  return (
    <section className="relative overflow-hidden px-6 py-24 md:py-32">
      {bgFractal && (
        <div className="pointer-events-none absolute inset-0 opacity-25">
          <div 
            className="mx-auto h-full w-full max-w-7xl blur-3xl"
            style={{ 
              background: 'radial-gradient(60% 60% at 50% 40%, rgba(99,102,241,.4), rgba(16,185,129,.25) 60%, transparent 70%)' 
            }} 
          />
        </div>
      )}
      <div className="relative mx-auto max-w-4xl text-center">
        {eyebrow && (
          <div className="text-sm uppercase tracking-widest opacity-70">{eyebrow}</div>
        )}
        {title && (
          <h1 className="mt-3 text-4xl font-bold leading-tight md:text-6xl">{title}</h1>
        )}
        {subtitle && (
          <p className="mx-auto mt-5 max-w-2xl text-lg opacity-80">{subtitle}</p>
        )}
        <div className="mt-8">
          <a 
            href={ctaHref} 
            className="inline-flex items-center rounded-xl px-6 py-3 text-white bg-black/90 hover:bg-black transition-colors"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
