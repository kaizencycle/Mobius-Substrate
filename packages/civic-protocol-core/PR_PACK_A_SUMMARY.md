# PR Pack A: Civic-Protocol-Core Anchoring & CI

**Branch:** `feat/ledger-anchoring-and-ci`

## Summary

This PR adds tamper-evident checksum + Merkle anchoring, CI hardening, security hygiene, and developer UX improvements to the Civic Protocol Core package.

## Files Added

### Anchoring Scripts
- `scripts/generate_checksum.py` - Generate SHA-256 checksums for core files
- `scripts/anchor_merkle.py` - Generate Merkle root from checksums
- `scripts/verify_anchor.py` - Verify anchor integrity

### CI/CD
- `.github/workflows/ci.yml` - Unit tests, type checks, anchor verification on PRs + nightly cron

### Security & Hygiene
- `SECURITY.md` - Security policy and reporting guidelines
- `CODEOWNERS` - Code ownership for review requirements
- `.pre-commit-config.yaml` - Pre-commit hooks (gitleaks, yamllint, etc.)

### Developer UX
- `Makefile` - One-liner commands (`make dev`, `make test`, `make anchor`, `make verify`)
- `.env.template` - Environment variable template (note: may be gitignored)

## Usage

```bash
# Generate checksums and Merkle root
make anchor

# Verify anchor integrity
make verify

# Run tests
make test

# Start development environment
make dev
```

## CI Behavior

- **On PR**: Runs tests, type checks, and anchor verification
- **Nightly**: Verifies anchor integrity via cron job
- **On Push to main**: Full CI suite

## Next Steps

1. After first merge, commit the generated `anchoring/merkle-root.txt` so subsequent PRs are checked against it
2. Optionally configure anchor publishing to public chain (requires `ANCHOR_PUBLISHER_KEY_*` secrets)

