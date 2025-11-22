# DVA.ONE — Learning Loop

## Purpose

Turn raw human feedback into structured insights:

1. Fetch `HUMAN_FEEDBACK` events from the Civic Ledger
2. Ask Thought Broker to summarize patterns and propose adjustments
3. Log proposals back to the ledger as `ALIGNMENT_PROPOSAL`

## Guarantees

- No automatic policy mutation — proposals require Sentinel + human review
- Full audit trail through ledger attestations
