# Technical Steering Committee (TSC)

The **Technical Steering Committee (TSC)** is the technical governance body of the Mobius Systems Foundation.

## Mandate

Steward the **technical excellence** of Mobius Systems:

1. **Architecture** - Maintain kernel minimal spec and integrity model
2. **Quality** - Ensure MII ≥ 0.95 in releases
3. **Security** - Respond to vulnerabilities, coordinate disclosures
4. **Interoperability** - Maintain open protocols and specifications

## Composition

**5 Seats** (meritocratic selection):

| Seat | Focus Area | Term | Selection |
|------|------------|------|-----------|
| 1 | Kernel architecture | 1 year | Meritocratic |
| 2 | MII/MIC protocols | 1 year | Meritocratic |
| 3 | Security/attestation | 1 year | Meritocratic |
| 4 | Developer experience | 1 year | Meritocratic |
| 5 | At-large (community) | 1 year | Community vote |

**Meritocratic Selection**: Based on technical contributions, code quality, RFC participation, and community respect.

## Responsibilities

### Technical Leadership
- Review and approve RFCs (technical aspects)
- Maintain kernel minimal specification
- Define MII/MIC protocol standards
- Set architecture direction

### Release Management
- Approve stable releases
- Enforce MII ≥ 0.95 threshold
- Sign release artifacts (Sigstore)
- Maintain release schedule

### Security
- Coordinate vulnerability disclosures
- Approve security patches
- Emergency release authority (Council notified within 48h)
- Maintain security response process

### Code Quality
- Review significant pull requests
- Set code standards and practices
- Maintain CI/CD and testing requirements
- Ensure reproducible builds

### Developer Relations
- Respond to technical questions
- Maintain developer documentation
- Support integration efforts
- Foster contributor onboarding

## Decision Process

### Voting
- **Quorum**: 3 of 5 members
- **Standard**: Simple majority (3 votes)
- **Kernel changes**: ⅔ majority (4 votes)
- **Security emergencies**: Any 2 members (ratified within 7 days)

### Lazy Consensus
For routine decisions:
- Propose on GitHub/mailing list
- **72-hour** silence = implicit approval
- Any TSC member may request formal vote

### Veto Power
TSC may **veto** any change that:
- Breaks MII measurement integrity
- Introduces security regressions
- Violates kernel minimal spec
- Harms reproducibility

Veto requires **⅔ vote** and **technical rationale** published within 48 hours.

## Meetings

### Regular
- **Frequency**: Weekly (Thursdays, 16:00 UTC)
- **Format**: Video + IRC, public attendance
- **Agenda**: Rolling GitHub project board
- **Notes**: Published within 48 hours

### Security (Private)
- **Trigger**: Undisclosed vulnerabilities
- **Attendance**: TSC + security reporters
- **Disclosure**: Per coordinated disclosure timeline
- **Council Notification**: Within 48h of emergency actions

## Transparency

### Public by Default
- Weekly meeting notes
- RFC reviews and decisions
- Release criteria and sign-offs
- Architecture decision records (ADRs)

### Private Exceptions
- Pre-disclosure security issues
- Responsible disclosure coordination
- Embargoed vulnerability details

## Term Limits

- **Term**: 1 year
- **No consecutive limits**: Can serve indefinitely if re-selected
- **Cooling-off**: Not required
- **Rationale**: Technical leadership continuity valued

## Selection Criteria

### Meritocratic Seats (1-4)
Based on **trailing 12-month contributions**:

| Criterion | Weight | Metrics |
|-----------|--------|---------|
| Code contributions | 40% | Commits, PRs, code review |
| RFC participation | 25% | RFCs authored, reviews |
| Community support | 20% | Issue triage, mentoring |
| Specification work | 15% | Protocol docs, test suites |

**Transparent scoring** published before each election.

### Community Seat (5)
- **Community vote** among active contributors
- Encourages diverse perspectives
- Not bound by meritocratic scoring

## Conflict of Interest

TSC members must **disclose**:
- Vendor employment (see Anti-Capture Policy)
- Competing project involvement
- Financial interests in Mobius ecosystem
- Consulting relationships

**Vendor Restriction**: No more than **1 TSC seat** controlled by any single vendor.

**Recusal required** for votes where conflict exists.

## Removal

A TSC member may be removed by:
- **⅔ vote** of remaining TSC members, **OR**
- **⅔ vote** of Concord Council
- **Automatic** after missing 4 consecutive meetings

Reasons:
- Code of Conduct violations
- Prolonged inactivity
- Technical negligence
- Capture attempts

## Current TSC

See [elections.md](elections.md) for current roster and upcoming elections.

## Contact

tsc@mobius.systems

**Public Office Hours**: Every other Thursday, 17:00-18:00 UTC (after meeting)

## See Also

- [Governance Overview](overview.md)
- [RFC Process](../FOUNDATION/PROCESS/RFC_PROCESS.md)
- [Release Policy](../FOUNDATION/PROCESS/RELEASE_POLICY.md)
- [Anti-Capture Policy](../FOUNDATION/POLICIES/ANTI_CAPTURE_POLICY.md)
