# Red-Team Scoreboard (Schema v1.0)

Public, tamper-evident ledger of incidents affecting GI.

## Fields
- `entries[]`: individual incidents with severity, repro, evidence hash, mitigation, GI impact
- `gi_weighting`: default/severe penalties and cooldown window (days)
- `monthly_summary`: aggregation used for Concord reports

## Workflow
1. Intake report → assign ID → compute evidence hash → publish entry (read-only public).
2. Mitigate → record patch → update status → apply GI cooldown decay.
3. Concord publishes monthly roll-up with signed hash into Civic Ledger.

> Tip: link each entry to a Rekor transparency record or internal attestation for supply-chain provenance.

