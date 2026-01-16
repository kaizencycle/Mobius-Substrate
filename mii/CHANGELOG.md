# MII Changelog

All notable changes to the Mobius Integrity Index framework will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-16 (Cycle C-193)

### Added

- **Framework Foundation**
  - Initial 6-domain weighted composite model
  - Score interpretation tiers (A+ through F)
  - Failure point marker system (`!`, `?`, `*`, `↑`, `↓`, `+`)

- **Data Schema**
  - `schema.json` — JSON Schema for state/entity records
  - Support for 50 US states + federal overlay
  - Extensible for international jurisdictions

- **Methodology Documentation**
  - `method.md` — Normalization and aggregation specification
  - Percentile ranking across jurisdictions
  - Winsorization at 5th/95th percentiles
  - Linear scaling to 0-100

- **Domain Weights**
  - `weights.json` — Domain weight configuration
  - Accountability & Rule of Law: 20%
  - Transparency & Auditability: 15%
  - Democratic Integrity: 15%
  - Corruption & Capture Risk: 20%
  - Civil Rights & Equal Protection: 15%
  - Public Safety Legitimacy: 15%

- **Data Sources**
  - `sources.md` — Documented data source inventory
  - Primary, secondary, and tertiary source tiers
  - Update cadence specifications

- **Initial Pulse**
  - `pulses/C-193/Integrity_Pulse_US_C-193.md` — Full unified pulse document
  - `pulses/C-193/us_states_mii_C-193.csv` — 50-state score table
  - National MII: 83.9 (with federal overlay)
  - State layer average: 86.0

- **Output Snapshot**
  - `output/us_mii_snapshot.json` — Machine-readable national aggregate

### Caveats (v0.1.0)

This is a **provisional release** establishing the framework:

1. **Scores are illustrative** — They demonstrate the methodology using estimated tier assignments, not fully integrated source data
2. **Data pipeline pending** — Automated source ingestion not yet implemented
3. **Peer review needed** — Weight rationales should be externally validated
4. **Coverage gaps exist** — Some subdomains lack complete 50-state data

### What This Release Is Not

- Not a partisan judgment
- Not a prediction of collapse
- Not a substitute for primary sources
- Not immutable truth

### What This Release Is

- A reproducible diagnostic framework
- A baseline for longitudinal tracking
- A foundation for institutional memory
- A tool for measuring drift

---

## Planned for Future Releases

### [0.2.0] - Planned

- Automated data pipeline integration
- Historical trend analysis (C-180 through C-193)
- Confidence intervals on scores
- Interactive visualization dashboard

### [0.3.0] - Planned

- International jurisdiction support (pilot: UK, Canada, Australia)
- Cross-national normalization methodology
- Regional bloc aggregation (EU, ASEAN, etc.)

### [1.0.0] - Planned

- Full source data integration
- Peer-reviewed weight validation
- API endpoint for programmatic access
- Real-time update cadence

---

## Version Numbering

- **Major** (X.0.0): Breaking schema changes, methodology revisions
- **Minor** (0.X.0): New features, additional jurisdictions, data sources
- **Patch** (0.0.X): Bug fixes, documentation updates, score corrections

---

*Memory with teeth.*
