#!/usr/bin/env bash
set -euo pipefail
if ! command -v dvc >/dev/null 2>&1; then
  echo "[DVC] dvc not found; install DVC to enforce dataset governance." >&2
  exit 1
fi
STATUS=0
while read -r file; do
  [ -f "$file" ] || continue
  SIG="${file}.sig"
  if [ ! -f "$SIG" ]; then
    echo "[DVC] Missing signature file for $file (expected ${SIG})." >&2
    STATUS=1
    continue
  fi
  HASH_LINE=$(grep -E '^sha256:' "$SIG" || true)
  LIC_LINE=$(grep -E '^license:' "$SIG" || true)
  if [ -z "$HASH_LINE" ] || [ -z "$LIC_LINE" ]; then
    echo "[DVC] Invalid signature metadata for $file; need 'sha256:' and 'license:' lines." >&2
    STATUS=1
    continue
  fi
  FILE_HASH=$(sha256sum "$file" | awk '{print $1}')
  SIG_HASH=$(echo "$HASH_LINE" | awk -F': ' '{print $2}')
  if [ "$FILE_HASH" != "$SIG_HASH" ]; then
    echo "[DVC] Hash mismatch for $file (expected $SIG_HASH, got $FILE_HASH)." >&2
    STATUS=1
  fi
done < <(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(csv|parquet|json|ndjson|feather|zip|gz|bz2)$' || true)
exit $STATUS

