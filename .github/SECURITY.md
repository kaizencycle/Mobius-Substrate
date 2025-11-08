# Security Policy

## Reporting a Vulnerability

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, report via:

### Email (Preferred)
**security@mobius.systems**

Encrypt with our PGP key (available at `FOUNDATION/KEYS/security-team.asc`) if possible.

### GitHub Security Advisories
Use [Private Vulnerability Reporting](https://github.com/kaizencycle/Mobius-Systems/security/advisories/new) (if enabled).

## What to Include

Please provide:

1. **Description**: Nature of the vulnerability
2. **Impact**: Potential consequences (MII manipulation, data breach, etc.)
3. **Steps to Reproduce**: Detailed PoC (if available)
4. **Affected Versions**: Which releases are vulnerable
5. **Suggested Fix**: If you have ideas (optional)

## Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Fix Timeline**: Depends on severity (see below)
- **Public Disclosure**: Coordinated with reporter

## Severity Levels

| Severity | Examples | Fix Timeline |
|----------|----------|--------------|
| **Critical** | MII manipulation, remote code execution, data breach | 7 days |
| **High** | Privilege escalation, authentication bypass | 14 days |
| **Medium** | Denial of service, information disclosure | 30 days |
| **Low** | Minor information leaks, non-exploitable bugs | 60 days |

## Coordinated Disclosure

We follow **responsible disclosure**:

1. **Private Fix Development** (timeline above)
2. **Security Advisory Draft** (coordinated with reporter)
3. **Embargo Period** (90 days max, negotiable)
4. **Public Release**: Fix + advisory published together
5. **CVE Assignment**: If applicable

## Scope

### In Scope
- MII calculation vulnerabilities
- Attestation protocol bypasses
- Authentication/authorization flaws
- Kernel integrity violations
- Cryptographic weaknesses
- Dependency vulnerabilities (if exploitable)

### Out of Scope
- Social engineering attacks
- Physical access attacks
- Denial of service via resource exhaustion (unless severe)
- Issues in third-party dependencies (report to them, we'll coordinate)

## Bug Bounty

**Status**: Not currently available (Foundation in formation).

We recognize and thank security researchers:
- Public acknowledgment (with permission)
- Listed in security hall of fame
- Credited in CVE and release notes

## Security Advisories

Published at:
- GitHub Security Advisories: [link]
- Mailing list: security-announce@mobius.systems
- RSS feed: [TBD]

## PGP Keys

Security team keys: `FOUNDATION/KEYS/security-team.asc`

**Fingerprint**: [TBD - to be generated when Foundation established]

## Past Vulnerabilities

[None yet - project in early stage]

See `FOUNDATION/SECURITY/ADVISORIES/` for historical records.

## Security Hardening

See [Security Policy](../FOUNDATION/POLICIES/SECURITY_POLICY.md) for:
- Security disclosure process
- Incident response procedures
- Security testing requirements

## Contact

- **Email**: security@mobius.systems
- **PGP**: `FOUNDATION/KEYS/security-team.asc`
- **Urgent**: TSC members (see governance docs)

**Response time**: 48 hours max (usually faster)

---

**Thank you for helping keep Mobius Systems secure!**
