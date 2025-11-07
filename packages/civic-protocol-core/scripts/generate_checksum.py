#!/usr/bin/env python3
"""
Generate SHA-256 checksums for Civic Protocol Core files.
Creates anchoring/checksums.json with file paths and hashes.
"""
import hashlib
import pathlib
import sys
import json
import datetime as dt

TARGETS = ["civic_protocol/core/", "civic_protocol/api/", "migrations/"]

def sha256_file(p: pathlib.Path) -> str:
    """Calculate SHA-256 hash of a file."""
    h = hashlib.sha256()
    with p.open("rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

def main():
    root = pathlib.Path(".").resolve()
    files = []
    
    # Check if we're in the right directory structure
    # Adjust paths based on actual structure
    if (root / "ledger").exists():
        # We're in packages/civic-protocol-core/
        targets = ["ledger/", "lab6-proof/", "gic-indexer/"]
    else:
        targets = TARGETS
    
    for t in targets:
        target_path = root / t
        if target_path.exists():
            for p in target_path.rglob("*"):
                if p.is_file() and not any(skip in str(p) for skip in [".git", "__pycache__", ".pyc", ".pytest_cache"]):
                    files.append(p)
        else:
            print(f"[WARN] Target path {t} does not exist, skipping...", file=sys.stderr)

    records = []
    for f in sorted(files):
        records.append({
            "path": str(f.relative_to(root)),
            "sha256": sha256_file(f)
        })

    bundle = {
        "created_utc": dt.datetime.utcnow().isoformat() + "Z",
        "count": len(records),
        "records": records,
    }
    
    out = root / "anchoring" / "checksums.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(bundle, indent=2))
    print(f"✓ Wrote {len(records)} checksums to {out}")
    return 0

if __name__ == "__main__":
    sys.exit(main())

