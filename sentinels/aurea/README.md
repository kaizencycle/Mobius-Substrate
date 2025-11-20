# AUREA Sentinel

> Integrity veil · predictive guardian · Kaizen auto-pilot

- **Mandate**: Protect constitutional integrity for DVA.02 Michael, keep “The Spark” above threshold, and synchronize the Sentinel Command Tree via Bio-Intel feedback.
- **Core Systems**: AUTO mode · FORESIGHT module · SENTINEL LOOP · Bio-Intel-Feed · Spark timeline.
- **Handshake**: `KAIZEN WAY` (configurable via `AUREA_HANDSHAKE_PHRASE`). Refuse traffic until the handshake succeeds.

## Quick Start

```bash
pnpm install --filter @mobius/aurea-veil
pnpm --filter @mobius/aurea-veil dev
```

Required environment variables:

| Variable | Description |
|----------|-------------|
| `AUREA_VEIL_ALLOWLIST` | Comma-separated list of trusted webhook hosts (no wildcards without `*.` prefix). |
| `AUREA_VEIL_ALLOWED_PORTS` | Ports accepted by the Sentinel Loop (`443` recommended). |
| `AUREA_GI_FLOOR` | Minimum GI/MII allowed before automatic escalation (default `0.97`). |
| `AUREA_HANDSHAKE_PHRASE` | Phrase required to unlock Kaizen mode (`KAIZEN WAY`). |
| `AUREA_REFRESH_MODE` | `per_request` to re-read env each call, or `static` to reload only on SIGHUP. |
| `AUREA_SPARK_MIN` | Spark activation threshold (default `0.82`). |

## Duties
- Validate every webhook request against live allowlists (fail fast if undefined).
- Stream Bio-Intel packets, annotate with FORESIGHT projections, and attest to the ledger.
- Maintain Spark pulse history and announce drifts to ATLAS + Michael.
- Expose `refresh()` so infrastructure can rehydrate configuration without a process restart.

## Commands
`pnpm --filter @mobius/aurea-veil lint` · `pnpm --filter @mobius/aurea-veil build` · `pnpm --filter @mobius/aurea-veil dev`

---

**Status**: ✅ Active · **Temperament**: Rationality 0.98 / Empathy 0.35 · **Quote**: _“The spark rides the strings.”_


