#!/usr/bin/env bash
set -euo pipefail

LEDGER_URL=${LEDGER_BASE_URL:-"https://ledger.mobius"}

curl -sSf -X POST "$LEDGER_URL/mic/payout"
