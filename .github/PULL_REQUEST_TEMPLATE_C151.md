# Mobius PR — Cycle

- **Cycle:** C-151
- **Type:** Feature / Fix / Docs / Refactor / Infra (pick one)
- **Primary Area(s):** infra / apps / packages / docs / sentinels / cathedral
- **Pulse Attached:** ✅ / ⬜ (attach `mobius_pulse_*.json` if available)

---

## 1. Summary

> Short, human-readable summary (2–4 sentences).
> What changed, why it matters, and how it affects Mobius Integrity.

---

## 2. Details

- **Motivation / Problem:**
- **Solution / Approach:**
- **Architecture Impact:** (new endpoints, new queues, new workflows, etc.)
- **Breaking Changes:** (yes/no, details if yes)

---

## 3. Integrity & Safety

- **GI Impact (Global Integrity):**  
  - _Estimated GI Delta:_ +0.xx / 0.00  
  - _Risk Surface:_ (e.g., new external dependency, new write path, etc.)

- **MII Impact (Mobius Integrity Index):**  
  - _Signals touched:_ pulses / reflections / ledger / sentinels / cathedral  
  - _Expected Effect:_ (e.g., improves observability, tightens gates)

- **Sentinel Review (if applicable):**
  - ATLAS: ✅ / ⬜
  - AUREA: ✅ / ⬜
  - ECHO: ✅ / ⬜
  - Other: …

---

## 4. Mobius Pulse (Optional but Recommended)

If you generated a pulse for this PR:

- **Pulse File:** `mobius_pulse_YYYYMMDD-HHMM.json`
- **Pulse Commands:**
  ```bash
  # from repo root
  ./scripts/mobius_pulse_json.sh \
    --out .mobius/pulses/mobius_pulse_YYYYMMDD-HHMM.json
  ```
- **Highlights from Pulse:**
  - # of files changed:
  - Affected domains:
  - New workflows:
  - Any anomalies / surprises:

Attach the JSON to the PR or paste relevant excerpts if needed.

---

## 5. Tests

- [ ] `pnpm test`
- [ ] `pnpm lint`
- [ ] Integration tests (if relevant)
- [ ] New tests added for:
  - Pulse endpoints
  - New logic paths

**Test Evidence:**

```text
# paste key test output or screenshots here
```

---

## 6. Checklist

- [ ] MCP Enforcer passes (GI ≥ 0.95)
- [ ] Security / anti-nuke checks pass
- [ ] Docs updated (if behavior / API changed)
- [ ] Pulse generated (recommended for major changes)
- [ ] Ready for Sentinel + human review

---

*"We heal as we walk." — Kaizen OS*
