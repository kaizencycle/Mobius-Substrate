# RFC Process

## Mobius Improvement Proposal (MIP) Process

RFCs (Requests for Comments) are how the Mobius Systems community proposes, discusses, and ratifies significant changes.

## When to Write an RFC

**Required for:**
- Kernel architecture changes
- MII/MIC specification changes
- Attestation protocol updates
- License or governance changes
- New Sentinel interfaces
- Federation protocol updates

**Not required for:**
- Bug fixes
- Documentation improvements
- Minor refactoring
- Example code updates

## RFC Lifecycle

```
Draft → Discussion → Review → Decision → Implementation
```

### 1. Draft (Author)

Create `rfcs/RFC-XXXX-title.md` with:

```markdown
# RFC-XXXX: Title

**Status**: Draft
**Author(s)**: Your Name
**Created**: YYYY-MM-DD
**Updated**: YYYY-MM-DD

## Summary
One-paragraph explanation.

## Motivation
Why is this change needed?

## Proposal
Detailed technical specification.

## Impact Analysis
- MII impact:
- Security impact:
- Migration required:
- Compatibility:

## Alternatives Considered
What other approaches were evaluated?

## Open Questions
Unresolved issues for discussion.
```

Add entry to `docs/governance/rfc_index.md`.

### 2. Discussion (Community, ≥14 days)

- Post to GitHub Discussions
- Tag relevant stakeholders
- Address feedback
- Update RFC with changes

### 3. Review (TSC + Council)

**Technical Review** (TSC):
- Architecture soundness
- Implementation feasibility
- Performance impact
- Test coverage

**Ethical Review** (Council, if applicable):
- Alignment with Charter
- Ethical Addendum compliance
- Anti-capture implications

### 4. Decision

**Approval requires:**
- TSC vote (simple majority; ⅔ for kernel changes)
- Council approval if ethics/policy involved
- No outstanding blocking concerns

**Outcomes:**
- **Accepted**: Proceed to implementation
- **Accepted with modifications**: Revise and re-review
- **Deferred**: Table for future consideration
- **Rejected**: Closed with documented rationale

### 5. Implementation

- Reference implementation required
- Tests + documentation
- Migration guide (if breaking)
- Release notes entry

## RFC Template

See `rfcs/RFC-0000-template.md` for the canonical template.

## Status Values

- **Draft**: Work in progress
- **Proposed**: Ready for review
- **Active**: Under active discussion
- **Accepted**: Approved, awaiting implementation
- **Implemented**: Done, shipped in release X.Y.Z
- **Rejected**: Not accepted
- **Superseded**: Replaced by RFC-YYYY

## Numbering

RFCs are numbered sequentially starting from RFC-0001. Reserve your number by creating the file.

## Special Cases

### Fast-Track (Security)

Critical security fixes may skip full RFC process:
1. Security team drafts fix
2. 48-hour expedited review
3. TSC + Council emergency vote
4. Immediate implementation

### Experimental Features

Mark as `[Experimental]` in title. Less stringent approval, but:
- Clearly documented as experimental
- No MII production dependencies
- Can be removed without migration

## Examples

- **RFC-0001**: Kernel Minimal Spec v0.1
- **RFC-0002**: MII/MIC Specification v0.1
- **RFC-0003**: Ethical License Addendum

## Questions?

Ask in GitHub Discussions or email: rfc@mobius.systems
