# Elections

Governance body elections for Concord Council and Technical Steering Committee.

## Election Schedule

### Concord Council
- **Frequency**: Annual
- **Staggered**: 3 seats (odd years), 4 seats (even years)
- **Nomination Period**: 4 weeks
- **Voting Period**: 2 weeks
- **Next Election**: [TBD - Foundation not yet established]

### Technical Steering Committee
- **Frequency**: Annual (January)
- **All Seats**: Elected/selected simultaneously
- **Meritocratic Selection**: 4 seats (criteria-based)
- **Community Vote**: 1 seat
- **Next Election**: [TBD - Foundation not yet established]

## Eligibility

### Voters
To vote in Foundation elections, you must be an **active contributor**:

- ≥3 merged contributions in past 12 months, **OR**
- ≥10 substantive issue/PR comments in past 12 months, **OR**
- Attended ≥3 community meetings in past 12 months, **OR**
- Approved by Council/TSC as contributor (exceptional cases)

**Verification**: Automated via GitHub activity + manual review for edge cases.

### Candidates

#### Concord Council
- Active contributor for **≥6 months**
- No vendor affiliation (see Anti-Capture Policy)
- Not currently serving on TSC
- Accept Code of Conduct and governance responsibilities

#### TSC (Meritocratic Seats)
- Active contributor for **≥12 months**
- Significant technical contributions (see scoring criteria)
- Not in top 3 scorers may still run for community seat
- Vendor affiliation disclosed (max 1 seat per vendor)

#### TSC (Community Seat)
- Active contributor for **≥6 months**
- No technical contribution threshold
- Vendor affiliation disclosed

## Nomination Process

### Council Nominations

**Self-Nomination** (preferred):
```markdown
**Candidate**: @username
**Statement**: (max 500 words)
- Why I'm running
- Relevant experience
- Governance priorities
**Conflicts of Interest**: [disclose]
**Endorsements**: @user1, @user2 (optional)
```

**Community Nomination**: Requires candidate acceptance within 48 hours.

### TSC Nominations

**Meritocratic Seats (1-4)**: No nomination needed. Top scorers invited.

**Community Seat (5)**: Same self-nomination process as Council.

## Voting Methods

### Concord Council
**Ranked-Choice Voting** (Instant Runoff):
- Voters rank candidates 1st, 2nd, 3rd choice
- Eliminates spoiler effect
- Ensures majority support

### TSC Community Seat
**Approval Voting**:
- Vote for as many candidates as you support
- Candidate with most approvals wins
- Simple and strategic-resistant

### TSC Meritocratic Seats
**Criteria Scoring** (transparent):

| Criterion | Weight | Calculation |
|-----------|--------|-------------|
| Code contributions | 40% | git log --author + LOC + PR quality |
| RFC participation | 25% | RFCs authored/reviewed + comments |
| Community support | 20% | Issue triage + mentoring + docs |
| Specification work | 15% | Protocol specs + test coverage |

**Top 4 scorers** invited to serve. If decline, next highest invited.

**Published**: Full scoring spreadsheet released 2 weeks before selection.

## Timeline Example (Council)

| Week | Activity |
|------|----------|
| 1-4 | Nomination period (open call, self-nominations) |
| 5 | Candidate statements published |
| 6 | Community Q&A (GitHub Discussions) |
| 7-8 | Voting period (ranked-choice ballot) |
| 9 | Results announced, new term begins |

## Voter Registration

**Automatic**: If you meet active contributor criteria, you'll receive ballot link via:
- GitHub email (primary)
- Mailing list (backup)

**Manual**: If you believe you qualify but didn't receive ballot, email elections@mobius.systems with:
- GitHub username
- Evidence of contributions
- Contact email

**Deadline**: 48 hours before voting period ends.

## Ballot System

**Requirements**:
- Anonymous voting (Concord Council can't see individual votes)
- Verifiable (voters can confirm their vote was counted)
- Tamper-proof (cryptographic integrity)
- Open-source (preferably Helios or similar)

**Not Acceptable**:
- Vendor-controlled platforms (Google Forms, SurveyMonkey)
- Non-verifiable systems
- Closed-source vote tabulation

## Ties

### Concord Council
- **Runoff** between tied candidates (1-week voting period)
- If still tied: Coin flip (livestreamed, verifiable randomness)

### TSC Community Seat
- **Runoff** between tied candidates
- If still tied: Incumbent preference (if applicable), else random

### TSC Meritocratic
- **Tie in scoring**: Council + sitting TSC vote to select among tied candidates

## Recounts

Any candidate may request recount within **48 hours** of results by:
- Emailing elections@mobius.systems
- Stating specific concern (e.g., "vote totals don't match published turnout")

**Recount process**:
- Independent auditor verifies cryptographic proofs
- Results published within 7 days
- Costs borne by Foundation

## Results Publication

Within **24 hours** of voting period close:

```markdown
# [Body] Election Results - [Year]

**Turnout**: X voters (Y% of eligible)
**Elected**:
1. @winner1 - Z votes
2. @winner2 - Y votes
3. (etc.)

**Full Results**: [link to detailed breakdown]
**Cryptographic Proof**: [link to Helios verification]

**New Term Begins**: [Date]
```

## Special Elections

Triggered by:
- Seat vacated mid-term (resignation, removal)
- New seat created (governance amendment)

**Abbreviated timeline**:
- 2-week nomination
- 1-week voting
- Winner serves remainder of term

## Challenges

Disputed results may be challenged within **7 days** by:
- Filing formal objection with Council + TSC
- Providing evidence of irregularities
- Requesting independent review

**Review process**:
- Neutral third-party auditor (if possible)
- Council + TSC joint decision (⅔ of both)
- Final (no further appeals)

## Historical Results

[None yet - Foundation not established]

Elections will be documented here:
- `elections/YYYY-council.md`
- `elections/YYYY-tsc.md`

## Contact

elections@mobius.systems

**Election Administrators**: Appointed by Council + TSC at least 8 weeks before each election.

## See Also

- [Governance Overview](overview.md)
- [Concord Council](council.md)
- [Technical Steering Committee](tsc.md)
- [Anti-Capture Policy](../FOUNDATION/POLICIES/ANTI_CAPTURE_POLICY.md)
