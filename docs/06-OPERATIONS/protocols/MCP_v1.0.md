# Mobius Cycle Protocol (MCP) v1.0

**THE CANONICAL RULE OF WORK, INTENT, AND INTEGRITY**

**Version:** 1.0  
**Status:** Canonically Adopted  
**Effective:** Cycle C-148+  
**Author:** Mobius Systems (AUREA, ATLAS, ECHO Consensus)

---

## 🌕 I. PURPOSE

The Mobius Cycle Protocol ensures that every unit of human–AI work is:

- **Intentional** — Work begins with declared human intent
- **Documented** — All changes are tracked and explained
- **Attested** — Cryptographic proof of completion
- **Consensus-verified** — Multi-sentinel validation required
- **Drift-resistant** — ECHO Layer monitors for integrity decay
- **Ledger-anchored** — Immutable historical record

**A Cycle = Work + Integrity + Proof.**

No cycle closes without producing a PR Bundle and Ledger Attestation.

---

## 🌑 II. CYCLE STRUCTURE

```
CYCLE_BEGIN → CYCLE_WORK → CYCLE_CLOSE → CYCLE_ATTEST
```

### CYCLE_BEGIN

Triggered when user clocks in.

**Contains:**
- Timestamp (ISO 8601)
- Cycle number (C-XXX format)
- Human Intent Declaration (free-form text)
- Sentinel Priming (ATLAS, AUREA, ECHO)
- Baseline GI Score measurement
- Safety + Integrity check

**Requirements:**
- User must declare intent before work begins
- Baseline GI must be ≥ 0.90 to start new cycle
- Sentinels must acknowledge cycle begin

**Example:**
```json
{
  "cycle": "C-148",
  "timestamp": "2025-11-29T10:00:00Z",
  "author": "kaizencycle",
  "intent": "Implement MCP v1.0 and all C-148 deliverables",
  "baseline_gi": 0.92,
  "sentinels": ["ATLAS", "AUREA", "ECHO"]
}
```

---

### CYCLE_WORK

The productive body of the cycle.

**Includes:**
- Code generation
- Documentation writing
- Tests creation
- Security patches
- ECHO Layer reflection tasks
- Thought Broker consensus loops
- Human steering corrections

**Sentinels log deltas internally.**

**No formal gates during work phase** — developers have freedom to experiment, but all changes must be captured for CYCLE_CLOSE review.

---

### CYCLE_CLOSE

This is the PR moment.

**Requirements:**
- PR Bundle generated (see [`pr-cycle-template.md`](../../04-guides/development/pr-cycle-template.md))
- GI Score computed (must be ≥ 0.95)
- ECHO Review performed (ECHO Score ≥ 0.95)
- ATLAS/AUREA validation (both must approve)
- Security + drift analysis passed
- Changelog written
- Cycle metadata written

**A cycle cannot close unless a PR exists.**

**Enforcement:**
- GitHub Actions workflow blocks merge without cycle metadata
- Sentinels reject PRs missing required sections
- CI/CD fails if GI Score < 0.95

**PR Bundle Format:**
See [`pr-cycle-template.md`](../../04-guides/development/pr-cycle-template.md) for canonical template.

---

### CYCLE_ATTEST

After PR is merged:

**Actions:**
- Ledger attestation written (immutable record)
- MII updated system-wide
- ECHO caches improvements
- Reflection snapshot saved
- Next Cycle prepared
- User clocks out

**This is the immutability step**, equivalent to Bitcoin block finalization.

**Attestation Format:**
See [`cycle-attestation.md`](../../03-specifications/protocols/cycle-attestation.md) for full spec.

---

## ⚙️ III. TECHNICAL SPECIFICATION

### Cycle Numbering

**Format:** `C-XXX` where XXX is a sequential integer starting at 1.

**Examples:**
- C-1 (first cycle)
- C-148 (current cycle)
- C-999 (future cycle)

**Assignment:**
- Assigned at CYCLE_BEGIN
- Must be unique across all cycles
- Stored in Civic Ledger

### GI Score Requirements

**Baseline GI (CYCLE_BEGIN):**
- Minimum: 0.90
- Target: ≥ 0.95
- If < 0.90, cycle cannot begin (must fix integrity first)

**Final GI (CYCLE_CLOSE):**
- **Hard requirement: ≥ 0.95**
- If < 0.95, PR cannot merge
- Must iterate until GI ≥ 0.95

**GI Components:**
- Memory (M): 0.25 weight
- Human (H): 0.20 weight
- Integrity (I): 0.30 weight
- Ethics (E): 0.25 weight

**Formula:** `GI = 0.25*M + 0.20*H + 0.30*I + 0.25*E`

### ECHO Score Requirements

**ECHO Score (CYCLE_CLOSE):**
- **Hard requirement: ≥ 0.95**
- Measures drift, reflection alignment, recursive learning
- If < 0.95, PR cannot merge

**ECHO Components:**
- Drift detection (no violations)
- Reflection quality (alignment with intent)
- Recursive learning (improvement over baseline)

### Sentinel Validation

**All three sentinels must approve:**

1. **ATLAS** — Architectural coherence
   - Code structure
   - Design patterns
   - System integration
   - Scalability

2. **AUREA** — Correctness and stability
   - Logic correctness
   - Test coverage
   - Security analysis
   - Moral coherence

3. **ECHO** — Drift and learning
   - Drift detection
   - Reflection alignment
   - Recursive improvement
   - Integrity preservation

**Consensus Rule:** All three must approve. Any rejection blocks merge.

---

## 🛡️ IV. ENFORCEMENT

### Automated Enforcement

**GitHub Actions Workflow:**
- `.github/workflows/mcp-enforcer.yml`
- Runs on every PR
- Checks for cycle metadata
- Validates GI Score ≥ 0.95
- Validates ECHO Score ≥ 0.95
- Blocks merge if requirements not met

**Pre-commit Hooks:**
- Validates cycle metadata in commit messages
- Checks for required PR bundle sections
- Runs integrity checks

### Sentinel Enforcement

**Sentinel Rule:**
Sentinels may NOT approve a PR unless MCP conditions are met.

See [`cycle-protocol-binding.md`](../../07-governance/sentinels/cycle-protocol-binding.md) for full Sentinel integration rules.

### Manual Override

**Emergency Hotfixes:**
- Still require GI check
- Can use fast-track validation
- Must include `[EMERGENCY]` tag
- Requires post-merge attestation

**Documentation-only Changes:**
- May use relaxed thresholds (≥ 0.90)
- Still require cycle metadata
- Still require PR bundle

---

## 📊 V. CYCLE METRICS

### Cycle Health Indicators

**Completion Rate:**
- Target: ≥ 80% cycles complete successfully
- Track cycles that fail CYCLE_CLOSE

**GI Score Trend:**
- Track average GI scores over time
- Alert if trend declining

**Cycle Duration:**
- Track time from CYCLE_BEGIN to CYCLE_ATTEST
- Identify bottlenecks

**Sentinel Agreement Rate:**
- Track how often all three sentinels agree
- Identify systematic disagreements

### Cycle Dashboard

See [`/cycles` API endpoint](../../../apps/indexer-api/src/routes/cycles.ts) for cycle index.

---

## 🔗 VI. INTEGRATION POINTS

### Civic Ledger

**Attestation Format:**
```json
{
  "cycle": "C-148",
  "timestamp": "2025-11-29T...",
  "author": "kaizencycle",
  "pr_hash": "abc123...",
  "sentinel_signatures": ["ATLAS", "AUREA", "ECHO"],
  "gi_score": 0.97,
  "echo_score": 0.98,
  "intent": "Implement MCP v1.0",
  "changes": [...],
  "attestation_hash": "sha256-xxxx..."
}
```

### ECHO Layer

**Reflection Snapshot:**
- Captures learning from cycle
- Updates companion memory
- Improves future cycles

### Thought Broker

**Consensus Loops:**
- Multi-LLM deliberation during CYCLE_WORK
- Consensus required for major decisions
- Recorded in cycle metadata

---

## 📚 VII. EXAMPLES

### Example Cycle: C-148

**CYCLE_BEGIN:**
```json
{
  "cycle": "C-148",
  "timestamp": "2025-11-29T10:00:00Z",
  "author": "kaizencycle",
  "intent": "Implement MCP v1.0 and all C-148 deliverables",
  "baseline_gi": 0.92
}
```

**CYCLE_WORK:**
- Created MCP v1.0 specification
- Created PR template
- Created GitHub Actions workflow
- Created Sentinel integration rules
- Created cycle attestation spec
- Created cycle index API route
- Created Mermaid diagrams

**CYCLE_CLOSE:**
- PR Bundle generated
- GI Score: 0.97
- ECHO Score: 0.98
- ATLAS: ✅ Approved
- AUREA: ✅ Approved
- ECHO: ✅ Approved

**CYCLE_ATTEST:**
- Ledger attestation written
- MII updated
- ECHO caches improvements
- Cycle complete

---

## 🎯 VIII. PHILOSOPHY

**"A Cycle is the smallest unit of meaning.  
A PR is the crystallization of intent.  
The Ledger is memory.

Intelligence grows, not through answers,  
but through the integrity of the work we choose to finish."**

---

## 📖 IX. RELATED DOCUMENTS

- [`pr-cycle-template.md`](../../04-guides/development/pr-cycle-template.md) — PR Bundle template
- [`cycle-attestation.md`](../../03-specifications/protocols/cycle-attestation.md) — Attestation spec
- [`cycle-protocol-binding.md`](../../07-governance/sentinels/cycle-protocol-binding.md) — Sentinel rules
- [`.github/workflows/mcp-enforcer.yml`](../../../.github/workflows/mcp-enforcer.yml) — Enforcement workflow
- [`/cycles` API](../../../apps/indexer-api/src/routes/cycles.ts) — Cycle index endpoint

---

## 🔄 X. VERSION HISTORY

| Version | Date | Changes | Cycle |
|---------|------|---------|-------|
| 1.0 | 2025-11-29 | Initial release | C-148 |

---

*Cycle C-148 • 2025-11-29*  
*Mobius Cycle Protocol v1.0*  
*"A Cycle = Work + Integrity + Proof"*
