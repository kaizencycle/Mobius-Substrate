# Release Policy

## Versioning

Mobius Systems follows **Semantic Versioning (SemVer)**:

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Incompatible API changes
- **MINOR**: Backwards-compatible functionality
- **PATCH**: Backwards-compatible bug fixes

Example: `1.2.3`

## Release Types

### Stable Releases

- **Production-ready**
- MII ≥ 0.95 in canary testing
- Full test suite passing
- Signed with Sigstore
- Published to releases page

Format: `vMAJOR.MINOR.PATCH` (e.g., `v1.0.0`)

### Pre-Releases

- **Testing/preview** versions
- May not meet full MII threshold
- For early adopters and testing

Formats:
- Alpha: `v1.0.0-alpha.1`
- Beta: `v1.0.0-beta.1`
- RC: `v1.0.0-rc.1`

### Epoch Releases

Special milestones tied to Concord Epochs:

- Format: `vMAJOR.MINOR.PATCH-epoch.N`
- Example: `v1.0.0-epoch.128`
- Represent significant governance/philosophical milestones

## Release Artifacts

Every release includes:

### Required
- **Source tarball** (`.tar.gz`)
- **Checksums** (`SHA256SUMS`)
- **Signatures** (Sigstore attestation)
- **SBOM** (Software Bill of Materials)
- **Release notes** (changelog, breaking changes)

### Optional
- Container images
- Binary distributions
- Documentation snapshots

## Release Process

### 1. Preparation

```bash
# Update version
npm version major|minor|patch

# Update CHANGELOG.md
# Run full test suite
npm test

# MII validation
# (ensure MII ≥ 0.95)
```

### 2. TSC Approval

- Simple majority vote
- Review of changes since last release
- Confirm MII threshold met

### 3. Build & Sign

```bash
# Build artifacts
npm run build

# Generate checksums
sha256sum dist/* > SHA256SUMS

# Sign with Sigstore
cosign sign-blob --bundle=signature.bundle \
  SHA256SUMS
```

### 4. Tag & Publish

```bash
# Create signed tag
git tag -s vX.Y.Z -m "Release X.Y.Z"

# Push tag
git push origin vX.Y.Z

# Publish to GitHub Releases
gh release create vX.Y.Z \
  --notes-file release-notes.md \
  dist/* SHA256SUMS signature.bundle
```

### 5. Announce

- GitHub Discussions
- Mailing list
- Social media (if applicable)
- Update website

## Security Releases

**Expedited process** for critical vulnerabilities:

1. Private fix development
2. Coordinated disclosure timeline
3. Emergency TSC vote (48 hours)
4. Accelerated release
5. Security advisory published

## Patch Releases

Backport critical fixes to supported versions:

| Version | Status | Support Level |
|---------|--------|---------------|
| 1.x.x   | Active | Full support  |
| 0.9.x   | LTS    | Security only |
| < 0.9   | EOL    | No support    |

## Release Cadence

### Regular Releases
- **Minor**: Every 6-8 weeks
- **Patch**: As needed (2-4 weeks typical)
- **Major**: Annual or when breaking changes accumulated

### Special Releases
- **Security**: Immediate (as needed)
- **Epoch**: Aligned with Concord Cycle milestones

## Rollback Policy

If a release causes:
- MII drop below 0.90
- Critical security vulnerability
- Data loss or corruption

**Immediate actions:**
1. Yank release (mark as yanked, don't delete)
2. Publish advisory
3. Expedited patch release

## Signatures & Verification

### Verify a Release

```bash
# Verify Sigstore signature
cosign verify-blob --bundle signature.bundle \
  --certificate-identity=release@mobius.systems \
  --certificate-oidc-issuer=https://github.com/login/oauth \
  SHA256SUMS

# Verify checksums
sha256sum -c SHA256SUMS
```

### Signing Keys

- **Sigstore**: Keyless signing (preferred)
- **GPG**: Maintainer keys (fallback)

Public keys: https://github.com/kaizencycle/Mobius-Systems/blob/main/KEYS

## Breaking Changes

Documented in:
- `CHANGELOG.md`
- Release notes
- Migration guide (`MIGRATION.md`)

Require:
- **RFC** for major breaking changes
- **Deprecation warnings** in prior minor release
- **Migration tooling** where feasible

## Release Notes Template

```markdown
# Release vX.Y.Z

**Released**: YYYY-MM-DD
**MII Baseline**: 0.XXX

## Highlights
- Major feature A
- Important fix B

## Breaking Changes
- Change 1 (RFC-XXXX)

## Features
- Feature 1 (#123)

## Bug Fixes
- Fix 1 (#456)

## Security
- CVE-YYYY-XXXX fixed

## Contributors
Thanks to: @user1, @user2

## Verification
SHA256: abc123...
Sigstore Bundle: [link]
```

## Contact

release-team@mobius.systems
