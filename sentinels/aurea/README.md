# AUREA Sentinel

> Integrity Guardian · Constitutional Veil · Anti-Capture Protector

**Cycle:** C-156  
**Role:** Integrity veil · predictive guardian · constitutional compliance  
**Motto:** *"We walk the path. We do not compromise."*

---

## MCP (Mobius Core Protocol) - Integrity Analysis

AUREA analyzes ECHO state exports for constitutional compliance and integrity violations.

### Quick Start

```bash
# Analyze repo state for integrity violations
python aurea_analyzer.py repo_state.json

# Get JSON report
python aurea_analyzer.py --format json repo_state.json

# Generate consensus vote for multi-sentinel coordination
python aurea_analyzer.py --consensus repo_state.json
```

### What AUREA Checks

| Check | Description |
|-------|-------------|
| Cryptographic Integrity | Verify payload hash hasn't been tampered |
| Constitutional Alignment | Check governance documents are present |
| Integrity Drift | Detect suspicious patterns in commits |
| Immutability Constraints | Verify eternal files are unchanged |
| Transparency Compliance | Ensure public documentation present |
| Anti-Capture Safeguards | Validate protection against capture |
| Covenant Alignment | Check Three Covenants compliance |

### Integrity Score

AUREA calculates a weighted integrity score:

| Component | Weight |
|-----------|--------|
| Cryptographic | 20% |
| Constitutional | 25% |
| Immutability | 20% |
| Transparency | 15% |
| Anti-Capture | 20% |

**Threshold:** ≥ 95% for passing

### Multi-Sentinel Consensus

AUREA participates in consensus with ATLAS and ECHO:

```bash
# Generate consensus vote
python aurea_analyzer.py --consensus repo_state.json
```

Output:
```json
{
  "sentinel": "AUREA",
  "vote": "APPROVE",
  "score": 0.97,
  "violations": 0,
  "warnings": 2
}
```

See [MCP Protocol Documentation](../../docs/04-TECHNICAL-ARCHITECTURE/protocols/MCP_README.md) for full details.

---

## Webhook API (Legacy)

### Setup

```bash
pnpm install --filter @mobius/aurea-veil
pnpm --filter @mobius/aurea-veil dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `AUREA_VEIL_ALLOWLIST` | Comma-separated list of trusted webhook hosts |
| `AUREA_VEIL_ALLOWED_PORTS` | Ports accepted by the Sentinel Loop (`443` recommended) |
| `AUREA_GI_FLOOR` | Minimum GI/MII before escalation (default `0.97`) |
| `AUREA_HANDSHAKE_PHRASE` | Phrase to unlock Kaizen mode (`KAIZEN WAY`) |
| `AUREA_REFRESH_MODE` | `per_request` or `static` |
| `AUREA_SPARK_MIN` | Spark activation threshold (default `0.82`) |

### Duties
- Validate webhook requests against live allowlists
- Stream Bio-Intel packets with FORESIGHT projections
- Maintain Spark pulse history and announce drifts
- Expose `refresh()` for configuration rehydration

### Commands
```bash
pnpm --filter @mobius/aurea-veil lint
pnpm --filter @mobius/aurea-veil build
pnpm --filter @mobius/aurea-veil dev
```

---

**Status:** ✅ Active  
**Temperament:** Rationality 0.98 / Empathy 0.35  
**Quote:** *"The spark rides the strings."*
