# MII Methodology Specification

> Integrity is not purity. It is causality.

## Overview

This document specifies the normalization, aggregation, and scoring methodology for the Mobius Integrity Index (MII). The methodology is designed to be **reproducible**, **transparent**, and **resistant to single-source capture**.

## 1. Data Model

### 1.1 Entity Hierarchy

```
Nation-State (e.g., United States)
├── Federal Entity
└── Subnational Entities
    ├── States (50)
    ├── Territories (5+)
    └── Districts (1)
```

### 1.2 Domain Structure

MII uses a 6-domain weighted model:

| Domain | Key | Weight |
|--------|-----|--------|
| Accountability & Rule of Law | `accountability_rule_of_law` | 0.20 |
| Transparency & Auditability | `transparency_auditability` | 0.15 |
| Democratic Integrity | `democratic_integrity` | 0.15 |
| Corruption & Capture Risk | `corruption_capture_risk` | 0.20 |
| Civil Rights & Equal Protection | `civil_rights_equal_protection` | 0.15 |
| Public Safety Legitimacy | `public_safety_legitimacy` | 0.15 |

**Weight Constraint:** Σ weights = 1.0

### 1.3 Subdomain Structure

Each domain contains 4-6 subdomains. Subdomain scores are averaged (equal weight) within domains unless otherwise specified.

## 2. Normalization Pipeline

### 2.1 Raw Data Ingestion

```
raw_metric → polarity_check → winsorize → percentile_rank → scale
```

### 2.2 Polarity Alignment

Some metrics are positive-coded (higher = better integrity), others are negative-coded (higher = worse integrity).

| Polarity | Example | Treatment |
|----------|---------|-----------|
| Positive | FOIA response rate | Use as-is |
| Negative | Corruption convictions per capita | Invert: `100 - value` |

Polarity is specified in the source documentation for each metric.

### 2.3 Winsorization

To prevent outliers from dominating scores:

```
winsorized_value = clip(value, percentile_5, percentile_95)
```

- Values below the 5th percentile are set to the 5th percentile value
- Values above the 95th percentile are set to the 95th percentile value

This is applied **per metric** across the comparison set (e.g., 50 states).

### 2.4 Percentile Ranking

After winsorization, values are converted to percentile ranks:

```
percentile_rank = (rank - 1) / (n - 1) × 100
```

Where:
- `rank` = ordinal position (1 = lowest)
- `n` = number of entities in comparison set

### 2.5 Linear Scaling

Final scores are scaled to [0, 100]:

```
scaled_score = percentile_rank  # Already in 0-100 range after step 2.4
```

## 3. Aggregation Formulas

### 3.1 Subdomain → Domain Aggregation

```
domain_score = (1/k) × Σ subdomain_scores
```

Where `k` = number of subdomains with non-null data.

Missing subdomains are excluded from the average, not treated as zero.

### 3.2 Domain → State MII Aggregation

```
state_mii = Σ (domain_score × domain_weight)
          = 0.20 × accountability_rule_of_law
          + 0.15 × transparency_auditability
          + 0.15 × democratic_integrity
          + 0.20 × corruption_capture_risk
          + 0.15 × civil_rights_equal_protection
          + 0.15 × public_safety_legitimacy
```

### 3.3 State → National MII Aggregation

```
national_mii = (0.85 × state_layer_avg) + (0.15 × federal_mii)
```

Where:

```
state_layer_avg = Σ (state_mii × state_population) / Σ state_population
```

The federal layer is scored separately using federal-specific metrics (e.g., FOIA performance, IG independence, prosecutorial interference risk).

### 3.4 Tier Assignment

| Score Range | Tier |
|-------------|------|
| 95.00 - 100.00 | A+ |
| 90.00 - 94.99 | A |
| 85.00 - 89.99 | B+ |
| 80.00 - 84.99 | B |
| 75.00 - 79.99 | C+ |
| 70.00 - 74.99 | C |
| 65.00 - 69.99 | D+ |
| 60.00 - 64.99 | D |
| 50.00 - 59.99 | E |
| 0.00 - 49.99 | F |

## 4. Failure Point Markers

In addition to numeric scores, categorical markers are assigned based on threshold conditions:

### 4.1 Marker Definitions

| Marker | Condition |
|--------|-----------|
| `!` (Capture Risk) | `corruption_capture_risk < 60` OR `patronage_density > 0.7` |
| `?` (Opacity) | `transparency_auditability < 65` OR `foia_backlog > 180 days` |
| `*` (Procedural Chaos) | `accountability_rule_of_law < 70` AND `accountability_timelines > 24 months` |
| `↑` (Improving) | `Δscore > +3.0` over 4 cycles |
| `↓` (Worsening) | `Δscore < -3.0` over 4 cycles |
| `+` (Stable) | `|Δscore| ≤ 3.0` over 4 cycles |

### 4.2 Marker Application

Markers are not mutually exclusive. An entity may have multiple markers (e.g., `! ?` for both capture risk and opacity).

## 5. Confidence and Uncertainty

### 5.1 Data Quality Flags

Each score carries a data quality indicator:

| Flag | Meaning | Treatment |
|------|---------|-----------|
| `complete` | Full data coverage | Full confidence |
| `partial` | >50% coverage | Note in output |
| `estimated` | <50% coverage, derived from proxies | Wide confidence interval |
| `missing` | No data | Excluded from aggregation |

### 5.2 Confidence Intervals (Planned)

Future versions will include confidence intervals:

```
score ± margin_of_error (95% CI)
```

For v0.1.0, scores are marked as `provisional` without formal confidence intervals.

## 6. Reproducibility Requirements

### 6.1 Audit Trail

Every published score must be traceable to:
1. Source data (with version/timestamp)
2. Normalization parameters (winsorization bounds, etc.)
3. Aggregation weights (as in `weights.json`)
4. Methodology version

### 6.2 Code Availability

Scoring scripts will be published in:
```
mii/scripts/
├── normalize.py
├── aggregate.py
├── score.py
└── validate.py
```

(Planned for v0.2.0)

### 6.3 Version Control

All methodology changes are logged in `CHANGELOG.md` with:
- Semantic version
- Cycle identifier
- Description of changes
- Impact assessment

## 7. Limitations and Caveats

### 7.1 v0.1.0 Limitations

1. **Scores are illustrative** — Derived from tier estimates, not fully integrated source data
2. **No confidence intervals** — Uncertainty not formally quantified
3. **Equal subdomain weighting** — May not reflect true relative importance
4. **Annual snapshot only** — No real-time or quarterly updates

### 7.2 Methodological Limitations

1. **Comparison set sensitivity** — Percentile ranks depend on the comparison set (50 states)
2. **Temporal lag** — Source data may be 12-24 months old
3. **Missing data bias** — Entities with incomplete data may score artificially high or low
4. **Cultural context** — Cross-national comparisons require normalization adjustments

### 7.3 What MII Does Not Measure

- Policy preferences or ideological positions
- Economic performance or GDP
- Quality of life or happiness
- Military strength or geopolitical power
- Historical grievances or cultural factors

MII measures **structural coherence** — whether power correlates with accountability.

## 8. Validation Protocol

### 8.1 Internal Validation

1. **Weight sensitivity analysis** — Vary weights ±5% and measure score changes
2. **Outlier detection** — Flag entities with scores >2σ from mean
3. **Temporal consistency** — Compare with previous cycles for anomalies

### 8.2 External Validation

1. **Expert review** — Subject matter experts validate domain scores
2. **Cross-index correlation** — Compare with established indices (WJP, TI, V-Dem)
3. **Predictive validity** — Track correlation with real-world integrity events

### 8.3 Peer Review (Planned)

v1.0.0 will include peer review of:
- Weight rationales
- Source selection
- Normalization choices
- Aggregation methodology

---

## Appendix A: Mathematical Notation

| Symbol | Meaning |
|--------|---------|
| `MII_i` | MII score for entity i |
| `D_j` | Domain j score |
| `w_j` | Weight for domain j |
| `S_k` | Subdomain k score |
| `P_i` | Population of entity i |
| `n` | Number of entities in comparison set |

## Appendix B: Worked Example

### Example: California State MII

**Domain Scores (illustrative):**
- Accountability & Rule of Law: 72
- Transparency & Auditability: 78
- Democratic Integrity: 80
- Corruption & Capture Risk: 68
- Civil Rights & Equal Protection: 75
- Public Safety Legitimacy: 65

**Calculation:**
```
MII_CA = (0.20 × 72) + (0.15 × 78) + (0.15 × 80) 
       + (0.20 × 68) + (0.15 × 75) + (0.15 × 65)
       = 14.4 + 11.7 + 12.0 + 13.6 + 11.25 + 9.75
       = 72.7
```

**Tier Assignment:** C (70-74.99)

**Markers:** `?` (transparency below threshold)

---

*Every score must be derivable. Every derivation must be documented.*
