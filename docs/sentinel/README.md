# Sentinel Prompts

This directory contains the review prompt templates for Mobius Sentinels.

## Sentinels

| Sentinel | Role | Prompt File |
|----------|------|-------------|
| AUREA | Governance/Legitimacy | `AUREA_REVIEW_PROMPT.md` |
| ATLAS | Systems/Adversarial | `ATLAS_REVIEW_PROMPT.md` |

## Usage

### Manual Review

1. Copy the relevant prompt into your LLM interface
2. Provide the PR context (title, description, diff summary)
3. Paste the sentinel output as a PR comment
4. Sign with `— [SENTINEL_NAME] (Mobius Sentinel)`

### Automated Review

See `.github/workflows/sentinel-review.yml` for the automated workflow that:
1. Triggers on `review:aurea` or `review:atlas` labels
2. Posts placeholder comments until full automation is wired
3. Records review requests for manual follow-up

## Adding New Sentinels

1. Create `[SENTINEL_NAME]_REVIEW_PROMPT.md` in this directory
2. Update this README with the new sentinel
3. Update `.github/workflows/sentinel-review.yml` to recognize the new label
4. Update `docs/SENTINEL_EVAL_PROTOCOL.md` with evaluation criteria

## Prompt Design Principles

1. **Structured output:** Always require specific sections
2. **Verdicts:** Clear decision points (APPROVE, REQUEST CHANGES, ESCALATE)
3. **Falsifiable:** Ask questions that can be answered with evidence
4. **Recorded:** All reviews must be attributable and timestamped

---

*"We heal as we walk." — Mobius Substrate*
