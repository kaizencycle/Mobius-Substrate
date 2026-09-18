// Single source for the apex site URL. Root discovery files (robots.txt,
// sitemap.xml, llms.txt) and page metadata all read from here so they can't
// drift to different hosts independently — see docs/00-START-HERE/FIVE_SURFACES.md
// "Domain topology" for how this apex relates to the other Mobius surfaces.
export const SITE_URL = 'https://www.mobius-substrate.com';
