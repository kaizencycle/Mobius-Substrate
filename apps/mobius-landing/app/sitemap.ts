import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// C-437 Root Discovery Bridge: the apex previously had no sitemap.xml at
// all. This does not replace or proxy Browser Shell's own sitemap
// (chambers.mobius-substrate.com/sitemap.xml, which indexes the wider
// canon set) — it lists routes this app itself owns, plus the two
// discovery-bridged canon URLs proxied via next.config.mjs rewrites.
// Builder.io–managed pages (app/[...page]) are content-managed dynamically
// and are not enumerable at build time, so they are intentionally not
// listed here.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/canon/cycle-0`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/canon/virtue-accord`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.85,
    },
  ];
}
