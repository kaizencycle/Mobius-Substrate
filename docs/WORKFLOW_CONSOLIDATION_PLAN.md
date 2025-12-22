# Workflow Consolidation Plan — EPICON Era

**Cycle:** C-177  
**Date:** December 22, 2025  
**Status:** Approved for Implementation

---

## Executive Summary

With EPICON-1, 2, and 3 operational, we can consolidate **41 workflows → ~20 workflows** by eliminating redundancy and routing operations through EPICON layers.

**Key Benefits:**
- 50% reduction in workflow complexity
- All operations route through EPICON layers
- Clear responsibility boundaries
- Easier to maintain and debug

---

## Current Workflow Inventory

### Total: 41 workflows in `.github/workflows/`

```
agent-ci.yml              atlas-sentinel.yml       atlas-sync.yml
attest-proof.yml          attestation.yml          ci.yml
codeql.yml                codex-ci.yml             consensus-gate.yml
cycle-attest.yml          drift-compliance.yml     epicon03-consensus.yml
fountain-attest.yml       gi-attest.yml            guardian.yml
kaizen-sync.yml           mcp-enforcer.yml         mii-gate.yml
mkdocs-pages.yml          mobius-auto-consensus-label.yml
mobius-divergence-dashboard.yml                    mobius-merge-gate.yml
mobius-operator-merge.yml                          mobius-pr-bot.yml
mobius-pulse-nightly.yml                           monorepo.yml
opencode-ci.yml           ping-atlas.yml           pr-sr-comment.yml
preview-autowire.yml      publish-sr.yml           security-audit.yml
sentinel-heartbeat.yml    sentinel-validate.yml    sigstore-attest.yml
sr-merge-gate.yml         sr-pr-footer.yml         update-badges.yml
uriel-smoke.yml           weekly-digest.yml        anti-nuke.yml
```

---

## Phase 1: Immediate Deletions (Safe to Remove)

These workflows are **fully superseded by EPICON**:

### Attestation Workflows (EPICON-2 handles)

| Workflow | Reason for Deletion |
|----------|---------------------|
| `attest-proof.yml` | EPICON-2 handles all attestations via ledger-api |
| `attestation.yml` | Redundant with EPICON-2 attestation flow |
| `cycle-attest.yml` | Cycle attestations now in ledger-api |
| `fountain-attest.yml` | Fountain attestations merged into EPICON-2 |
| `gi-attest.yml` | GI attestation now part of mobius-merge-gate.yml |

### Redundant Gates (EPICON-3 handles)

| Workflow | Reason for Deletion |
|----------|---------------------|
| `consensus-gate.yml` | Replaced by epicon03-consensus.yml |
| `mii-gate.yml` | MII validation now in mobius-merge-gate.yml |

### Redundant Sentinel Checks (EPICON-1 handles)

| Workflow | Reason for Deletion |
|----------|---------------------|
| `atlas-sentinel.yml` | Merged into sentinel-heartbeat.yml |
| `sentinel-validate.yml` | Validation handled by integrity-core |

**Total Phase 1 Deletions:** 9 workflows

### Deletion Commands

```bash
git rm .github/workflows/attest-proof.yml
git rm .github/workflows/attestation.yml
git rm .github/workflows/cycle-attest.yml
git rm .github/workflows/fountain-attest.yml
git rm .github/workflows/gi-attest.yml
git rm .github/workflows/consensus-gate.yml
git rm .github/workflows/mii-gate.yml
git rm .github/workflows/atlas-sentinel.yml
git rm .github/workflows/sentinel-validate.yml

git commit -m "chore(ci): Remove workflows superseded by EPICON"
```

---

## Phase 2: Consolidate Into Unified Workflows

### A. Unified Attestation → `epicon-attest-unified.yml`

**Consolidate:**
- `sigstore-attest.yml`
- `publish-sr.yml`

**New workflow design:**

```yaml
name: EPICON Attestation (Unified)
on: 
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  attest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Generate attestation payload
        run: |
          echo '{"event": "ci_push", "sha": "${{ github.sha }}", "ref": "${{ github.ref }}"}' > attestation.json
      
      - name: Route through EPICON-2
        run: |
          curl -X POST ${{ secrets.LEDGER_API_URL }}/attest \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.EPICON_TOKEN }}" \
            -d @attestation.json
      
      - name: Sigstore signing (if release)
        if: startsWith(github.ref, 'refs/tags/')
        uses: sigstore/cosign-action@v3
        with:
          image: ${{ env.IMAGE_NAME }}
```

---

### B. Unified Sentinel Monitor → `sentinel-monitor-unified.yml`

**Consolidate:**
- `sentinel-heartbeat.yml`
- `agent-ci.yml`
- `ping-atlas.yml`

**New workflow design:**

```yaml
name: Sentinel Monitor (Unified)
on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Check all sentinels via EPICON-1
        run: |
          SENTINELS="atlas aurea eve jade hermes"
          for sentinel in $SENTINELS; do
            echo "Checking $sentinel..."
            curl -sf "${{ secrets.INTEGRITY_CORE_API }}/sentinel/$sentinel/health" || echo "Warning: $sentinel unhealthy"
          done
      
      - name: Aggregate health report
        run: |
          curl -X POST "${{ secrets.LEDGER_API_URL }}/attest" \
            -H "Content-Type: application/json" \
            -d '{"event": "sentinel_health_check", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
```

---

### C. Unified Merge Gate → `mobius-merge-gate-unified.yml`

**Consolidate:**
- `mobius-merge-gate.yml` (keep and expand)
- `sr-merge-gate.yml` (delete)
- `mcp-enforcer.yml` (delete)

**Keep:** `mobius-merge-gate.yml` already handles:
- MII validation (≥ 0.95)
- EPICON-3 consensus check
- Anti-nuke protection
- Required status checks

**Deletions:**

```bash
git rm .github/workflows/sr-merge-gate.yml
git rm .github/workflows/mcp-enforcer.yml
```

---

### D. Unified PR Assistant → `mobius-pr-assistant.yml`

**Consolidate:**
- `mobius-pr-bot.yml`
- `pr-sr-comment.yml`
- `sr-pr-footer.yml`

**New workflow design:**

```yaml
name: Mobius PR Assistant (Unified)
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  assist:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read
    
    steps:
      - uses: actions/checkout@v4
      
      - name: EPICON-2 intent check
        id: intent
        run: |
          RESULT=$(curl -sf "${{ secrets.BROKER_API_URL }}/intent-check" \
            -H "Content-Type: application/json" \
            -d '{"pr": ${{ github.event.pull_request.number }}}')
          echo "result=$RESULT" >> $GITHUB_OUTPUT
      
      - name: Post consensus result
        uses: actions/github-script@v7
        with:
          script: |
            const result = '${{ steps.intent.outputs.result }}';
            const body = `## 🌀 EPICON-3 Consensus

**MII Score:** ${result.mii || 'Pending'}
**Consensus:** ${result.consensus || 'Awaiting review'}

---
*Automated by Mobius PR Assistant*`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: body
            });
```

---

### E. Unified Sync → `mobius-sync-unified.yml`

**Consolidate:**
- `kaizen-sync.yml`
- `atlas-sync.yml`

**New workflow design:**

```yaml
name: Mobius Sync (Unified)
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Sync all federated nodes
        run: |
          # Sync ATLAS state
          curl -X POST "${{ secrets.ATLAS_SYNC_URL }}/sync" \
            -H "Authorization: Bearer ${{ secrets.SYNC_TOKEN }}"
          
          # Sync Kaizen cycle metadata
          curl -X POST "${{ secrets.LEDGER_API_URL }}/sync/cycle" \
            -H "Authorization: Bearer ${{ secrets.SYNC_TOKEN }}"
      
      - name: Update local manifests
        run: |
          npm run sync:manifests || true
```

---

### F. Unified Telemetry → `mobius-pulse-unified.yml`

**Consolidate:**
- `mobius-pulse-nightly.yml` (keep and expand)
- `update-badges.yml` (merge in)
- `weekly-digest.yml` (merge in)

**Expansion to existing workflow:**

```yaml
name: Mobius Pulse (Unified)
on:
  schedule:
    - cron: '0 0 * * *'    # Daily pulse
    - cron: '0 6 * * 1'    # Weekly digest on Mondays
  workflow_dispatch:

jobs:
  pulse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Generate system pulse
        run: npm run pulse:generate
      
      - name: Update badges
        run: npm run badges:update
      
      - name: Generate weekly digest (Monday only)
        if: github.event.schedule == '0 6 * * 1'
        run: npm run digest:weekly
      
      - name: Commit updates
        run: |
          git config user.name "mobius-bot"
          git config user.email "bot@mobius.systems"
          git add .badges/ .gi/
          git commit -m "chore: Update pulse and badges [skip ci]" || true
          git push
```

---

## Phase 3: Workflows Requiring Clarification

| Workflow | Question | Recommendation |
|----------|----------|----------------|
| `drift-compliance.yml` | Different from `mobius-divergence-dashboard.yml`? | **Keep both** - drift-compliance is real-time, divergence is periodic dashboard |
| `guardian.yml` | Role vs `sentinel-heartbeat.yml`? | **Review** - may be redundant with unified sentinel monitor |
| `uriel-smoke.yml` | Different from general sentinel validation? | **Keep** - URIEL has specific xAI integration tests |
| `monorepo.yml` | Purpose vs `ci.yml`? | **Keep both** - monorepo handles workspace coordination, ci handles tests |
| `preview-autowire.yml` | Still needed with EPICON routing? | **Keep** - Vercel preview deployments still useful |
| `opencode-ci.yml` | Active usage? | **Review** - check last run date, may be deprecated |
| `mkdocs-pages.yml` | Documentation publishing? | **Keep** - essential for docs site |
| `security-audit.yml` | Different from `codeql.yml`? | **Keep both** - security-audit is dependency scanning, codeql is code analysis |
| `codex-ci.yml` | Active? Related to Codex policy? | **Review** - check activity, may be deprecated |

---

## Recommended Final Workflow Structure

```
.github/workflows/
├─ Core CI/CD
│  ├─ ci.yml                           # Main build/test
│  ├─ monorepo.yml                     # Workspace coordination
│  ├─ codeql.yml                       # Security scanning
│  └─ anti-nuke.yml                    # Repository protection
│
├─ EPICON Integration
│  ├─ epicon03-consensus.yml           # Multi-agent consensus
│  ├─ epicon-attest-unified.yml        # All attestations
│  └─ mobius-merge-gate.yml            # Pre-merge integrity
│
├─ PR Automation
│  ├─ mobius-pr-assistant.yml          # All PR comments/checks
│  └─ mobius-auto-consensus-label.yml  # Auto-labeling
│
├─ Monitoring
│  ├─ sentinel-monitor-unified.yml     # All sentinel health
│  ├─ mobius-pulse-unified.yml         # Nightly telemetry + badges
│  └─ mobius-divergence-dashboard.yml  # Integrity drift tracking
│
├─ Sync & Deployment
│  ├─ mobius-sync-unified.yml          # Federated sync
│  ├─ mobius-operator-merge.yml        # Operator-level merges
│  └─ preview-autowire.yml             # Vercel previews
│
└─ Special Purpose
   ├─ mkdocs-pages.yml                 # Docs publishing
   ├─ security-audit.yml               # Dependency scanning
   ├─ drift-compliance.yml             # Real-time drift checks
   └─ uriel-smoke.yml                  # URIEL-specific tests
```

**Total: ~20 workflows** (down from 41)

---

## Migration Strategy

### Week 1: Delete Safe Workflows (Phase 1)

```bash
# Delete 9 EPICON-superseded workflows
git checkout -b chore/workflow-consolidation-phase1
git rm .github/workflows/{attest-proof,attestation,cycle-attest,fountain-attest,gi-attest,consensus-gate,mii-gate,atlas-sentinel,sentinel-validate}.yml
git commit -m "chore(ci): Phase 1 - Remove workflows superseded by EPICON"
git push origin chore/workflow-consolidation-phase1
# Create PR, get approval, merge
```

### Week 2: Create Unified Workflows (Phase 2)

```bash
git checkout -b chore/workflow-consolidation-phase2

# Create new consolidated workflows
# (Use templates above)

# Delete redundant workflows being replaced
git rm .github/workflows/sr-merge-gate.yml
git rm .github/workflows/mcp-enforcer.yml
git rm .github/workflows/pr-sr-comment.yml
git rm .github/workflows/sr-pr-footer.yml
git rm .github/workflows/atlas-sync.yml
git rm .github/workflows/kaizen-sync.yml
git rm .github/workflows/agent-ci.yml
git rm .github/workflows/ping-atlas.yml
git rm .github/workflows/update-badges.yml
git rm .github/workflows/weekly-digest.yml
git rm .github/workflows/publish-sr.yml
git rm .github/workflows/sigstore-attest.yml

git commit -m "chore(ci): Phase 2 - Create unified workflows"
git push origin chore/workflow-consolidation-phase2
# Create PR, get approval, merge
```

### Week 3: Test and Validate

- Run all new workflows in parallel with monitoring
- Verify EPICON routing works correctly
- Check no regressions in CI/CD
- Monitor for any failed runs or missing triggers

### Week 4: Final Cleanup

```bash
git checkout -b chore/workflow-consolidation-final

# Delete any remaining redundant workflows identified during testing
# Update documentation
# Update README references to workflows

git commit -m "chore(ci): Complete workflow consolidation for EPICON era"
git push origin chore/workflow-consolidation-final
# Create PR, get approval, merge
```

---

## Success Metrics

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Total workflows | 41 | ~20 | -51% |
| Attestation workflows | 6 | 1 | -83% |
| Gate workflows | 4 | 1 | -75% |
| Sync workflows | 2 | 1 | -50% |
| PR automation workflows | 3 | 1 | -67% |
| EPICON-routed | 0% | 100% | +100% |

---

## Risk Mitigation

### Rollback Plan

If any consolidated workflow fails:

1. **Immediate:** Re-enable deleted workflow from git history
   ```bash
   git checkout HEAD~1 -- .github/workflows/<workflow>.yml
   git commit -m "revert: Re-enable <workflow> due to consolidation issue"
   ```

2. **Short-term:** Create issue to investigate failure

3. **Long-term:** Adjust unified workflow to handle edge case

### Testing Checklist

Before each phase:
- [ ] All current workflows pass on main branch
- [ ] No pending PRs depend on workflows being deleted
- [ ] EPICON endpoints are healthy
- [ ] Backup of workflow files exists locally

After each phase:
- [ ] CI/CD pipeline still functional
- [ ] PRs can be merged
- [ ] Attestations are being recorded
- [ ] Sentinel health checks pass
- [ ] Badges update correctly

---

## Appendix: Workflow Dependencies

### EPICON-1 (integrity-core)
- `mobius-merge-gate.yml` → validates MII
- `sentinel-monitor-unified.yml` → checks sentinel health

### EPICON-2 (ledger-api)
- `epicon-attest-unified.yml` → writes attestations
- `mobius-pulse-unified.yml` → records pulse data

### EPICON-3 (broker-api)
- `epicon03-consensus.yml` → multi-agent deliberation
- `mobius-pr-assistant.yml` → intent checking

---

*Prepared by: ATLAS  
Cycle: C-177  
Date: December 22, 2025  
Status: Approved for Implementation*
