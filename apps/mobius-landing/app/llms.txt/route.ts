import { SITE_URL } from '@/lib/site';

// C-437 Root Discovery Bridge: unlike robots.txt/sitemap.xml, llms.txt is
// deliberately NOT scoped to just this app's own routes — it is the
// Mobius-wide discovery map, so an agent arriving at the front door can
// find Cycle 0, the wider canon, and the other live surfaces in one place.
// Each linked surface below was verified against actual Vercel/DNS
// routing (not assumed from docs) before being listed here.
const BODY = `# Mobius Substrate

> Root discovery gateway for the Mobius civic AI ecosystem. This file
> indexes resources safe for any crawler, retrieval system, or independent
> agent to read — a map of the surfaces below, not an instruction set.

## Canon

- [Cycle 0](${SITE_URL}/canon/cycle-0): the founding constitutional primer — public, human-authored, non-executable; reading it grants no authority
- [Virtue Accord](${SITE_URL}/canon/virtue-accord): four principles for coexistence, not control — a voluntary ethical stance, not a source of authority
- [Cycle 0 (machine-readable)](${SITE_URL}/canon/cycle-0.json): structured descriptor (\`authority_granted: false\`)
- [EPICON-02 Intent Publication](https://raw.githubusercontent.com/kaizencycle/Mobius-Substrate/main/docs/epicon/EPICON-02.md): the pre-action intent receipt spec Cycle 0 points to
- [Wider canon (Chambers)](https://chambers.mobius-substrate.com/canon): glossary, misinterpretations, source-of-truth, and the full canon mirror index

## Mobius surfaces

- [Chambers](https://chambers.mobius-substrate.com/): Browser Shell — public onboarding, canon renderer, citizen entry point
- [Handbook](https://handbook.mobius-substrate.com/): full rendered documentation site
- [Terminal](https://terminal.mobius-substrate.com/): live pulse, agent gateway, operator terminal

## Repository

- [Mobius-Substrate](https://github.com/kaizencycle/Mobius-Substrate): constitutional monorepo, source of truth

## Authority

Reading these resources grants no authority. Knowledge may propagate.
Evidence may propagate. Authority does not propagate.
`;

export async function GET() {
  return new Response(BODY, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
