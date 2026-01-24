# Mobius Pilot Program

This directory contains **real-world pilot deployments** of Mobius Substrate.

Mobius is not validated by philosophy or documentation.
It is validated by **whether it reduces legitimacy collapse in practice**.

If a pilot does not improve outcomes versus the status quo, publish it anyway.

---

## What Counts as a Pilot?

A Mobius pilot must satisfy all of the following:

1. **Real workflow**
   - Not a demo
   - Not a toy repo
   - Actual decisions with consequences

2. **Before / After comparison**
   - What broke before Mobius?
   - What changed after?

3. **EPICON usage**
   - At least one EPICON per consequential decision

4. **MII measurement**
   - Record scores
   - Adjust thresholds if needed

5. **Human authority retained**
   - AI does not make final decisions

---

## Example Workflows

Good pilot candidates:
- Content moderation policy updates
- Financial risk thresholds
- Access control rules
- ML model deployment approvals
- Compliance rule changes
- Incident response playbooks

Bad pilot candidates:
- Personal projects with no users
- One-off scripts
- Fully automated systems with no human discretion

---

## How to Start a Pilot

1. Copy the template:

```bash
cp pilots/TEMPLATE_CASE_STUDY.md pilots/P-<MONTH>-<YEAR>-<NAME>.md
```

2. Configure Mobius for the workflow:
   - MII threshold
   - Required sign-offs
   - Sentinel participation

3. Run for at least 2 weeks or 10 decisions, whichever comes first

4. Publish results — even if negative

---

## What Success Looks Like

Mobius is useful if it:
- Reduces "why did we do this?" incidents
- Makes rollback faster and less political
- Preserves decision context across personnel changes
- Surfaces disagreement earlier
- Creates evidence instead of vibes

Mobius fails if it:
- Adds bureaucracy without clarity
- Becomes performative compliance
- Is ignored during real pressure

---

## Negative Results Are Valuable

A pilot that shows Mobius did not help is a success for the project.

If Mobius doesn't beat:
- Plain logging
- Human review
- Checklists

...then Mobius should be redesigned or abandoned for that use case.

---

## Publishing & Attribution

Pilots may be:
- Public
- Pseudonymous
- Anonymized

At minimum, publish:
- Metrics
- Configuration
- Lessons learned

If you want your name attached, MIC can be awarded per `docs/MIC_SPEC.md`.

---

## Pilot Index

| Pilot ID | Workflow | Outcome | Status |
|----------|----------|---------|--------|
| — | — | — | Open |

---

## Metrics to Track

### Required Metrics

| Metric | Description |
|--------|-------------|
| Decisions made | Total consequential decisions during pilot |
| EPICONs created | Attestations filed |
| MII scores | Distribution of scores |
| Overrides | Number and reasons |
| Rollbacks | Count and time-to-rollback |

### Optional Metrics

| Metric | Description |
|--------|-------------|
| Time-to-decision | From request to approval |
| Sentinel flags | Count and severity |
| Dissent recorded | Objections captured |
| Context reconstruction | Time to understand old decisions |

---

## MIC Awards for Pilots

| Contribution | MIC Awarded |
|--------------|------------:|
| Complete pilot (any outcome) | +10 |
| Pilot with negative result (published) | +15 |
| Pilot co-authorship | Per MIC_SPEC.md |

---

## Support

- Questions: File an issue with `pilot:question` label
- Feedback: File an issue with `pilot:feedback` label
- Results: Submit PR to add your pilot to this directory

---

**Mobius does not win by being adopted.**
**It wins by surviving falsification.**

---

*"We heal as we walk." — Mobius Substrate*
