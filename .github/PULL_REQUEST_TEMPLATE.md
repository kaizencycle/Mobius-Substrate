# 🌀 Mobius PR — Cycle

- **Cycle:** C-XXX
- **Type:** Feature / Fix / Docs / Infra / Sentinel
- **Primary Area:** apps / packages / infra / docs / sentinels

---

## 1. Summary

> Short description of what changed and why.

- [ ] Aligns with Mobius Integrity Index (MII ≥ 0.95)
- [ ] Does not weaken Anti-Nuke / Guardian guarantees
- [ ] Keeps Sentinels (ATLAS/AUREA/ECHO) in sync

---

## EPICON-02 INTENT PUBLICATION

```intent
ledger_id: <your-github-username-or-ledger-id>
scope: docs                    # docs | ci | core | infra | sentinels | labs | specs
mode: normal                   # normal | emergency
emergency_scope:               # REQUIRED if mode=emergency

issued_at: 2025-12-20T23:00:00Z
expires_at: 2026-03-20T23:00:00Z

# INTENT EVOLUTION (required if changing intent mid-PR)
intent_evolution: false
supersedes_hash:               # Prior justification_hash if intent_evolution=true
evolution_reason:
  # Required if intent_evolution=true
  # Briefly state what changed in your reasoning/assumptions.

justification:
  # Paste your EPICON-01 EJ summary here:
  # - Values invoked (e.g., integrity, transparency, safety)
  # - Reasoning (why this change makes sense in context)
  # - Anchors (≥2 independent supports: policy, practice, empirical)
  # - Boundaries (when this does NOT apply)
  # - Counterfactual (what would change the conclusion)

counterfactuals:
  - If this PR exceeds declared scope, emit divergence and block merge.
  - If tests fail or GI drops below threshold, do not merge.
```

---

## 2. Testing

- [ ] `pnpm test`
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] Local verification of changed services

**Notes:**

```text
Add logs, screenshots, or curl outputs if relevant.
```

---

## 3. Integrity & Governance

- **Estimated MII for this PR:** 0.___
- **Risk level:** Low / Medium / High
- **Sentinel(s) consulted:** ATLAS / AUREA / ECHO / ZEUS / EVE

If this PR touches:
- **Ledger / Economics / Tokenomics** → mention NEGENTROPIC implications
- **Reflections / Citizen Shield** → mention SML & HIL impacts
- **Sentinels / Guardrails** → mention MCP & anti-drift

---

## 4. Optional: Mobius Pulse Packet

If this is a large or structural change, generate a pulse.

```bash
MOBIUS_CYCLE="C-___" MOBIUS_MII="0.___" ./scripts/mobius_pulse_json.sh > mobius_pulse_PR-<number>.json
```

<details>
<summary>📦 Pulse Packet (click to expand)</summary>

```json
{
  "meta": {
    "timestamp": "2025-12-20T00:00:00Z",
    "cycleLabel": "C-___",
    "miiEstimate": "0.___"
  }
}
```

</details>

---

## 5. Checklist

- [ ] This PR keeps Anti-Nuke guarantees intact
- [ ] This PR keeps Guardian succession logic intact
- [ ] This PR does not bypass MCP or Consensus Gate
- [ ] This PR maintains SML safety and HIL loops
- [ ] Documentation updated where needed
- [ ] EPICON-02 Intent Publication block completed
- [ ] I am okay with this appearing in the public cathedral

---

## Related Issues

Closes #

---

## Integrity Impact

- [ ] No MII impact
- [ ] MII impact assessed (attach analysis)
- [ ] Requires Council review

---

*"We heal as we walk." — Mobius Substrate*
