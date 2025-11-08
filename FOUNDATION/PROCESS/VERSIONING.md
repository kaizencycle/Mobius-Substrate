# Versioning

## Code Versioning (SemVer)

Mobius Systems uses **Semantic Versioning 2.0.0**:

```
MAJOR.MINOR.PATCH[-prerelease][+build]
```

### Examples
- `1.0.0` - Stable release
- `1.2.3` - Minor update with patches
- `2.0.0-beta.1` - Major version beta
- `1.0.0+20251108` - Build metadata

### Incrementing Rules

**MAJOR** version when:
- Incompatible API changes
- Kernel architecture redesign
- Breaking changes to MII/MIC
- Attestation protocol incompatibilities

**MINOR** version when:
- Backwards-compatible new features
- New Sentinel interfaces
- Non-breaking enhancements
- Deprecations (with warnings)

**PATCH** version when:
- Backwards-compatible bug fixes
- Security patches (non-breaking)
- Documentation corrections
- Performance improvements

## Specification Versioning (SpecVer)

Specifications use a different scheme:

```
S{major}.{minor}
```

### Examples
- `S1.0` - MII Spec v1.0
- `S2.1` - Kernel Spec v2.1
- `S1.2` - Attestation Protocol v1.2

### When to Increment

**Major** (S1 → S2):
- Fundamental redesign
- Breaking protocol changes
- New integrity model

**Minor** (S1.0 → S1.1):
- Backwards-compatible additions
- Clarifications
- Optional extensions

## API Versioning

REST APIs use versioned paths:

```
/api/v1/attestations
/api/v2/mii/current
```

### Deprecation Policy

1. **Announce**: Deprecation notice in release notes
2. **Grace Period**: Minimum 2 minor versions
3. **Warn**: Return deprecation headers
4. **Remove**: In next major version

### Example
```
v1.5.0 - API v1 active, v2 announced
v1.6.0 - API v1 deprecated warnings
v1.7.0 - API v1 still supported
v2.0.0 - API v1 removed, v2 only
```

## Container Image Versioning

Docker images tagged with:

```
ghcr.io/kaizencycle/mobius-systems:latest
ghcr.io/kaizencycle/mobius-systems:1.2.3
ghcr.io/kaizencycle/mobius-systems:1.2
ghcr.io/kaizencycle/mobius-systems:1
```

**Recommendations:**
- **Production**: Pin to full version (`1.2.3`)
- **Staging**: Use minor version (`1.2`)
- **Development**: Use `latest` (with caution)

## Helm Chart Versioning

Charts version independently from app:

```yaml
# Chart.yaml
apiVersion: v2
name: mobius-systems
version: 0.5.0        # Chart version
appVersion: "1.2.3"   # Mobius version
```

**Chart version** increments when chart logic changes.
**App version** tracks Mobius release.

## Dependency Versioning

### Lockfiles
- `package-lock.json` (Node.js)
- `Cargo.lock` (Rust)
- `go.sum` (Go)

**Always committed** to ensure reproducible builds.

### Range Specifications

```json
{
  "dependencies": {
    "exact": "1.2.3",
    "patch": "~1.2.3",    // >=1.2.3 <1.3.0
    "minor": "^1.2.3",    // >=1.2.3 <2.0.0
    "any": "*"            // Avoid in production
  }
}
```

**Recommended**: Use `^` for libraries, exact for applications.

## Database Schema Versioning

Migrations numbered sequentially:

```
migrations/
  001_initial_schema.sql
  002_add_attestations.sql
  003_mii_tracking.sql
```

**Never modify past migrations** - always add new ones.

## Version Compatibility Matrix

| Mobius | MII Spec | Kernel Spec | API |
|--------|----------|-------------|-----|
| 1.0.x  | S1.0     | S1.0        | v1  |
| 1.1.x  | S1.0     | S1.0        | v1  |
| 1.2.x  | S1.1     | S1.0        | v1  |
| 2.0.x  | S2.0     | S2.0        | v2  |

## Epoch Versioning

Concord Epochs are independent cycle markers:

- **Cycle**: C-127, C-128, etc.
- **Epoch**: Long-term governance periods
- **Not tied to code versions**

May be referenced in tags:
```
v1.0.0-epoch.128
```

## Pre-release Identifiers

**Alpha**: Early testing, unstable
```
v1.0.0-alpha.1
v1.0.0-alpha.2
```

**Beta**: Feature complete, testing
```
v1.0.0-beta.1
v1.0.0-beta.2
```

**RC**: Release candidate, final testing
```
v1.0.0-rc.1
v1.0.0-rc.2
```

## Build Metadata

Optional, for tracking builds:
```
v1.0.0+20251108.abc123
v1.0.0+ci.456
```

**Not considered** in version precedence.

## Version Precedence

SemVer ordering:
```
1.0.0-alpha < 1.0.0-beta < 1.0.0-rc.1 < 1.0.0 < 1.0.1 < 1.1.0 < 2.0.0
```

## Checking Current Version

```bash
# CLI
mobius --version

# Package
cat package.json | jq .version

# API
curl https://api.mobius.systems/version
```

## Version Update Checklist

When releasing:
- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md`
- [ ] Create git tag
- [ ] Update API docs if API changed
- [ ] Update compatibility matrix
- [ ] Announce deprecations (if any)

## References

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- Mobius Release Policy: `FOUNDATION/PROCESS/RELEASE_POLICY.md`
