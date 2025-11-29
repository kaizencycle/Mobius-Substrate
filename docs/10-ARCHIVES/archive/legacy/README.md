# Legacy Documentation Sets

The `archive/legacy/` tree keeps the _pre-numbered_ documentation folders exactly as they existed before the November 2025 re-organization. Every file here still builds, but the **canonical** copies now live inside the numbered collections (`01–09`).

Use this directory when you need to diff historical drafts or recover wording that was replaced during the cleanup. For day-to-day work, update the active locations listed below.

## Directory Map

| Legacy Path | Active Home | Notes |
|-------------|-------------|-------|
| `architecture/` | `../03-architecture/technical/` + `../03-architecture/ARCHITECTURE.md` | Old flat layout for system blueprints |
| `adr/` | `../03-architecture/adr/` | Copies of ADR-001 / ADR-002 before consolidation |
| `governance/` | `../02-governance/` | Prior versions of council/TSC docs (Sentinel Constitution now in `02-` as well) |
| `deployment/` | `../09-reports/implementation/` + `../08-processes/operations/` | Status reports + rollout playbooks migrated into reports/processes |
| `operations/`, `ops/` | `../08-processes/operations/` | Duplicate checklists and SLA policies |
| `runbooks/` | `../08-processes/runbooks/` | Incident response playbooks (Citizen Shield, etc.) |
| `reports/`, `cycles/`, `communications/`, `PRs/` | `../09-reports/` | Cycle briefs, comms, PR summaries now nested under `09` |
| `whitepaper/` | `../01-whitepapers/archive/` | Legacy intention compiler + civilization layer drafts |
| `ktt/` | `../05-research/ktt/` | Early Kaizen Turing Test manuscripts (active set lives in Research) |

Empty folders (`deployment/`, `ops/`, `PRs/`, `reports/`) are retained to preserve git history—do not delete them so rename tracking remains intact.

## Usage Guidelines

1. **Do not edit legacy copies.** Make changes in the active directories and keep this folder read-only.
2. **Link forward.** When referencing legacy docs, add a note pointing contributors to the modern location.
3. **Archive new duplicates here.** If you discover another pre-numbered directory, move it into `archive/legacy/` and update this README.

_Last updated: 2025-11-17_
