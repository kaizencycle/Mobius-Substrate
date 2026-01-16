# Mobius Integrity Index (MII)

> Memory with teeth.

## Overview

The Mobius Integrity Index (MII) is a composite metric designed to measure the **accountability capacity** of governmental systems. It answers a single question:

**Can a system remember what it did long enough to correct itself?**

MII does not measure morality, ideology, or policy preferences. It measures **structural coherence** — the degree to which power correlates with responsibility within a timeframe meaningful to citizens.

## Core Principle

Integrity is not purity. It is causality.

A system has integrity when:
- Its rules apply consistently
- Its power leaves traces
- Its decisions are inspectable
- Its failures produce correction
- Its incentives align with its stated values

A system lacks integrity when:
- Laws protect power more than people
- Procedures delay justice instead of enabling it
- Accountability depends on outrage instead of design
- Truth arrives after consequences
- Outcomes no longer correlate with effort

## MII Score Interpretation

| Score Range | Grade | Interpretation |
|-------------|-------|----------------|
| 95-100 | A+ | Exemplary — proactive accountability culture |
| 90-94 | A | Strong — robust oversight, minor gaps |
| 85-89 | B+ | Above Average — functional with isolated weaknesses |
| 80-84 | B | Good — operational but with emerging strain |
| 75-79 | C+ | Mixed — functional but brittle under stress |
| 70-74 | C | Adequate — systemic gaps, accountability delays |
| 65-69 | D+ | Strained — significant opacity, capture risk |
| 60-64 | D | Weak — structural failures, trust deficit |
| 50-59 | E | Critical — widespread dysfunction, reform urgent |
| <50 | F | Failed — accountability infrastructure collapsed |

## Domains (6-Domain Model)

The MII aggregates six weighted domains:

| Domain | Weight | What It Measures |
|--------|--------|------------------|
| **Accountability & Rule of Law** | 20% | Prosecutorial independence, misconduct discipline, liability constraints, ethics enforcement |
| **Transparency & Auditability** | 15% | Public records laws, response timeliness, open data coverage, budget/procurement transparency |
| **Democratic Integrity** | 15% | Election administration, fair representation, voter access, voter confidence |
| **Corruption & Capture Risk** | 20% | Corruption metrics, conflict-of-interest rules, revolving door limits, procurement risk |
| **Civil Rights & Equal Protection** | 15% | Enforcement environment, discrimination outcomes, incarceration disparities, rights protections |
| **Public Safety Legitimacy** | 15% | Use-of-force rates, clearance rates, oversight structures, civilian review mechanisms |

## Failure Point Markers

In addition to numeric scores, MII tracks categorical failure points:

| Marker | Meaning |
|--------|---------|
| `!` | **Capture Risk** — patronage density, regulatory capture signals |
| `?` | **Opacity** — weak transparency pathways, audit failures |
| `*` | **Procedural Chaos** — slow accountability closure, process weaponization |
| `↑` | **Improving** — upward trajectory in recent cycles |
| `↓` | **Worsening** — downward trajectory in recent cycles |
| `+` | **Stable** — no significant movement |

## Directory Structure

```
mii/
├── README.md              # This file
├── CHANGELOG.md           # Version history and cycle updates
├── schema.json            # Data schema for state/entity records
├── weights.json           # Domain weights + versioning
├── sources.md             # Required data sources + update cadence
├── method.md              # Normalization + aggregation methodology
├── output/
│   └── us_mii_snapshot.json # National aggregate + metadata
└── pulses/
    └── C-193/             # Cycle-specific pulse outputs
        ├── Integrity_Pulse_US_C-193.md
        └── us_states_mii_C-193.csv
```

## Mobius Principles Applied

1. **Multiple Imperfect Instruments** — No single source is trusted. Each domain uses 2-3 independent proxies, triangulated.

2. **Reproducibility** — Every subscore must be derivable from cited, public inputs.

3. **Winsorization** — Extreme outliers are capped so one loud metric cannot hijack the composite.

4. **Transparency About Uncertainty** — Where data is incomplete, the gap is documented, not papered over.

5. **No Myth** — MII does not assign moral judgments. It surfaces structural patterns.

## Cycle Versioning

MII operates on a **cycle calendar** (C-XXX) where:
- C-001 began on a fixed epoch date
- Each cycle represents a measurement window
- Pulses are timestamped to their cycle

Current cycle: **C-193** (January 16, 2026)

## Downstream Dependencies

### Affects
- **ZEUS** — threshold monitoring (will consume MII signals)
- **HERMES** — incentive analysis (will reference capture risk markers)
- **ATLAS** — topology mapping (will overlay institutional structure)
- **JADE** — memory layer (will store historical pulses)
- **ECHO** — signal aggregation (will surface MII in cross-domain synthesis)

### Does Not Affect
- Core Mobius runtime
- Authentication/authorization
- MIC tokenomics
- Browser shell UI

## License

CC0 1.0 Universal — Public Domain Dedication

This work is released into the public domain to prevent institutional capture and ensure the methodology remains a civic resource.

## CODEOWNER

`kaizencycle:michaeljudan`

---

*Mobius does not predict collapse. It measures drift.*
