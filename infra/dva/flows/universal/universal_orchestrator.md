# Mobius Universal Orchestrator

## Purpose

The Universal Orchestrator is the **top-level DVA flow** that:

- Accepts user or system requests
- Routes to the Thought Broker
- Receives Sentinel consensus + GI scoring
- Gates outputs on GI thresholds
- Attests decisions to the Civic Ledger
- Routes low-confidence or sensitive decisions to human reviewers
- Publishes results to external channels (Discord, Telegram, Substack, GitHub, etc.)

## High-Level Flow

1. **Inbound Request**
   - HTTP/Webhook (`/mobius/universal`)
   - Payload: `{ prompt, context?, routingMode?, channel? }`
2. **Thought Broker Call**
   - POST → `BROKER_URL/v1/deliberate`
   - Broker may use multi-engine routing (Claude, GPT, Gemini, DeepSeek, etc.)
   - Output includes: `giScore`, `sentinels`, `payloadHash`, `summary`, `decision`
3. **GI Threshold Check**
   - Default: `GI >= 0.95` required for automatic actuation
   - If GI < 0.95 → branch to human review
4. **Ledger Attestation**
   - POST → `LEDGER_URL/ledger/attest`
   - Type: `MOBIUS_ORCHESTRATION`
   - Includes GI, Sentinel signatures, payload hash, metadata
5. **Human-in-the-Loop**
   - If decision = `human_required` OR GI < 0.95:
     - Notify Telegram review channel
     - Optionally open a ticket / task in external systems
6. **Publishing**
   - High-confidence results can be sent to:
     - Discord channels
     - Substack drafts
     - GitHub issues/PR descriptions
     - Other outputs as wired

## Governance

- This flow is **constitutionally bound**:
  - It must not bypass the Thought Broker or GI gates.
  - Every decision must be either attested to the Civic Ledger or escalated to human review.
- Any modification requires code review, constitutional compliance checks, and ledger-recorded deployment notes.

## Env Var Contract

Required:
- `BROKER_URL`
- `LEDGER_URL`
- `DISCORD_WEBHOOK_URL` (if used)
- `TELEGRAM_REVIEW_CHAT_ID` (if used)

Optional:
- `BROKER_AUTH`
- `LEDGER_AUTH`
