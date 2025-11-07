#!/usr/bin/env python3
"""
Verify Merkle anchor integrity.
Regenerates checksums and Merkle root, compares against stored anchor.
"""
import json
import pathlib
import subprocess
import sys

def main():
    anchor_path = pathlib.Path("anchoring/merkle-root.txt")
    if not anchor_path.exists():
        print("[WARN] No existing anchor found. Generating initial anchor...")
        subprocess.check_call([sys.executable, "scripts/generate_checksum.py"])
        subprocess.check_call([sys.executable, "scripts/anchor_merkle.py"])
        print("[OK] Initial anchor created.")
        return 0
    
    want = anchor_path.read_text().strip()
    
    print("[INFO] Regenerating checksums...")
    subprocess.check_call([sys.executable, "scripts/generate_checksum.py"])
    
    print("[INFO] Regenerating Merkle root...")
    subprocess.check_call([sys.executable, "scripts/anchor_merkle.py"])
    
    got = anchor_path.read_text().strip()
    
    if got != want:
        print(f"[FAIL] Merkle mismatch detected!")
        print(f"  Expected: {want[:16]}...")
        print(f"  Got:      {got[:16]}...")
        print("[FAIL] Integrity verification failed. Files may have been tampered with.")
        return 1
    
    print("[OK] Merkle anchor verifies. Integrity confirmed.")
    return 0

if __name__ == "__main__":
    sys.exit(main())

