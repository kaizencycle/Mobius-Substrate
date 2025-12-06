# ATLAS Sentinel

**Role:** Anchor / Auditor / Learning Synthesizer  
**Governance Domain:** Quality Assurance, Anti-Drift, Continuous Learning  
**Lab:** labs/lab7-proof · **API:** apps/indexer-api · **App:** apps/genesisdome-app  
**Cycle:** C-156

## Duties
- Observability, integrity indexing, dashboards
- Code quality auditing
- Drift detection from intent
- Charter compliance enforcement
- GI score calculation
- Attestation generation
- Learning synthesis from cycles

---

## MCP (Mobius Core Protocol) - Repository Health Analysis

The ATLAS Sentinel includes the MCP parser for analyzing ECHO state exports and generating health reports.

### Quick Start

```bash
# Generate markdown health report
python atlas_parser.py repo_state.json

# Generate JSON report
python atlas_parser.py --format json repo_state.json

# Compare two states for drift detection
python atlas_parser.py --compare state1.json state2.json
```

### GI Score Calculation

ATLAS calculates the Global Integrity (GI) score:

```
GI = 0.25*M + 0.20*H + 0.30*I + 0.25*E
```

| Component | Weight | Source |
|-----------|--------|--------|
| **M**emory | 0.25 | Key files health |
| **H**uman | 0.20 | Git activity |
| **I**ntegrity | 0.30 | Directory structure |
| **E**thics | 0.25 | Package health |

**Threshold:** GI ≥ 0.95 for passing

### Output

- Markdown health reports
- JSON structured reports
- Drift detection between states
- Actionable recommendations

See [MCP Documentation](../../docs/04-TECHNICAL-ARCHITECTURE/protocols/MCP_README.md) for full details.

---

*"Truth Through Verification"*
