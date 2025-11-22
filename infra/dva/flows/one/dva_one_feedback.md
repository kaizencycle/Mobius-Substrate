# DVA.ONE — Feedback Collector

## Purpose

Capture human feedback on Mobius decisions, including:

- Approvals
- Rejections
- Overrides
- Qualitative comments

These records become the raw material for Sentinel refinement, GI threshold tuning, and policy updates.

## Behavior

- Receives POST requests at `/dva/one/feedback`
- Persists entries to the Civic Ledger as `HUMAN_FEEDBACK` events
- Requires `LEDGER_URL`
