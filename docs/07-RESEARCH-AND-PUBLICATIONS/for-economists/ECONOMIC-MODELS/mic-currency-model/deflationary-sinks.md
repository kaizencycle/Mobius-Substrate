# MIC Deflationary Sinks — Cycle C-150

Cycle C-150 implements the Grok recommendation to add explicit monetary sinks so that MIC supply remains bounded even during rapid adoption phases. Use this note when briefing central banks or policy partners; the deeper engineering specification lives in `docs/04-TECHNICAL-ARCHITECTURE/economics/deflationary-sinks.md`.

## Summary Table

| Sink | Trigger | Policy Goal | Notes |
|------|---------|-------------|-------|
| **Entropy Tax (ETX)** | Measured entropy spike (MII/GI drop >10bps per cycle) | Penalize disorder, auto-burn | RiskFactor tuned by Atlas; appeals handled by Jade |
| **Integrity Rebate Burn (IRB)** | ≥5-cycle GI streak above baseline | Reward loyalty while shrinking supply | 50% paid, 50% burned; requires tri-sentinel oracle |
| **Cycle-Lock Liquidity (CLL)** | Voluntary MIC lock (3–12 cycles) | Raise CLR (12–20%) and dampen volatility | 10% tail remains locked as systemic reserve |

## Economic Impact

- **Net Supply:** Expected -1.2% to -2.0% annualized burn assuming current adoption curve.
- **Treasury:** Treasury share of MIC mints unchanged; sinks operate post-mint.
- **Behavior:** Citizens are nudged toward consistent reflections (IRB), disciplined operations (ETX avoidance), and long-horizon projects (CLL).

## Implementation Notes

1. **Telemetry:** Atlas publishes entropy deltas; Aurea validates ethical drift; Echo confirms time-series stability. Final numbers use median-of-three.
2. **Ledger:** Civic Protocol Core adds event types `BURN_ETX`, `REBATE_IRB`, and `LOCK_CLL`.
3. **Dashboards:** Ops/Grafana add cards for ETX burns, IRB payouts, and CLR band monitoring.

## Next Steps

- [ ] Present sinks to IMF/EU working groups (FOR-GOVERNMENTS brief).
- [ ] Publish MIC Tokenomics v2 update (`docs/07-RESEARCH-AND-PUBLICATIONS/tokenomics/`).
- [ ] Simulate IRB payout curves using historical MII data (Hermes analytics).

> *“Deflation is not about scarcity; it is about rewarding custodianship of order.”*
