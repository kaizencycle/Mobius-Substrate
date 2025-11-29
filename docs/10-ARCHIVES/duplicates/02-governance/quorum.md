# Quorum and Voting Rules

Detailed rules for quorum, voting procedures, and decision-making in governance bodies.

## Quorum Requirements

### Concord Council
- **Regular decisions**: 5 of 7 members
- **Charter amendments**: 6 of 7 members
- **Veto power**: 5 of 7 members (⅔)
- **Member removal**: 5 of 7 members (⅔ of present)

**No quorum**: Meeting cancelled and rescheduled.

### Technical Steering Committee
- **Regular decisions**: 3 of 5 members
- **Kernel changes**: 4 of 5 members
- **Security emergencies**: 2 of 5 members (ratified within 7 days)
- **Veto power**: 4 of 5 members (⅔)

**No quorum**: Decision deferred to next meeting.

### Joint Decisions (Council + TSC)
- **Budget approval**: 5/7 Council + 3/5 TSC
- **Officer selection**: 5/7 Council + 3/5 TSC
- **Foundation amendments**: ⅔ of both bodies

## Voting Thresholds

| Decision Type | Council | TSC | Notes |
|---------------|---------|-----|-------|
| Standard RFC approval | Majority | Majority | Separate votes |
| Charter amendment | ⅔ (5/7) | Advisory | Council binding |
| License change | ⅔ (5/7) | ⅔ (4/5) | Both required |
| Kernel architecture | Advisory | ⅔ (4/5) | TSC binding |
| Hard fork trigger | ⅔ (5/7) | Advisory | Council binding |
| Security emergency | N/A | Any 2 | Ratified within 7d |
| Member removal | ⅔ present | ⅔ present | Either body |
| Budget | Majority | Majority | Both required |

## Voting Procedures

### Standard Process

1. **Proposal**: Published ≥7 days before vote
2. **Discussion**: Open comment period
3. **Call to vote**: Announced ≥48 hours prior
4. **Voting window**: 7 days (async)
5. **Results**: Published within 24 hours

### Abstentions

- **Counted toward quorum**: Yes
- **Counted in threshold**: No (e.g., 3 yes + 1 abstain + 1 no = 3/4 majority)
- **Must provide reason**: Encouraged but not required

### Proxy Voting

**Not allowed** for governance bodies. Members must vote directly.

**Exception**: Emergency security votes may accept written proxy if member unreachable.

## Async vs. Synchronous

### Async (Preferred)
- GitHub issue or PR comment thread
- Formal ballot via secure voting tool
- **Timeline**: 7 days to vote
- **Use for**: RFCs, policy changes, non-urgent decisions

### Synchronous (Meetings)
- Live vote during meeting
- **Timeline**: Immediate
- **Use for**: Procedural votes, meeting logistics, urgent matters

**All votes** logged in meeting notes or GitHub regardless of method.

## Recusal

Members **must recuse** from votes where they have:
- **Direct financial interest** in outcome
- **Employment conflict** (vendor decisions)
- **Personal relationship** creating bias

**Self-declaration required**. Other members may challenge and request recusal (majority vote).

**Recused members**:
- Do not count toward quorum
- May not vote
- May speak to provide context (if others consent)

## Emergency Procedures

### Security Vulnerabilities
- **TSC Authority**: Any 2 members may approve emergency patch
- **Timeline**: Immediate action authorized
- **Ratification**: Full TSC vote within 7 days (retroactive)
- **Council Notification**: Within 48 hours (private)

### Capture Threat
- **Council Authority**: ⅔ vote may trigger hard fork
- **Timeline**: 48-hour vote window (if urgent)
- **TSC Consultation**: Required but not binding
- **Public Notice**: Issued simultaneously with decision

### Infrastructure Outage
- **Admin Authority**: Foundation officers may act unilaterally
- **Scope**: Service restoration only, no policy changes
- **Reporting**: Full incident report to both bodies within 7 days

## Lazy Consensus

For **routine technical decisions** (TSC only):

- Propose on mailing list or GitHub
- **No objection for 72 hours** = approved
- Any TSC member may elevate to formal vote
- Council may request formal vote for ethical concerns

**Not applicable to**:
- Policy changes
- Kernel architecture
- Security decisions
- Anything Council flags

## Supermajority (⅔)

**When required**:
- Charter amendments (Council)
- License changes (both bodies)
- Kernel breaking changes (TSC)
- Member removal (either body)
- Veto exercise (either body)
- Hard fork trigger (Council)

**Calculation**: ⅔ of votes cast (abstentions excluded from denominator).

**Example**: 5 yes, 2 no, 1 abstain = 5/7 votes = 71% ≥ ⅔ ✓

## Deadlock Resolution

If **Council and TSC cannot agree** on joint decisions:

### Phase 1: Mediation (14 days)
- Neutral facilitator (agreed by both)
- Structured dialogue
- Goal: Consensus or compromise

### Phase 2: Community Input (14 days)
- Public RFC process
- Community feedback period
- Open discussion threads

### Phase 3: Supermajority Attempt
- ⅔ vote of **both bodies** required
- If achieved: Decision final
- If not: Phase 4

### Phase 4: Status Quo Prevails
- No change implemented
- Deadlock documented publicly
- May be revisited after 6 months

**Example**: TSC wants to change MII threshold to 0.90, Council opposes (Charter compliance). Deadlock → Status quo → Threshold remains 0.95.

## Transparency

All votes are **public record**:

```markdown
**Vote**: RFC-0042 (MII Spec Update)
**Body**: TSC
**Date**: 2025-11-08
**Quorum**: 4/5 present
**Result**: Approved (3 yes, 1 no, 0 abstain)

**Votes**:
- @alice: Yes - "Improves measurement accuracy"
- @bob: Yes
- @charlie: Yes
- @dana: No - "Needs more testing"
- @eve: [absent]
```

**Exception**: Security votes disclosed after embargo lifts.

## Vote Reversal

Decisions may be **reversed** by:
- **New vote** with same threshold as original (after ≥30 days)
- **Supermajority** of same body (⅔), immediate
- **Charter violation** declared by Council

**Not reversible**:
- Elections (serve out term or removal process)
- Irreversible actions (e.g., published releases)

## Remote Participation

All governance activities support **remote participation**:
- Video conferencing for meetings
- Async voting via secure ballots
- IRC/chat for real-time text
- Email for asynchronous discussion

**No in-person requirements**. Global participation is foundational.

## Meeting Quorum

For **meetings** (not votes):
- **Council**: 4 of 7 (majority)
- **TSC**: 3 of 5 (majority)

**Below quorum**: Meeting held as discussion-only, no binding votes.

## Record Keeping

All votes recorded in:
- **Meeting notes** (if during meeting)
- **GitHub issues/PRs** (if async)
- **Governance log** (`governance/votes/YYYY-MM-DD-topic.md`)

**Required fields**:
- Date, body, topic
- Quorum met? (Y/N)
- Vote breakdown
- Outcome
- Rationale (brief)

## Appeals

Procedural challenges may be appealed:
- **Within 7 days** of decision
- **To the other body** (Council ↔ TSC)
- **Grounds**: Quorum violated, conflict of interest not disclosed, etc.

**Review process**:
- Other body reviews procedure
- ⅔ vote to overturn
- Decision final (no further appeals)

## Questions?

governance@mobius.systems

## See Also

- [Governance Overview](overview.md)
- [Concord Council](council.md)
- [Technical Steering Committee](tsc.md)
- [Elections](elections.md)
