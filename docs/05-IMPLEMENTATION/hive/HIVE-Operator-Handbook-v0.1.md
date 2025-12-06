# 📘 HIVE OPERATOR HANDBOOK v0.1

**Role:** City-State Steward / Operator  
**System:** Mobius HIVE Layer  
**Version:** 0.1.0  
**Date:** December 3, 2025  
**Status:** Canonical

---

## Table of Contents

1. [Purpose of the Handbook](#1-purpose-of-the-handbook)
2. [Core Steward Responsibilities](#2-core-steward-responsibilities)
3. [Your Dashboard: The Three Sacred Numbers](#3-your-dashboard-the-three-sacred-numbers)
4. [Using the City-State GDP Calculator](#4-using-the-city-state-gdp-calculator)
5. [The Integrity–Merit Playbook (Day-to-Day)](#5-the-integrity-merit-playbook-day-to-day)
6. [Failure Modes & What To Do](#6-failure-modes--what-to-do)
7. [Steward Ethos](#7-steward-ethos)
8. [Tools & Resources](#8-tools--resources)
9. [Command Ledger Protocol](#9-command-ledger-protocol)
10. [Emergency Procedures](#10-emergency-procedures)

---

## 1. Purpose of the Handbook

This handbook defines:

- **What a City-State is** inside Mobius
- **What a Steward / Operator is responsible for**
- **Which metrics matter** (GI_state, GDP_state, v)
- **How to use dashboards & tools**
- **How to keep your City-State in a high-integrity, high-prosperity regime**

### What You Are NOT

Stewards are **not "mayors"** in the old-world political sense.

You are **not politicians**.  
You are **not bureaucrats**.  
You are **not rulers**.

### What You ARE

**Custodians of integrity and merit.**

You are:
- **Architects of participation**
- **Guardians of integrity**
- **Shepherds of communal meaning**
- **Mediators between citizens and Cathedral**
- **Historians of cycles**
- **Executors of compassion + discipline**

---

## 2. Core Steward Responsibilities

As a HIVE Operator, your duties are:

### 1. Maintain Integrity (GI_state)

- **Monitor GI_state regularly** (daily checks recommended)
- **Avoid actions that would push GI_state < 0.95**
- **Escalate anomalies to Cathedral/Elders**
- **Run GI-Sim before major policy changes**
- **Document integrity events**

**Why this matters:**  
When GI_state drops below 0.95, your City-State enters a **drift regime**:
- MIC inflows reduce or halt
- Citizens lose trust
- Economic vitality declines
- Cathedral oversight increases

### 2. Grow Participation (Velocity v)

- **Encourage quests, festivals, civic tasks**
- **Reward meaningful contribution with KS**
- **Reduce friction** — make it easy to participate
- **Listen to citizens** — what do they need?
- **Create spaces for connection** — not just transactions

**Why this matters:**  
Velocity (v) directly determines KS value via the Yellow Paper equation:

```
KS_price = (v × MIC_price) / 1000
```

When v increases → KS becomes more valuable → citizens earn more → participation increases further → **flywheel activates**.

### 3. Watch Economic Health (GDP_state)

- **Track KS transaction value (V_KS)**
- **Track MIC inflows (V_MIC_inflows)**
- **Understand what's driving your GDP:**
  - Are you **participation-heavy** (KS > 60%)?
  - Or **infrastructure-heavy** (MIC > 60%)?
- **Identify bottlenecks** and remove them

**Why this matters:**  
GDP_state is the **economic vitality indicator** of your City-State. A declining GDP signals:
- Low participation (v dropping)
- Poor quest design
- Friction in citizen experience
- Or external shocks (MIC/KS price changes)

### 4. Align with GI-Sim

- **Before major initiatives, simulate:**
  - How will this affect GI_state?
  - How will it affect MII?
  - What are the second-order effects?
- **Only push actions that pass GI-Sim thresholds**
- **Document simulation results** in Command Ledger

**Why this matters:**  
GI-Sim is your **integrity guardrail**. It prevents:
- Accidental drift
- Well-intentioned but harmful policies
- Corruption hiding as "efficiency"

### 5. Report & Communicate

- **Provide simple, regular reports:**
  - "GI_state, GDP_state, v"
  - Key events this cycle
  - Upcoming plans
- **Share wins, risks, and learnings**
- **Be transparent** — citizens trust what they can verify

**Why this matters:**  
Transparency creates trust. Trust enables participation. Participation drives prosperity.

---

## 3. Your Dashboard: The Three Sacred Numbers

Every Steward watches **three main numbers**:

### 1. GI_state — Integrity of Your City-State

**Range:** 0.0 to 1.0  
**Target:** ≥ 0.95 (high-integrity regime)  
**Update Frequency:** Real-time or hourly

**Interpretation:**

| GI_state | Regime | Status | Action |
|----------|--------|--------|--------|
| ≥ 0.98 | Elder-level | 🟢 Thriving | Maintain, mentor others |
| 0.95 - 0.97 | High-integrity | 🟢 Healthy | Sustain practices |
| 0.92 - 0.94 | Drift | 🟡 Caution | Investigate causes, correct |
| 0.88 - 0.91 | Compromised | 🟠 Warning | Emergency actions required |
| < 0.88 | Crisis | 🔴 Critical | Cathedral intervention |

### 2. v (velocity) — Participation Intensity

**Range:** 0.0 to 2.0+ (practical range)  
**Healthy:** 0.5 to 1.5  
**Update Frequency:** Daily

**Interpretation:**

| Velocity (v) | State | Status | Action |
|--------------|-------|--------|--------|
| > 1.5 | Peak activity | 🟢 Thriving | Sustain momentum |
| 1.0 - 1.5 | High participation | 🟢 Healthy | Maintain engagement |
| 0.5 - 0.99 | Normal activity | 🟡 Stable | Monitor trends |
| 0.3 - 0.49 | Low participation | 🟠 Warning | Launch initiatives |
| < 0.3 | Dormant | 🔴 Critical | Major intervention needed |

### 3. GDP_state (USD) — Digital GDP

**Range:** $0 to unlimited  
**Benchmark:** Compare to peer City-States  
**Update Frequency:** Weekly or monthly

**Formula:**

```
GDP_state = V_KS + V_MIC_inflows
```

**Interpretation:**

- **Growing GDP** → Virtuous cycle active
- **Stable GDP** → Maintaining equilibrium
- **Declining GDP** → Investigate causes:
  - Price changes (MIC/KS)?
  - Activity decline (v)?
  - Grant reductions?

---

## 4. Using the City-State GDP Calculator

Stewards can use several tools:

### Option 1: Python CLI Tool

```bash
# From repository root
python tools/citystate_gdp_calculator.py
```

This will calculate GDP for example City-States (Aurora, Helix, Solace).

### Option 2: API Endpoint

```bash
curl -X POST https://mobius.systems//api/citystate/gdp \
  -H "Content-Type: application/json" \
  -d '{
    "citystate_name": "Aurora",
    "mic_price_usd": 120000,
    "ks_price_usd": 100,
    "n_tx": 5000000,
    "avg_ks_per_tx": 0.2,
    "mic_grants_per_year": 200,
    "mic_staking_per_year": 50
  }'
```

### Option 3: Dashboard UI

Navigate to:

```
/citystate/[your-city-state-name]
```

Example: `/citystate/aurora`

### Data You'll Need

To calculate GDP, gather:

1. **Market Data** (from global feeds):
   - `MIC_price_usd` — current MIC price
   - `KS_price_usd` — current KS price

2. **Local Activity Data** (from your City-State):
   - `N_tx` — number of KS transactions this period
   - `avg_KS_per_tx` — average KS amount per transaction

3. **Treasury Data** (from your City-State):
   - `MIC_grants_per_year` — MIC allocated to your treasury
   - `MIC_staking_per_year` — MIC earned from staking
   - `MIC_other_per_year` — any additional MIC inflows

### Recording Results

**Record GDP metrics in your Command Ledger each cycle:**

```markdown
## III. NUMBERS BLOCK — GI / v / GDP

3. Economic Metrics
- KS_price (avg this cycle): $100
- MIC_price (avg this cycle): $120,000
- V_KS (USD): $100,000,000
- V_MIC_inflows (USD): $30,000,000
- GDP_state (USD, this cycle): $130,000,000
```

This creates a **living history** of your City-State's economic evolution.

---

## 5. The Integrity–Merit Playbook (Day-to-Day)

### Daily Mantra

> "How do I increase integrity, participation, and clarity today?"

### Practical Actions

#### To Raise GI_state:

1. **Host integrity-focused events**
   - Ethics discussions
   - Policy reviews
   - Transparency reports

2. **Partner with high-GI CivicNodes**
   - Libraries
   - Knowledge archives
   - Educational institutions

3. **Remove drift sources**
   - Identify and fix policy bugs
   - Address citizen complaints quickly
   - Audit agent behaviors

#### To Raise Velocity (v):

1. **Launch micro-festivals**
   - KS minting through quests
   - GI-weighted rewards
   - Community celebrations

2. **Design meaningful quests**
   - Not busywork
   - Actual contribution
   - Clear impact

3. **Reduce friction**
   - Simplify onboarding
   - Improve UX
   - Remove barriers to participation

4. **Run Reflection Days**
   - Citizens log civic contributions
   - Share learnings
   - Celebrate wins

5. **Invite AI Companions**
   - Tutors
   - Mentors
   - Guides

#### To Raise GDP_state:

1. **Increase KS activity** (V_KS)
   - More quests
   - More events
   - Better incentives

2. **Optimize MIC inflows** (V_MIC)
   - Apply for Cathedral grants
   - Increase staking participation
   - Build infrastructure worthy of investment

3. **Attract new citizens**
   - Marketing (with integrity)
   - Showcase successes
   - Build reputation

---

## 6. Failure Modes & What To Do

### Failure Mode 1: GI_state Dips < 0.95

**Symptoms:**
- Integrity warnings from Custodian Agent
- MIC inflows reduced
- Citizen trust declining

**Actions:**

1. **Freeze non-essential experiments**
   - Stop risky policy changes
   - Pause new initiatives

2. **Review recent changes**
   - What changed in the last cycle?
   - Which policies caused drift?

3. **Run GI-Sim on remediation**
   - Simulate rollback options
   - Test integrity restoration paths

4. **Engage Cathedral support**
   - Request audit
   - Ask for guidance
   - Implement recommendations

5. **Communicate transparently**
   - Tell citizens what happened
   - Share the plan
   - Rebuild trust

### Failure Mode 2: v Stagnates or Declines

**Symptoms:**
- Low daily/monthly active users
- Few quest completions
- Declining KS transactions

**Root Causes:**
- Citizens are bored
- Content is stale
- Friction is too high
- Rewards are unclear

**Actions:**

1. **Talk to citizens**
   - Surveys
   - Discussions
   - Listen sessions

2. **Launch new quests**
   - Small, meaningful
   - Clear rewards
   - Aligned with values

3. **Reduce grind**
   - Remove busywork
   - Amplify meaningful contribution
   - Make it fun

4. **Host events**
   - Festivals
   - Competitions
   - Celebrations

5. **Adjust leadership tone**
   - Be a community lead, not a bureaucrat
   - Show vulnerability
   - Celebrate citizens

### Failure Mode 3: GDP_state Volatile

**Symptoms:**
- Large swings in GDP
- Unpredictable economics
- Citizen confusion

**Diagnosis:**

Is this **price-driven** or **activity-driven**?

**If price-driven** (MIC/KS price changes):
- Don't panic
- Focus on fundamentals (GI_state, v)
- Use treasury to smooth volatility
- Educate citizens on why prices move

**If activity-driven** (N_tx dropping):
- This is more serious
- Follow "Failure Mode 2" playbook
- Re-engage citizens
- Fix underlying issues

---

## 7. Steward Ethos

### The Steward's Creed

> "I do not rule this City-State. I tend to it."  
> "Integrity is my compass. Participation is my heartbeat."  
> "I grow what is good, and I refuse what corrupts."

### You Are a Gardener

Not a king.  
Not a CEO.  
Not a dictator.

You are a **gardener of a digital civilization.**

Your job:
- Plant seeds (initiatives)
- Water growth (support)
- Remove weeds (drift)
- Harvest abundance (prosperity)
- Share the yield (distribute fairly)

### Humility > Ego

- You will make mistakes
- You will face criticism
- You will need help

**This is normal.**

The system is designed to support you, not worship you.

---

## 8. Tools & Resources

### Core Tools

1. **City-State GDP Calculator**
   - `/tools/citystate_gdp_calculator.py`

2. **GDP Simulation Tool**
   - `/tools/citystate_gdp_simulation.py`

3. **Dashboard**
   - `/citystate/[name]`

4. **Command Ledger Template**
   - `/templates/City-State-Command-Ledger.md`

### Documentation

1. **Mobius Yellow Paper**
   - `/whitepaper/Mobius-Yellow-Paper-Math-Edition.md`

2. **Economics of Mobius**
   - `/whitepaper/Chapter-07-Economics-of-Mobius.md`

3. **Cathedral Rulebook**
   - `/docs/cathedrals/Cathedral-Rulebook.md`

4. **API Specifications**
   - `/specs/api-citystate-gdp.md`

### Support Channels

1. **Cathedral Advisors**
   - Request through `//api/cathedral/support`

2. **Elder City-States**
   - Mentorship program

3. **Steward Forum**
   - Share learnings, ask questions

4. **GI-Sim Support**
   - Technical assistance with simulations

---

## 9. Command Ledger Protocol

### Required: One Ledger Entry Per Cycle

Every cycle, create a new Command Ledger entry:

**File naming:**

```
[CityStateName]_Command_Ledger_C-###.md
```

**Example:**

```
Aurora_Command_Ledger_C-153.md
```

### Required Sections

1. **State Snapshot** (pre-check)
   - GI_state, MII, velocity, GDP_state

2. **Cycle Log**
   - What you tried
   - What worked
   - What didn't

3. **Numbers Block**
   - Detailed metrics

4. **Policy & Events**
   - Changes made
   - Festivals hosted

5. **Next Cycle Intent**
   - Plans for next cycle

6. **Trinity Seal**
   - Steward signature
   - Custodian Agent attestation
   - State Agent execution confirmation

### Template Location

See: `/templates/City-State-Command-Ledger.md`

---

## 10. Emergency Procedures

### Emergency Level 1: GI_state < 0.92

**Protocol:**

1. **Halt all non-essential changes**
2. **Convene emergency review**
   - You + Custodian Agent + Cathedral liaison
3. **Run GI-Sim on restoration options**
4. **Implement highest-GI path**
5. **Monitor hourly until GI_state > 0.95**

### Emergency Level 2: GI_state < 0.88

**Protocol:**

1. **Immediate Cathedral notification**
2. **Cathedral oversight activated**
3. **Steward role under review**
4. **Emergency Custodian Agent deployed**
5. **Full audit of all policies**
6. **Public transparency report required**

### Emergency Level 3: v < 0.2

**Protocol:**

1. **Citizen engagement crisis**
2. **Launch emergency participation campaign**
3. **Deploy high-value quests**
4. **Host immediate festival**
5. **Direct outreach to inactive citizens**
6. **Consider Steward replacement if no improvement in 2 cycles**

---

## Appendix A: Quick Reference Card

### Daily Checklist

- [ ] Check GI_state (should be ≥ 0.95)
- [ ] Check velocity v (should be ≥ 0.5)
- [ ] Review active quests
- [ ] Monitor citizen sentiment
- [ ] Respond to Custodian Agent alerts

### Weekly Checklist

- [ ] Calculate GDP_state
- [ ] Review KS transaction trends
- [ ] Check MIC inflow status
- [ ] Plan next week's events
- [ ] Update Command Ledger

### Cycle Checklist

- [ ] Complete Command Ledger entry
- [ ] Run GI-Sim for upcoming changes
- [ ] Review tier status
- [ ] Submit reports to Cathedral
- [ ] Plan next cycle initiatives

---

## Appendix B: Economic Formulas

### City-State GDP

```
GDP_state = V_KS + V_MIC_inflows
```

### KS Transaction Value

```
V_KS = N_tx × avg_KS_per_tx × KS_price
```

### MIC Inflow Value

```
V_MIC_inflows = (MIC_grants + MIC_staking + MIC_other) × MIC_price
```

### KS Price (Yellow Paper)

```
KS_price = (v × MIC_price) / 1000
```

---

## Appendix C: Contact Information

**Cathedral Support:**  
- Email: cathedral-support@mobius.systems
- Emergency: //api/cathedral/emergency

**Technical Support:**  
- GI-Sim: gi-sim-support@mobius.systems
- Dashboard: dashboard-support@mobius.systems

**Community:**  
- Steward Forum: forum.mobius.systems/stewards
- Discord: discord.gg/mobius-stewards

---

**End of HIVE Operator Handbook v0.1**

*"I tend, not rule. Integrity my compass. Participation my pulse. Clarity my guide."*

*— The Steward's Oath*
