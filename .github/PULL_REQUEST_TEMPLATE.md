# 🌀 Mobius PR — Cycle

- **Cycle:** C-___
- **Type:** Feature / Fix / Docs / Infra / Sentinel
- **Primary Area:** apps / packages / infra / docs / sentinels

---

## 1. Summary

> Short description of what changed and why.

- [ ] Aligns with Mobius Integrity Index (MII ≥ 0.95)
- [ ] Does not weaken Anti-Nuke / Guardian guarantees
- [ ] Keeps Sentinels (ATLAS/AUREA/ECHO) in sync

---

## 2. Testing

- [ ] `pnpm test`
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] Local verification of changed services:
  - [ ] `apps/…`
  - [ ] `packages/…`

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

If this is a large or structural change, generate a pulse so Sentinels (and future AI auditors) can review context.

**How to generate:**

```bash
cd Mobius-Systems
MOBIUS_CYCLE="C-___" MOBIUS_MII="0.___" ./scripts/mobius_pulse_json.sh > mobius_pulse_PR-<number>.json
```

Then either:
- Attach `mobius_pulse_PR-<number>.json` to this PR, **or**
- Paste the core JSON below:

<details>
<summary>📦 Pulse Packet (click to expand)</summary>

```json
{
  "meta": {
    "timestamp": "2025-11-30T07:59:00Z",
    "cycleLabel": "C-___",
    "miiEstimate": "0.___"
  },
  "git": {
    "head": "<commit>",
    "recentCommits": [ "…" ],
    "changedFiles": [ "…" ]
  },
  "structure": {
    "dirTree": "…",
    "workflows": [ "…" ]
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

*"We heal as we walk." — Kaizen OS*
