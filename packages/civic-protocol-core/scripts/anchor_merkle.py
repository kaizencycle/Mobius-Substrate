#!/usr/bin/env python3
"""
Generate Merkle root from checksums.
Creates anchoring/merkle.json and anchoring/merkle-root.txt.
"""
import json
import hashlib
import pathlib

def merkle_root(hashes):
    """Calculate Merkle root from list of hashes."""
    layer = hashes[:]
    if not layer:
        return None
    while len(layer) > 1:
        nxt = []
        for i in range(0, len(layer), 2):
            a = layer[i]
            b = layer[i+1] if i+1 < len(layer) else layer[i]
            nxt.append(hashlib.sha256((a+b).encode()).hexdigest())
        layer = nxt
    return layer[0]

def main():
    checksums_path = pathlib.Path("anchoring/checksums.json")
    if not checksums_path.exists():
        print(f"[ERROR] {checksums_path} not found. Run generate_checksum.py first.")
        return 1
    
    data = json.loads(checksums_path.read_text())
    
    # Check if records list is empty
    if not data.get("records") or len(data["records"]) == 0:
        print("[ERROR] No files found to checksum. Cannot generate Merkle root.")
        return 1
    
    leaf_hashes = [r["sha256"] for r in data["records"]]
    root = merkle_root(leaf_hashes)
    
    # Handle case where merkle_root returns None (shouldn't happen if records exist, but defensive)
    if root is None:
        print("[ERROR] Failed to generate Merkle root. No valid hashes found.")
        return 1
    
    out = {
        "created_utc": data["created_utc"],
        "count": data["count"],
        "merkle_root": root,
    }
    
    merkle_json = pathlib.Path("anchoring/merkle.json")
    merkle_json.write_text(json.dumps(out, indent=2))
    
    merkle_txt = pathlib.Path("anchoring/merkle-root.txt")
    merkle_txt.write_text(root + "\n")
    
    print(f"✓ Merkle root: {root}")
    print(f"✓ Wrote {merkle_json}")
    print(f"✓ Wrote {merkle_txt}")
    return 0

if __name__ == "__main__":
    exit(main())

