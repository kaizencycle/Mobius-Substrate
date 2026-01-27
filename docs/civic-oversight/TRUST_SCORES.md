# Citizen Trust Scores

**Anti-brigading mechanism for civic oversight.**

This document defines how Mobius prevents mob behavior while enabling legitimate civic participation.

---

## Purpose

The Citizen Trust Score system exists to answer one question:

> "How do we enable citizen oversight without enabling harassment, brigading, or mob justice?"

Trust Scores are:
- A behavioral reputation, not an identity score
- Tied to actions inside Mobius, not outside activity
- Transparent, appealable, and decay-based

---

## What Trust Scores ARE NOT

| NOT This | Because |
|----------|---------|
| Social credit | No ideological ranking |
| Permanent record | Scores decay over time |
| Public shaming | Trust levels are not broadcast |
| Identity verification | No personal information required |
| Pay-to-play | Cannot be purchased |

---

## Trust Levels

### T0 — Observer

| Attribute | Value |
|-----------|-------|
| **Role** | Observer |
| **Capabilities** | Read dashboards, view public reports |
| **Requirements** | None (all citizens start here) |
| **Restrictions** | Cannot flag concerns or submit reports |

### T1 — Citizen Auditor

| Attribute | Value |
|-----------|-------|
| **Role** | Auditor |
| **Capabilities** | Flag concerns, submit evidence, read annotations |
| **Requirements** | Account age > 7 days, verified email |
| **Restrictions** | Limited to 3 flags per week |

### T2 — Verified Auditor

| Attribute | Value |
|-----------|-------|
| **Role** | Verified Auditor |
| **Capabilities** | Pattern reviews, priority queue, write annotations |
| **Requirements** | 5+ validated reports, trust score ≥ 0.75 |
| **Restrictions** | Limited to 10 flags per week |

### T3 — Citizen Steward

| Attribute | Value |
|-----------|-------|
| **Role** | Steward |
| **Capabilities** | Governance participation, dispute mediation, policy input |
| **Requirements** | 30+ validated contributions, trust score ≥ 0.90 |
| **Restrictions** | Subject to council review |

---

## How Trust Is Gained

Trust grows slowly through consistent, quality participation.

### Positive Actions

| Action | Trust Impact | Notes |
|--------|--------------|-------|
| Report validated by review | +0.05 | Must be confirmed as legitimate |
| Pattern analysis cited by council | +0.10 | High-quality analytical work |
| Historical annotation adopted | +0.03 | Contributes to collective memory |
| Governance participation | +0.02 | Active, constructive engagement |
| Civil conduct (6 months) | +0.05 | No warnings, sustained participation |

### Trust Ceiling

Maximum trust score: **1.00**

No one starts with maximum trust. It must be earned over time.

---

## How Trust Is Lost

Trust decays faster than it grows. This is intentional.

### Negative Actions

| Action | Trust Impact | Notes |
|--------|--------------|-------|
| Frivolous report (rejected) | -0.05 | Report deemed unfounded |
| Repeated bad-faith reports | -0.15 | Pattern of low-quality flags |
| Personal targeting | -0.25 | Flagging individuals, not systems |
| Harassment | -0.50 | Immediate review, possible ban |
| False evidence | -0.75 | Severe violation of trust |
| Coordinated brigading | -1.00 | Permanent removal |

### Natural Decay

Trust scores decay by **0.01 per month** of inactivity.

This ensures:
- Active participants maintain trust
- Abandoned accounts don't accumulate authority
- Return requires re-engagement

---

## Trust Score Calculation

```
Trust Score = Base + Earned - Penalties - Decay

Where:
- Base = 0.30 (all new accounts)
- Earned = sum of positive actions
- Penalties = sum of negative actions
- Decay = 0.01 × months_inactive
```

### Example

```
New user after 6 months:
- Base: 0.30
- Validated reports (3): +0.15
- Cited analysis (1): +0.10
- Rejected report (1): -0.05
- Decay (2 months inactive): -0.02

Trust Score = 0.30 + 0.15 + 0.10 - 0.05 - 0.02 = 0.48
```

---

## Transparency

### What Users Can See

| Information | Visible |
|-------------|---------|
| Their own trust score | Yes |
| Their own history | Yes |
| Their trust level (T0-T3) | Yes |
| Others' trust scores | No |
| Others' histories | No |
| Aggregate statistics | Yes |

### What is Public

- Number of T1/T2/T3 participants (aggregate)
- Total validated reports (aggregate)
- System health metrics (aggregate)

---

## Appeals Process

### Step 1: Request Review

Citizens can request review of trust penalties within 14 days.

### Step 2: Automated Analysis

System checks:
- Penalty reasoning
- Pattern consistency
- Edge case detection

### Step 3: Human Review (if needed)

For penalties > 0.25, human steward reviews:
- Original flagged content
- Context and history
- Mitigating factors

### Step 4: Decision

| Outcome | Result |
|---------|--------|
| Penalty upheld | No change |
| Penalty reduced | Partial restoration |
| Penalty removed | Full restoration + notation |

---

## Anti-Gaming Measures

### Rate Limits

| Level | Reports per Week | Rationale |
|-------|------------------|-----------|
| T0 | 0 | Observation only |
| T1 | 3 | Learn the system |
| T2 | 10 | Proven track record |
| T3 | 25 | High trust, high responsibility |

### Velocity Checks

- Rapid-fire reports trigger review
- Coordinated timing detected
- Similar content flagged

### Pattern Detection

- Same-target flagging across accounts
- Suspicious account creation timing
- Cross-platform coordination signals

---

## Recovery

Trust can be rebuilt after penalties.

### Recovery Path

| Starting Trust | Recovery Time | Requirements |
|----------------|---------------|--------------|
| 0.50 - 0.75 | 1 month | Consistent positive behavior |
| 0.25 - 0.50 | 3 months | Verified quality contributions |
| 0.00 - 0.25 | 6 months | Council review required |
| < 0.00 | 12 months | Steward sponsorship required |

### Permanent Bans

Reserved for:
- Coordinated harassment campaigns
- Falsified evidence
- Repeated severe violations
- Legal violations

---

## The Social Contract

By participating in oversight:

1. **I understand** this is for system accountability, not personal targeting
2. **I commit** to evidence-based concerns, not speculation
3. **I accept** that my actions are recorded
4. **I acknowledge** that trust is earned, not given
5. **I agree** to act in good faith

---

## Why This Matters

Without trust scores, citizen oversight becomes:
- Mob justice
- Harassment vector
- Misinformation amplifier
- Tool for bad actors

With trust scores, citizen oversight becomes:
- Accountable participation
- Quality-filtered signal
- Sustainable civic engagement
- Protection against abuse

---

## Related Documents

- [README.md](./README.md) - System overview
- [MICROCOPY.md](./MICROCOPY.md) - Dashboard language
- [MIC_INCENTIVES.md](./MIC_INCENTIVES.md) - Contribution rewards

---

*"Trust reflects how reliably your past actions contributed to understanding—not agreement."*
