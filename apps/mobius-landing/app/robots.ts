import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// C-437 Root Discovery Bridge: the apex previously had no robots.txt at
// all. It is controlled here, independently of Browser Shell's own
// robots.txt at chambers.mobius-substrate.com — one does not forward the
// other, since each host may need its own crawl rules over time.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Internal operator telemetry dashboard — not for public indexing.
        disallow: '/ops',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
