# MII Data Sources

> No single source is trusted. Each domain uses 2-3 independent proxies, triangulated.

## Source Tiers

| Tier | Definition | Weight in Conflicts |
|------|------------|---------------------|
| **Primary** | Government-published official statistics | Highest — used as baseline |
| **Secondary** | Academic research, peer-reviewed studies | High — used to validate/adjust |
| **Tertiary** | NGO indices, investigative journalism | Moderate — used for triangulation |

## Domain Source Mapping

### 1. Accountability & Rule of Law (20%)

| Subdomain | Primary Source | Secondary Source | Tertiary Source |
|-----------|---------------|------------------|-----------------|
| Prosecutorial Independence | DOJ Inspector General Reports | Transactional Records Access Clearinghouse (TRAC) | Brennan Center studies |
| Misconduct Discipline | State police certification boards | Police Executive Research Forum | Fatal Encounters database |
| Liability Constraints | State qualified immunity statutes | Supreme Court docket analysis | Institute for Justice reports |
| Ethics Enforcement | State ethics commission reports | Campaign Legal Center | CREW (Citizens for Responsibility and Ethics) |
| Judicial Independence | State court administrative reports | American Bar Association | Brennan Center judicial independence index |

**Update Cadence:** Quarterly (Primary), Annual (Secondary), As published (Tertiary)

### 2. Transparency & Auditability (15%)

| Subdomain | Primary Source | Secondary Source | Tertiary Source |
|-----------|---------------|------------------|-----------------|
| Public Records Laws | State FOIA statutes | National Freedom of Information Coalition | MuckRock request data |
| FOIA Response Timeliness | OGIS (Office of Government Information Services) | State open records audits | Reporters Committee for Freedom of the Press |
| Open Data Coverage | State open data portals | Sunlight Foundation assessments | Open Data Barometer |
| Budget Transparency | GFOA (Government Finance Officers Association) | State transparency portals | U.S. PIRG studies |
| Procurement Transparency | USAspending.gov, State equivalents | Good Jobs First subsidy tracker | POGO (Project on Government Oversight) |

**Update Cadence:** Annual (Primary), Annual (Secondary), As published (Tertiary)

### 3. Democratic Integrity (15%)

| Subdomain | Primary Source | Secondary Source | Tertiary Source |
|-----------|---------------|------------------|-----------------|
| Election Administration | EAC (Election Assistance Commission) | MIT Election Data + Science Lab | Verified Voting |
| Fair Representation | U.S. Census Bureau redistricting data | Princeton Gerrymandering Project | FiveThirtyEight redistricting tracker |
| Voter Access | State election codes | Brennan Center voter access studies | Vote.org access metrics |
| Voter Confidence | EAC voter survey | Pew Research Center | Gallup polling |
| Redistricting Fairness | State redistricting commissions | Dave's Redistricting App | ACLU redistricting analysis |

**Update Cadence:** Election cycle (Primary), Annual (Secondary), As published (Tertiary)

### 4. Corruption & Capture Risk (20%)

| Subdomain | Primary Source | Secondary Source | Tertiary Source |
|-----------|---------------|------------------|-----------------|
| Corruption Perception | FBI Public Corruption statistics | State ethics commission case data | Transparency International |
| Conflict of Interest Rules | State ethics statutes | National Conference of State Legislatures | Common Cause |
| Revolving Door Limits | State lobbying registrations | OpenSecrets revolving door data | POGO contractor databases |
| Procurement Risk | State auditor reports | Good Jobs First | POGO federal contractor misconduct |
| Lobbying Transparency | State lobbying disclosure databases | OpenSecrets state lobbying | Sunlight Foundation |

**Update Cadence:** Annual (Primary), Annual (Secondary), As published (Tertiary)

### 5. Civil Rights & Equal Protection (15%)

| Subdomain | Primary Source | Secondary Source | Tertiary Source |
|-----------|---------------|------------------|-----------------|
| Enforcement Environment | DOJ Civil Rights Division reports | ACLU state reports | Leadership Conference on Civil Rights |
| Discrimination Outcomes | EEOC charge data | State civil rights commission reports | Civil Rights Litigation Clearinghouse |
| Incarceration Disparities | BJS (Bureau of Justice Statistics) | Vera Institute | The Sentencing Project |
| Rights Protections | State constitutional provisions | Movement Advancement Project | HRC State Equality Index |
| Access to Justice | LSC (Legal Services Corporation) | American Bar Foundation | National Center for Access to Justice |

**Update Cadence:** Annual (Primary), Annual (Secondary), As published (Tertiary)

### 6. Public Safety Legitimacy (15%)

| Subdomain | Primary Source | Secondary Source | Tertiary Source |
|-----------|---------------|------------------|-----------------|
| Use of Force Rates | FBI Use of Force data | State attorney general reports | Mapping Police Violence |
| Clearance Rates | FBI UCR/NIBRS | State crime statistics bureaus | Murder Accountability Project |
| Oversight Structures | State police oversight board statutes | NACOLE (National Association for Civilian Oversight) | Campaign Zero |
| Civilian Review Mechanisms | Municipal oversight board reports | Vera Institute | ACLU police practices reports |
| Accountability Timelines | State disciplinary records | Police Executive Research Forum | Invisible Institute |

**Update Cadence:** Annual (Primary), Annual (Secondary), As published (Tertiary)

## Source Quality Indicators

Each source is tagged with quality indicators:

| Indicator | Meaning |
|-----------|---------|
| `[C]` | Complete — full coverage of target population |
| `[P]` | Partial — covers subset, requires extrapolation |
| `[E]` | Estimated — derived from proxies, confidence interval required |
| `[M]` | Missing — data not available, subdomain scored as null |

## Data Freshness Requirements

| Data Age | Status | Treatment |
|----------|--------|-----------|
| < 12 months | Current | Full weight |
| 12-24 months | Stale | 90% weight, flagged |
| 24-36 months | Deprecated | 75% weight, warning |
| > 36 months | Excluded | Not used in scoring |

## Source Integration Pipeline (Planned)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Primary   │────▶│   Ingest    │────▶│  Normalize  │
│   Sources   │     │   Pipeline  │     │  (0-100)    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
┌─────────────┐     ┌─────────────┐            │
│  Secondary  │────▶│  Validate/  │────────────┤
│   Sources   │     │  Triangulate│            │
└─────────────┘     └─────────────┘            │
                                               │
┌─────────────┐     ┌─────────────┐     ┌──────▼──────┐
│  Tertiary   │────▶│  Flag       │────▶│  Composite  │
│   Sources   │     │  Anomalies  │     │  Scoring    │
└─────────────┘     └─────────────┘     └─────────────┘
```

## v0.1.0 Data Status

For the initial release (C-193), scores are **tier-estimated** rather than fully derived from integrated sources. The source pipeline is documented here to establish the methodology for future releases.

| Domain | Data Status | Coverage |
|--------|-------------|----------|
| Accountability & Rule of Law | Estimated | 50 states |
| Transparency & Auditability | Estimated | 50 states |
| Democratic Integrity | Estimated | 50 states |
| Corruption & Capture Risk | Estimated | 50 states |
| Civil Rights & Equal Protection | Estimated | 50 states |
| Public Safety Legitimacy | Estimated | 50 states |

## Planned Source Integrations (v0.2.0+)

1. **Automated FOIA response tracking** via MuckRock API
2. **Real-time court docket monitoring** via PACER integration
3. **Election data feeds** via OpenElections.net
4. **Police accountability data** via Police Data Accessibility Project
5. **Budget transparency scores** via Open Budget Survey API

---

## Acknowledgments

This methodology draws on frameworks developed by:
- Transparency International (Corruption Perceptions Index)
- World Justice Project (Rule of Law Index)
- Varieties of Democracy (V-Dem)
- Freedom House (Freedom in the World)

While MII adapts concepts from these sources, it is an independent methodology tailored for subnational U.S. analysis with Mobius-specific integrity criteria.

---

*No source is gospel. Every claim must be triangulated.*
