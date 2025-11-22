# N8N Universal Flow API Contract

**Status:** Draft v0.1  
**Audience:** Backend devs / workflow engineers / Sentinel maintainers

---

## 1. Thought Broker Endpoint

`POST /v1/broker/route`

**Request body (envelope):**

```json
{
  "prompt": "string",
  "context": "Mobius-OS | Lab4 | Lab6 | HIVE",
  "intent": "research | code | publish | deploy | reflect | notify",
  "allowedTools": ["search", "code", "math", "browser"],
  "priority": "low | normal | high",
  "userId": "optional"
}
```

**Response body:**

```json
{
  "engines": {
    "gemini": { "status": "ok", "answer": "..." },
    "claude": { "status": "ok", "answer": "..." },
    "deepseek": { "status": "ok", "answer": "..." },
    "gpt": { "status": "ok", "answer": "..." }
  },
  "routingMode": "multi-engine | single-engine",
  "taskType": "research | code | hybrid"
}
```

---

## 2. Sentinel Consensus Endpoint

`POST /v1/consensus`

**Request body:**

```json
{
  "prompt": "string",
  "engines": {
    "gemini": { "answer": "..." },
    "claude": { "answer": "..." },
    "deepseek": { "answer": "..." },
    "gpt": { "answer": "..." }
  },
  "context": "string",
  "intent": "string"
}
```

**Response body:**

```json
{
  "consensus": "approved | flagged | human_required",
  "gi": 0.0,
  "harm_score": 0.0,
  "chosen_answer": "string",
  "channels": ["substack", "discord", "github"],
  "pr_metadata": {
    "enabled": true,
    "branch": "feature/...",
    "title": "string",
    "body": "string"
  }
}
```

---

## 3. Civic Ledger Attestation

`POST /ledger/attest`

**Body:**

```json
{
  "actor": "Mobius-Universal-Flow",
  "engines": ["gemini", "claude"],
  "sentinels": ["atlas", "aurea", "eve"],
  "gi": 0.986,
  "intent": "publish|code|deploy|notify",
  "channels": ["substack", "github"],
  "payload_hash": "sha256:...",
  "meta": {
    "userId": "optional",
    "prompt": "string",
    "timestamp": "ISO-8601"
  }
}
```

**Response:**

```json
{
  "status": "ok",
  "event_id": "string",
  "chain_height": 1234
}
```

---

## 4. Safety Guarantees

- Engines cannot be called directly from n8n without passing through Broker + Sentinels + GI gate for high-risk domains.
- Low-risk flows (e.g., reflections, personal notes) MAY be allowed in “local” mode, but:
  - Still should log to Ledger
  - Can be limited to a single engine
- Any `human_required` consensus MUST route to human channels (Telegram/Discord) and halt auto-actions.

---

This spec should evolve alongside the DVA tiers (LITE/ONE/FULL/HIVE) and the Sentinel Constitution. This is the “universal adapter” that lets Mobius plug into any engine without surrendering governance.

