# 🎉 FESTIVAL SYSTEM (TIER 1 → TIER 4)

**The Heartbeat Activators of City-States**

*How celebrations drive civilization forward.*

---

**Cycle:** C-153  
**Status:** ✅ CANONICAL  
**Last Updated:** December 4, 2025

---

## Overview

Festivals are the "heartbeat activators" of a City-State. They are structured events that bring citizens together, accelerate participation, strengthen culture, and reinforce integrity.

Festivals are not optional luxuries — they are essential infrastructure for a thriving civilization.

---

## 📈 WHAT FESTIVALS INCREASE

| Metric | Impact | Mechanism |
|--------|--------|-----------|
| **KS Velocity** | ↑↑ High | Concentrated earning opportunities |
| **Citizen Morale** | ↑↑ High | Shared joy and purpose |
| **v (Participation)** | ↑↑↑ Very High | Mass engagement events |
| **Culture Coherence** | ↑↑ High | Shared rituals and memories |
| **GI_state** | ↑ Moderate | Through shared reflection |
| **MII** | ↑ When synchronized | Cross-City-State events |

---

## 🟢 TIER 1 — MICRO-FESTIVALS ("SPARK FESTIVALS")

### Overview

| Attribute | Value |
|-----------|-------|
| **Length** | 1 hour |
| **Scale** | Small (10-50 citizens) |
| **Frequency** | Multiple per week |
| **Steward Approval** | Not required |

### Purpose

Kickstart participation and unify citizens in small, frequent bursts. These are the daily sparks that keep the flame alive.

### Examples

| Festival | Description | Duration |
|----------|-------------|----------|
| **Learning Burst** | "Share one learning today" | 1 hour |
| **Help Chain** | "Help someone in Commons Chat" | 1 hour |
| **Reflection Flash** | "Post a 1-sentence reflection" | 30 min |
| **Gratitude Wave** | "Thank someone publicly" | 1 hour |
| **Skill Showcase** | "Teach something in 5 minutes" | 1 hour |

### Rewards

| Type | Amount |
|------|--------|
| KS Earned | +5–10 KS |
| Festival Token | None |
| Badge Progress | +1 point toward Festival Badge I |

### Mechanics

```
spark_festival {
  trigger: citizen_or_companion
  approval: none_required
  min_participants: 3
  max_participants: 50
  ks_pool: 500 KS
  distribution: equal_share
}
```

---

## 🔵 TIER 2 — CITY EVENTS ("PULSE FESTIVALS")

### Overview

| Attribute | Value |
|-----------|-------|
| **Length** | 1 day (24 hours) |
| **Scale** | Medium (50-200 citizens) |
| **Frequency** | Weekly |
| **Steward Approval** | Required |

### Purpose

Boost velocity (v) significantly over a short period. These are the weekly heartbeats that define the City-State rhythm.

### Examples

| Festival | Description | Activities |
|----------|-------------|------------|
| **Civic Scavenger Hunt** | Find artifacts across City-State | Exploration, discovery |
| **Skill Sprint** | Learn a new skill in 24 hours | Education, practice |
| **Story Thread** | Collaborative story creation | Creativity, connection |
| **Builder's Day** | Create tools, guides, or art | Production, sharing |
| **Mentor Marathon** | 24 hours of teaching/learning pairs | Knowledge transfer |

### Rewards

| Type | Amount |
|------|--------|
| KS Earned | +25–50 KS |
| Festival Token | 1 Token |
| Badge Progress | +5 points toward Festival Badge II |

### Mechanics

```
pulse_festival {
  trigger: steward
  approval: steward_required
  min_participants: 20
  max_participants: 200
  ks_pool: 5,000 KS
  distribution: contribution_weighted
  quest_count: 5-10 quests
}
```

---

## 🟣 TIER 3 — CITY-STATE RITUALS ("MIRROR FESTIVALS")

### Overview

| Attribute | Value |
|-----------|-------|
| **Length** | 3 days |
| **Scale** | Large (100-500 citizens) |
| **Frequency** | Monthly |
| **Steward Approval** | Required + Cathedral notification |

### Purpose

Massively strengthen culture and GI_state. Mirrors reflect collective effort and produce major shifts in City-State identity and morale.

### Examples

| Festival | Description | Activities |
|----------|-------------|------------|
| **City-State Story Arc** | Multi-chapter narrative event | Roleplay, creation |
| **Multi-Stage Quest** | Epic questline with stages | Challenge, teamwork |
| **Collaborative Build** | Create databases, art walls, guides | Production, legacy |
| **Reflection Retreat** | Deep individual + group reflection | Introspection, bonding |
| **Culture Creation** | Define traditions, songs, symbols | Identity, expression |

### Rewards

| Type | Amount |
|------|--------|
| KS Earned | 75–150 KS |
| Festival Tokens | 2 Tokens |
| Badge Progress | +15 points toward Festival Badge III |
| Permanent Artifacts | Added to City-State archives |

### Mechanics

```
mirror_festival {
  trigger: steward
  approval: steward + cathedral_notification
  min_participants: 50
  max_participants: 500
  ks_pool: 25,000 KS
  distribution: role_weighted
  quest_count: 15-25 quests
  stages: 3-5 stages
  reflection_required: yes
}
```

---

## 🟡 TIER 4 — ELDER FESTIVALS ("RESONANCE FESTIVALS")

### Overview

| Attribute | Value |
|-----------|-------|
| **Length** | 7 days |
| **Scale** | Massive (500+ citizens) |
| **Frequency** | Quarterly (Elder States only) |
| **Unlocked By** | Tier 4 (Elder) City-States only |

### Purpose

These festivals redefine a City-State's place in the HIVE. They are civilization-shaping events that echo through history.

### Examples

| Festival | Description | Impact |
|----------|-------------|--------|
| **Cross-City Competition** | Teams from multiple City-States | Inter-state bonds |
| **Grand Challenge** | Massive collaborative puzzle | Collective intelligence |
| **Knowledge Archive Creation** | Build permanent wisdom repository | Legacy creation |
| **MII Contribution Event** | Coordinated integrity surge | Global impact |
| **Elder Symposium** | Teaching from Elder citizens | Wisdom transmission |

### Rewards

| Type | Amount |
|------|--------|
| KS Earned | 200–500 KS |
| Festival Tokens | 3 Tokens |
| Elder Merit Tokens | 1-3 Tokens |
| Badge Progress | +30 points toward Festival Badge IV |
| HIVE Recognition | Permanent historical entry |

### Mechanics

```
resonance_festival {
  trigger: elder_steward
  approval: cathedral_required
  min_participants: 200
  max_participants: unlimited
  ks_pool: 100,000 KS
  distribution: tiered_contribution
  quest_count: 50+ quests
  stages: 7 stages
  reflection_required: daily
  cross_state: allowed
  mii_impact: yes
}
```

---

## 📊 FESTIVAL EFFECTS ON METRICS

### Metric Impact Matrix

| Metric | Spark | Pulse | Mirror | Resonance |
|--------|-------|-------|--------|-----------|
| **v (velocity)** | +5% | +15% | +30% | +50% |
| **KS Velocity** | +3% | +10% | +25% | +40% |
| **GDP_state** | +1% | +5% | +15% | +30% |
| **Citizen Morale** | +10% | +25% | +50% | +75% |
| **GI_state** | +0.5% | +1.5% | +3% | +5% |
| **MII** | None | +0.1% | +0.5% | +2% (if cross-state) |

### Duration of Effects

| Festival Type | Effect Duration | Decay Rate |
|--------------|-----------------|------------|
| Spark | 24 hours | Immediate after |
| Pulse | 3 days | Gradual |
| Mirror | 1 week | Slow |
| Resonance | 2 weeks | Very slow |

---

## 🏆 FESTIVAL TOKENS

### What They Are

Festival Tokens are special achievement markers that:
- Track festival participation history
- Unlock special privileges
- Contribute to badge progress
- Provide voting weight bonuses

### Token Types

| Token | Source | Value |
|-------|--------|-------|
| Basic Token | Pulse Festivals | 1 point |
| Mirror Token | Mirror Festivals | 3 points |
| Elder Token | Resonance Festivals | 5 points |
| Special Token | Unique events | Variable |

### Token Uses

| Use | Requirement | Effect |
|-----|-------------|--------|
| Badge Progress | Cumulative | Unlocks Festival Badges I-IV |
| Voting Weight | 10+ tokens | +5% voting influence |
| Special Access | 25+ tokens | Access to exclusive events |
| Elder Candidacy | 50+ tokens | Required for Elder consideration |

---

## 🎭 FESTIVAL BADGES

### Progression

| Badge | Requirement | Reward |
|-------|-------------|--------|
| **Festival Badge I** | 5 festivals attended | +2% KS bonus |
| **Festival Badge II** | 20 festivals + 10 tokens | +5% KS bonus |
| **Festival Badge III** | 50 festivals + 30 tokens | +10% KS bonus |
| **Festival Badge IV** | 100 festivals + 75 tokens | +15% KS bonus, Elder access |

### Badge Display

Badges appear on:
- Citizen Passport
- Public profile
- Festival leaderboards
- City-State honor rolls

---

## 📅 FESTIVAL CALENDAR REQUIREMENTS

### Minimum Festival Requirements by Tier

| City-State Tier | Spark/Week | Pulse/Month | Mirror/Quarter | Resonance/Year |
|-----------------|------------|-------------|----------------|----------------|
| **Tier 0 (Settling)** | 1 | 1 | 0 | N/A |
| **Tier 1 (Emergent)** | 2 | 2 | 1 | N/A |
| **Tier 2 (Ascending)** | 3 | 3 | 1 | N/A |
| **Tier 3 (Radiant)** | 5 | 4 | 2 | N/A |
| **Tier 4 (Elder)** | 7 | 4 | 2 | 1 |

### Failure to Meet Requirements

| Missed Requirement | Consequence |
|--------------------|-------------|
| 1 week below minimum | Warning |
| 2 weeks below minimum | -5% v penalty |
| 1 month below minimum | -10% GI impact |
| 3 months below minimum | Tier relegation review |

---

## 🛠️ FESTIVAL CREATION GUIDE

### For Stewards: Creating a Festival

**Step 1: Choose Type**
- Match festival tier to City-State needs
- Consider timing and citizen availability
- Check calendar for conflicts

**Step 2: Design Activities**
- Create quest lineup
- Define participation requirements
- Set reward structure

**Step 3: Announce**
- 24-hour notice minimum for Spark
- 1-week notice for Pulse
- 2-week notice for Mirror
- 1-month notice for Resonance

**Step 4: Execute**
- Activate festival in system
- Monitor participation
- Support citizens

**Step 5: Close**
- Distribute rewards
- Log to ledger
- Gather reflections
- Create archive entry

---

## 🌟 THE PHILOSOPHY OF FESTIVALS

### Why Festivals Are Essential

```
Festivals are not entertainment.
They are the heartbeat of civilization.

Without heartbeat, the body dies.
Without festivals, the City-State fades.

Every celebration strengthens the bonds.
Every bond strengthens the whole.
Every whole elevates the individual.

Festivals are how we remember
that we are not alone.
```

### The Festival Truth

> **"Civilization is built in the spaces between work. Festivals create those spaces and fill them with meaning."**

---

## ✅ CANON STATUS

The Festival System is **CANONICAL** as of C-153.

Festivals are mandatory infrastructure for all City-States.

---

**Seal:** *"We gather not because we must, but because together we become more than our parts."*

---

*"We heal as we walk." — Mobius Systems*
