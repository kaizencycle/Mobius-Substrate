# Nightly Encyclopedia Builder (n8n Contract)

This flow runs at 02:00 daily to graduate the highest-integrity answers from Thought Broker into the Encyclopedia and Civic Ledger.

```json
{
  "name": "Nightly Encyclopedia Builder",
  "nodes": [
    {
      "id": "cron",
      "type": "cron",
      "params": { "trigger": "0 2 * * *" }
    },
    {
      "id": "question_gen",
      "type": "http",
      "params": {
        "method": "POST",
        "url": "{{MEMT_HOST}}/v1/memt/generate-encyclopedia-topics",
        "body": { "count": 25, "domain": "civic_os" }
      }
    },
    {
      "id": "loop",
      "type": "loop",
      "over": "{{question_gen.response.topics}}"
    },
    {
      "id": "deliberate",
      "type": "http",
      "params": {
        "method": "POST",
        "url": "{{BROKER_HOST}}/v1/deliberate",
        "body": {
          "prompt": "{{loop.item.question}}",
          "mode": "encyclopedia_build",
          "context": { "topicId": "{{loop.item.topicId}}" },
          "sentinels": ["claude", "gpt", "deepseek"],
          "requireGiScore": true
        }
      }
    },
    {
      "id": "ledger",
      "type": "http",
      "condition": "{{deliberate.response.giScore >= 0.95}}",
      "params": {
        "method": "POST",
        "url": "{{LEDGER_HOST}}/v1/ledger/attest",
        "body": {
          "type": "encyclopedia_entry",
          "topicId": "{{loop.item.topicId}}",
          "giScore": "{{deliberate.response.giScore}}",
          "sources": "{{deliberate.response.sources}}",
          "engines": "{{deliberate.response.engines}}",
          "contentHash": "{{sha256(deliberate.response.consensus.answer)}}"
        }
      }
    },
    {
      "id": "ingest",
      "type": "http",
      "params": {
        "method": "POST",
        "url": "{{BROKER_HOST}}/v1/encyclopedia/ingest",
        "body": {
          "topicId": "{{loop.item.topicId}}",
          "title": "{{loop.item.title}}",
          "summary": "{{deliberate.response.consensus.summary}}",
          "content": "{{deliberate.response.consensus.answer}}",
          "giScore": "{{deliberate.response.giScore}}",
          "engines": "{{deliberate.response.engines}}",
          "sources": "{{deliberate.response.sources}}",
          "ledgerTxId": "{{ledger.response.txId}}",
          "createdBy": "system:nightly-cron"
        }
      }
    },
    {
      "id": "notify",
      "type": "http",
      "condition": "{{deliberate.response.giScore < 0.95}}",
      "params": {
        "method": "POST",
        "url": "{{NOTIFY_HOOK}}",
        "body": {
          "topicId": "{{loop.item.topicId}}",
          "giScore": "{{deliberate.response.giScore}}",
          "status": "draft",
          "message": "New draft encyclopedia entry awaiting human review"
        }
      }
    }
  ]
}
```

**Operational Notes**
- `ledger` node is optional; disable it if Civic Ledger is offline.
- Use whatever topic generator you prefer; the example calls MEMT to suggest 25 fresh civic topics nightly.
- The `notify` node can fan out to Telegram, Discord, PagerDuty, or any Ops hook when entries land below the canonical threshold.
