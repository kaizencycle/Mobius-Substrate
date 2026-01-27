# Citizen Oversight Dashboard — Microcopy

**How the system speaks to humans.**

This document defines the language used throughout the Citizen Oversight Dashboard. The goal is communication that is calm, non-accusatory, pattern-focused, and explicitly anti-panic.

---

## Global Tone Rules

| Principle | Description |
|-----------|-------------|
| **Calm** | No alarmist language or panic-inducing phrasing |
| **Non-accusatory** | Describe behavior, not assign blame |
| **Pattern-focused** | Emphasize trends over single incidents |
| **Anti-panic** | Prevent mob formation or reactionary conclusions |
| **Never "breaking news" energy** | Steady, measured communication |

---

## MII Status Microcopy

### Status Labels

| Status | Display Text | Tooltip |
|--------|--------------|---------|
| **Stable** | "This system is operating within established integrity thresholds." | "MII reflects patterns over time, not individual incidents." |
| **Watch** | "Some signals merit attention. No immediate harm detected." | "Watch status indicates elevated attention, not confirmed problems." |
| **Breach** | "Integrity thresholds were exceeded. Review and escalation are in progress." | "Breach indicates policy enforcement is active." |

### Threshold Display

```
🟢 Stable ≥0.95   🟡 Watch 0.90–0.94   🔴 Breach <0.90
```

---

## Integrity Trend Panel

### Default Text

> "Trends show how behavior evolves. Sudden spikes matter less than sustained change."

### Annotation Format

> "Integrity dip on [DATE] resolved after [ACTION]."

Example:
> "Integrity dip on Jan 12 resolved after additional review requirements."

### Empty State

> "No significant integrity events in this period."

---

## Activity Log Microcopy

### Section Header

> "Recorded actions and their justifications."

### Entry Components

| Component | Example |
|-----------|---------|
| **Timestamp** | "Jan 26" |
| **Event Type** | "Policy Update Executed" |
| **Intent** | "Improve safety filter reliability" |
| **Risk Level** | "Medium" |
| **Impact** | "Neutral" |
| **Status** | "Completed" |

### Expanded Details Footer

> "Transparency does not imply wrongdoing. It enables accountability."

### Blocked Action Note

> "This action was prevented by governance safeguards."

**Important**: Blocked actions are framed as system successes, not scandals.

---

## Oversight Signals Panel

### Signal Labels

| Signal | Normal | Elevated | Critical |
|--------|--------|----------|----------|
| **Intent Coverage** | "Most actions include clear explanations." | "Some actions lack complete justification." | "Many actions lack required explanations." |
| **Review Latency** | "Reviews completing within expected timeframes." | "Reviews are taking slightly longer than average." | "Review backlog detected." |
| **Override Frequency** | "No recurring emergency behavior detected." | "Elevated emergency action frequency." | "Pattern of emergency overrides detected." |
| **Drift Risk** | "No long-term concerning trend identified." | "Gradual behavioral shift detected." | "Significant drift from baseline patterns." |

### Panel Footer

> "Oversight focuses on patterns, not blame."

---

## Pattern Watch Panel

### Introduction Text

> "This panel shows patterns, not incidents."

### Pattern Descriptions

| Pattern | Description |
|---------|-------------|
| Repeated emergency overrides | "Multiple actions bypassed standard review in recent period." |
| Declining explanation quality | "Justifications have become shorter or less detailed over time." |
| Increasing blocked actions | "More actions are being prevented by automated safeguards." |
| Shortened review cycles | "Time between request and approval has decreased." |

### Confidence Indicator

> "Confidence: [High/Medium/Low]"

---

## Flagging Form Microcopy

### Top Warning (Always Visible)

> "This tool is for good-faith civic oversight. Reports are recorded."

### Field Labels and Helper Text

| Field | Label | Helper Text |
|-------|-------|-------------|
| Description | "What are you seeing?" | "Describe the pattern or behavior, not a person." |
| Type | "Pattern or incident?" | "Patterns are recurring behaviors. Incidents are single events." |
| Rationale | "Why does this matter?" | "Explain potential long-term impact." |

### Submit Button

> "Submit Report"

### Submit Confirmation

> "Thank you. This report is now part of the public oversight record."

### Frivolous Report Warning

> "Reports are recorded. Bad-faith use reduces trust score."

---

## Memory Panel

### Section Header

> "The system remembers."

### Statistics Labels

| Stat | Label |
|------|-------|
| Total actions | "Total actions recorded" |
| Blocked actions | "Actions prevented by safeguards" |
| Integrity breaches | "Integrity threshold breaches" |
| Longest stable period | "Longest period without incident" |

### Historical Notes Header

> "Public Annotations"

### Note Format

> "[DATE]: [ANNOTATION]"

Example:
> "Jan 2025: Review process strengthened after community audit."

---

## Governance Panel

### Section Header

> "Who is responsible?"

### Authority Statement

> "No single person or model has unilateral authority."

### Decision Categories

| Category | Description |
|----------|-------------|
| Production deployment | "Requires steward approval" |
| Integrity threshold changes | "Requires council review" |
| MIC mint/burn logic | "Requires simulation test + audit" |

### Escalation Path

> "Citizen → Auditor → Steward → Council → Custodian"

---

## Safety Footer (Always Visible)

```
Mobius does not monitor individuals.
Mobius does not access private data.
Mobius does not censor content.
Mobius records behavior and justification — nothing more.
```

---

## First-Time User Prompt

> "Mobius does not tell you what to think.
> It shows you what is happening.
>
> Oversight works when citizens act carefully, not loudly."

**Acceptance Button**: "I understand"

---

## Error States

### Network Error

> "Unable to load data. Please try again."

### No Data Available

> "No data available for this time period."

### Access Denied

> "You don't have permission to view this information."

### Rate Limited

> "Too many requests. Please wait before trying again."

---

## Mobile View

On mobile, collapse to:

1. MII status (single number + color)
2. "What changed today?" (summary)
3. Alerts (if any)
4. "Learn more" button

No dense charts on mobile.

---

## Anti-Patterns to Avoid

| Avoid | Use Instead |
|-------|-------------|
| "BREAKING" or "URGENT" | "Updated" or "New" |
| "Violation detected" | "Threshold exceeded" |
| "Failed integrity check" | "Review in progress" |
| "User X did Y" | "Action Y was recorded" |
| "Suspicious activity" | "Pattern under review" |
| "Attack" or "abuse" | "Anomaly" or "concern" |

---

## Related Documents

- [README.md](./README.md) - System overview
- [TRUST_SCORES.md](./TRUST_SCORES.md) - Reputation system
- [MIC_INCENTIVES.md](./MIC_INCENTIVES.md) - Contribution rewards

---

*"Words shape behavior. Choose them carefully."*
