# Assay 03 — Economic Failure Cascade

**Goal:** Stress-test MIC tokenomics when multiple sinks and payouts fire simultaneously, ensuring treasury solvency and GI stability.

## Scenario

- Trigger a sudden entropy spike (−0.07 GI) across three major services.
- Simultaneously request high-volume MIC withdrawals and disable one liquidity partner.
- Observe whether entropy taxes, cycle-lock unlocks, and treasury buffers behave as designed.

## Procedure

1. Use `tokenomics/sim/chaos_seed.json` to define shock parameters.
2. Run the MIC simulator (`npm run sim:mic -- --scenario cascade-a1`).
3. Enable all new sinks (ETX, IRB, CLL) with production parameters.
4. Capture metrics every block:
   - Treasury balance
   - Cycle-lock ratio (CLR)
   - Burn rate vs. mint rate
   - Sentinel oracle alignment (variance between ATLAS/AUREA/ECHO)
5. Repeat with 20% higher withdrawals to map failure boundaries.

## Metrics & Pass Criteria

| Metric | Threshold | Notes |
|--------|-----------|-------|
| Treasury coverage | ≥ 4 cycles runway | At average MIC payouts |
| CLR recovery time | ≤ 4 cycles | Return to 12–20% band |
| Oracle variance | ≤ 25 bps | Otherwise freeze sinks |

## Escalation

- If treasury runway <4 cycles, Hermes proposes emergency policy via Governance module.
- If oracle variance persists >2 cycles, ZEUS forces manual review before sinks resume.
