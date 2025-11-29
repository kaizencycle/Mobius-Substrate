# Civic Encyclopedia Charter

**Document Type:** Governance  
**Scope:** Mobius AI Encyclopedia (Echo-backed, GI-gated)  
**Version:** 0.1 (Draft)  
**Owner:** Custodians of Mobius Systems

---

## 1. Purpose

The Mobius AI Encyclopedia exists to:

1. Provide **high-integrity, reusable knowledge** for AI agents and humans.
2. Reduce **hallucinations and drift** by caching GI-scored consensus answers.
3. Preserve **provenance and accountability** via the Civic Ledger.
4. Evolve as a **living canon**, updated through transparent procedures.

It is not:

- A perfect source of ultimate truth.
- A replacement for human judgment.
- A private knowledge hoard. (Its intent is civic.)

---

## 2. Status Levels

Each entry has one of three status levels:

### 2.1 CANONICAL

- **Definition:** High-confidence, multi-engine, GI-scored answer that passed thresholds and (optionally) human review.
- **Typical GI requirement:** ≥ 0.95
- **Usage:** Default for agents when answering questions on that topic.
- **Requirements:**
  - Multi-engine consensus (at least 2 independent engines).
  - Majority APPROVE votes from Sentinels.
  - Sources attached (URLs, docs, or internal artifacts).
  - No outstanding human objections or pending flags.

### 2.2 DRAFT

- **Definition:** Provisional answer that may be useful, but did not reach canonical GI threshold, or needs human review.
- **Typical GI range:** 0.90–0.95
- **Usage:** Never auto-used as ground truth; may be:
  - Shown to humans for review.
  - Used as one input among others in fresh reasoning.
- **Requirements:**
  - At least one engine supports it.
  - Sources attached where possible.
  - Flagged for review by a Custodian or designated human.

### 2.3 NEEDS_REVIEW

- **Definition:** Entry that is suspected to be outdated, biased, or incorrect.
- **Triggers:**
  - New evidence conflicts with existing content.
  - Human flag via UI or governance flow.
  - Sentinel anomaly detection (e.g. conflicting GI-high entries).

- **Usage:** Must **not** be treated as ground truth.
- **Actions:**
  - Scheduled for re-deliberation via Thought Broker.
  - Human reviewer may edit, downgrade, or retire the entry.

---

## 3. GI (Global Integrity) Thresholds

Default GI thresholds (may evolve):

- `GI ≥ 0.97` → **Strong Canonical**  
  - Safe for long-term reuse, high confidence.
- `0.95 ≤ GI < 0.97` → **Canonical**  
  - Safe for reuse; monitor periodically.
- `0.90 ≤ GI < 0.95` → **Draft**  
  - Must be reviewed before promotion.
- `GI < 0.90` → **Not stored** or stored only as `DRAFT` with explicit warning.

GI scoring is always:

- **Multi-dimensional:** factual accuracy, coherence, source alignment, constitutional alignment.
- **Multi-engine:** no single model may unilaterally set GI.

---

## 4. Creation Paths

Entries can be created via:

1. **Nightly / Scheduled Flows**
   - Cron or n8n workflows using Thought Broker.
   - Typical for: tokenomics, OS components, lore, civic use-cases.

2. **On-Demand Ingest**
   - When a fresh deliberation achieves high GI (≥ 0.95) for a known `topicId`.
   - The agent may trigger `/v1/encyclopedia/ingest`.

3. **Human Authored / Edited**
   - Custodian, researcher, or maintainer writes or edits content.
   - Must still pass GI + optionally Sentinel review.

All creation paths must:

- Attach sources where possible.
- Record `createdBy` field (human id or system id).
- Optionally create a Civic Ledger attestation with content hash.

---

## 5. Update & Versioning Rules

- Each `(topicId, version)` is immutable once written.
- New information or improved consensus creates a **new version**:
  - `version = previousMaxVersion + 1`
- Only the **highest version with `status='CANONICAL'`** is treated as active canon.
- Older versions remain:
  - Auditable for provenance.
  - Available for time-based queries (e.g. “what was canon in 2026?”).

**Downgrades:**

- If a canonical entry is later found flawed:
  - It may be downgraded to `NEEDS_REVIEW`.
  - A new version may replace it as `CANONICAL`.
  - The ledger record remains, but a new attestation may reference the correction.

---

## 6. Redaction & Sensitive Content

The encyclopedia must not:

- Reveal personal sensitive data (PII, PHI).
- Contain doxxing, harassment, or targeted defamation.
- Embed exploit recipes, serious security vulnerabilities, or biothreats.

If such content is discovered:

1. Status is set to `NEEDS_REVIEW`.
2. Content is **redacted** or replaced, while preserving:
   - Minimal structural metadata for audit (e.g. “entry redacted for safety”).
   - Original ledger record, if one exists, with a corrective attestation.

Redaction decisions should be:

- Logged with `reason`, `riskCategory`, and `approvedBy`.

---

## 7. Human-in-the-Loop Governance

While AI can propose and score entries, the following actions are **human-required**:

- Approving low-GI entries for promotion to `CANONICAL`.
- Overriding a high-GI entry due to ethical, legal, or cultural issues.
- Redacting content for safety or privacy.
- Changing GI thresholds or status semantics.

Recommended roles:

- **Custodians** – core maintainers of Mobius Systems.
- **Editors** – trusted contributors who can review and suggest changes.
- **Auditors** – third parties who verify integrity of processes and data.

---

## 8. Agent Usage Policy

Agents (LLMs, Sentinels, tools) must:

1. Prefer **CANONICAL** entries when available.
2. Treat **DRAFT** entries as hints, not truth.
3. Avoid using **NEEDS_REVIEW** entries as ground truth.
4. Always **disclose** when an answer is derived primarily from the Encyclopedia, when appropriate for humans.
5. When conflicting information exists:
   - Trigger new deliberation through Thought Broker.
   - Optionally propose an updated entry.

---

## 9. Civic Ledger Integration

For each canonical entry (optional but recommended):

- A Civic Ledger attestation may be recorded, containing:
  - `topicId`
  - `version`
  - Content hash (e.g. `sha256`)
  - GI score
  - Engine votes & confidences
  - Source list hash
  - Timestamp & jurisdiction (if applicable)

This enables:

- Public verification of content integrity over time.
- Detection of unauthorized tampering.
- Historical analysis of how knowledge evolved.

---

## 10. Evolution of the Charter

This Charter is:

- A **living document**, not static law.
- Subject to revision through Mobius governance processes.
- Versioned in Git with:
  - Change logs
  - Rationales for updates
  - References to incidents or lessons learned

Changes to:

- GI thresholds
- Status semantics
- Redaction rules
- Human-in-the-loop requirements

…must be explicitly documented and reviewed by Custodians.

---

> “An encyclopedia is not a monument to certainty, but a ledger of our best attempts at honest understanding.”  
> — Working Note, Mobius Systems
