# ZEUS Policy Rules

**ZEUS enforces policy automatically. No exceptions without audit trail.**

---

## Hard Rules (Non-Negotiable)

These rules cannot be bypassed under any circumstances:

### Production Deployment
- No production deploy without EPICON intent declaration
- All deployments require explicit approval token
- Rollback plan must be documented before deploy
- Post-deployment verification required within 1 hour

### Ledger Integrity
- No ledger schema change without steward approval
- All ledger writes are immutable
- Schema migrations require simulation test
- No backdating or modification of existing entries

### MIC Logic
- No MIC mint/burn logic changes without simulation tests
- All MIC operations require audit trail
- Economic parameter changes require council review
- Emergency MIC actions require post-action audit

### Security Boundaries
- Threshold breach triggers circuit breaker automatically
- Unauthorized changes are rejected without manual review
- Security escalations bypass normal queue
- Kill switch always available to custodian + Zeus

---

## Soft Rules (Strongly Encouraged)

These rules guide behavior but may be adjusted with documented reasoning:

### Development Practices
- "No shame rollback culture" — reversing mistakes is not failure
- "Test-first for integrity math" — critical calculations need tests before implementation
- "Docs or it doesn't exist" — undocumented features are incomplete
- "Friction is contribution" — reviews and challenges improve outcomes

### Review Standards
- PRs should be reviewable in one sitting (< 400 lines)
- Complex changes should be broken into logical commits
- Intent should be clear from PR title and description
- Tests should demonstrate expected behavior

---

## Risk Gate Requirements

### Tier 0: Documentation and Formatting
```yaml
requirements:
  - reviewers: 1
  - tests: not_required
  - benchmarks: not_required
  - rollback_plan: not_required
merge_speed: fast
```

### Tier 1: Application Code
```yaml
requirements:
  - reviewers: 1 (maintainer)
  - tests: required
  - benchmarks: optional
  - rollback_plan: not_required
merge_speed: standard
```

### Tier 2: Auth, Ledger, Integrity Math
```yaml
requirements:
  - reviewers: 2 (including steward)
  - tests: required
  - benchmarks: required
  - rollback_plan: recommended
  - changelog_entry: required
merge_speed: careful
```

### Tier 3: MIC, Consensus, Production Ops
```yaml
requirements:
  - reviewers: steward + human approval token
  - tests: required
  - benchmarks: required
  - rollback_plan: required
  - simulation_test: required
  - threat_model_link: required
  - council_notification: required
merge_speed: deliberate
```

---

## Threshold Enforcement

### Mobius Integrity Index (MII)
- **Standard threshold**: MII ≥ 0.95
- **Warning zone**: 0.90 ≤ MII < 0.95
- **Breach zone**: MII < 0.90

### Circuit Breaker Triggers
When MII drops below 0.90:
1. New non-critical merges paused
2. Council notification sent
3. Incident response initiated
4. Root cause analysis required
5. Recovery plan documented

### Recovery Requirements
- Identify contributing factors
- Document lessons learned
- Implement preventive measures
- Council sign-off on recovery
- MII must return to ≥ 0.95

---

## Scope Containment

### PR Scope Rules
- PRs must not exceed declared scope
- Scope creep triggers divergence flag
- Cross-scope changes require explicit intent evolution
- Intent evolution requires supersedes_hash reference

### Auto-Rejection Triggers
- Undeclared scope expansion
- Test failures without explanation
- MII degradation without mitigation
- Missing required approvals
- Expired intent declarations

---

## Audit and Compliance

### Continuous Monitoring
- All ZEUS decisions are logged
- Policy violations are recorded
- Threshold breaches trigger alerts
- Pattern analysis runs weekly

### Review Cadence
- Weekly: Policy effectiveness review
- Monthly: Threshold calibration
- Quarterly: Full policy audit
- Annual: External assessment

---

## Policy Evolution

### Proposing Changes
1. Submit RFC with reasoning
2. 72-hour comment period
3. Council review
4. EPICON intent for implementation
5. Gradual rollout with monitoring

### Emergency Policy Changes
1. Custodian + Zeus approval
2. Immediate implementation
3. 24-hour post-action audit
4. Council review within 7 days
5. Public documentation

---

## Related Documents

- [GOVERNANCE.md](./GOVERNANCE.md) - Governance framework
- [EPICON_INTENTS.md](./EPICON_INTENTS.md) - Intent system
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [SECURITY.md](../SECURITY.md) - Security policy

---

*"ZEUS enforces policy automatically." — Mobius Substrate*
