# Security Policy

## Reporting Security Vulnerabilities

**Report vulnerabilities** to: **security@mobius.systems**

For encrypted communication, use our GPG key (available in this repository).

## Disclosure Timeline

We operate a **90-day coordinated disclosure** policy:

1. **Day 0**: Receive and acknowledge report
2. **Day 1-7**: Triage and assess severity
3. **Day 7-90**: Develop, test, and coordinate fix
4. **Day 90**: Public disclosure (coordinated with reporter)

### Critical Vulnerabilities

For critical vulnerabilities that could:
- Compromise MII integrity
- Expose user data
- Enable unauthorized access
- Bypass attestation requirements

We may trigger:
- **Accelerated releases** (< 7 days)
- **Temporary mitigations** (safe-stop procedures)
- **Emergency Council session**

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Features

Mobius Systems includes built-in security:
- **Attestation Pipeline**: All operations cryptographically signed
- **MII Gates**: Integrity threshold enforcement (≥ 0.95)
- **Safe-Stop**: Automatic rollback on integrity violations
- **Signed Releases**: Sigstore attestation for all artifacts
- **Multi-LLM Verification**: Cross-validation across providers

## Responsible Disclosure Recognition

Security researchers who responsibly disclose vulnerabilities will be:
- Credited in release notes (unless anonymity requested)
- Listed in our Security Hall of Fame
- Eligible for Mobius Integrity Credits (MIC) rewards

## Out of Scope

The following are **not** security vulnerabilities:
- Social engineering attacks on users
- Third-party integrations not maintained by Mobius
- Issues in unmaintained forks
- Expected behavior of anti-capture mechanisms

## Contact

- Email: security@mobius.systems
- GPG Key: [Link to key in repository]
- Responsible Disclosure: See `FOUNDATION/POLICIES/RESPONSIBLE_DISCLOSURE.md`
