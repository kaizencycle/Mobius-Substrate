#!/usr/bin/env bash
set -euo pipefail

: "${ENCYCLOPEDIA_API_URL:=http://localhost:8085}"
: "${ENCYCLOPEDIA_CRON_SECRET:?ENCYCLOPEDIA_CRON_SECRET is required}"

curl -sS -X POST "${ENCYCLOPEDIA_API_URL}/v1/encyclopedia/seed" \
  -H "Content-Type: application/json" \
  -H "x-encyclopedia-secret: ${ENCYCLOPEDIA_CRON_SECRET}" \
  -d '{}' \
  | jq '.entry.id, .entry.question' || true
