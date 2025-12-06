# Operations

Running Mobius Systems in production.

**This folder is for operators, SREs, and infrastructure teams.**

---

## Contents

Operational documentation (to be populated in Phase 2):

### `deployment/`
- `render-deployment.md` — Deploying to Render (current platform)
- `docker-compose.md` — Local development with Docker
- `kubernetes.md` — Kubernetes deployment (future)
- `multi-region.md` — Geographic distribution
- `canary-releases.md` — Safe deployment strategies

### `monitoring/`
- `sentinel-health-metrics.md` — AI agent monitoring
- `mii-tracking.md` — Integrity score dashboards
- `alerting.md` — Alert rules and escalation
- `dashboards.md` — Grafana/Prometheus setup
- `log-aggregation.md` — Centralized logging

### `maintenance/`
- `backup-restore.md` — Data protection procedures
- `upgrades.md` — Version migration guides
- `scaling.md` — Horizontal and vertical scaling
- `database-management.md` — Ledger maintenance
- `certificate-renewal.md` — TLS certificate management

### `runbooks/`
- `service-restart.md` — Safely restarting services
- `database-recovery.md` — Civic Ledger recovery
- `network-issues.md` — Troubleshooting connectivity
- `performance-degradation.md` — Response time issues
- `disk-space.md` — Storage management

---

## Service Overview

Mobius runs as a distributed system with multiple services:

### Frontend Services (Ports 3000-3007)
- `website-creator` (3000) — .gic Website Creator
- `aurea-site` (3001) — AUREA Founding Agent Site
- `portal` (3002) — Main portal interface
- `hub-web` (3004) — OAA Central Hub
- `hive-app` (3005) — Citizen collaboration
- `genesisdome-app` (3006) — Genesis Dome PWA
- `citizen-shield-app` (3007) — Security interface

### Backend Services (Ports 4001-4005)
- `ledger-api` (4001) — Mobius Ledger Core
- `indexer-api` (4002) — MIC Indexer
- `eomm-api` (4003) — E.O.M.M. Reflections
- `shield-api` (4004) — Citizen Shield
- `broker-api` (4005) — Thought Broker

See [`FRONTEND_DEVELOPMENT.md`](../04-guides/developers/FRONTEND_DEVELOPMENT.md) for complete port assignments.

---

## Health Checks

All services expose standard health endpoints:

```bash
# Basic health check
GET /healthz

# Mobius integrity verification
GET //api/integrity-check

# Thought Broker specific
GET /v1/loop/health
```

**Health Check Requirements:**
- Response time < 100ms
- HTTP 200 status
- Valid JSON response
- GI score included (must be ≥ 0.95)

---

## Starting Services

### Local Development

```bash
# Using Docker Compose
npm run compose:up

# View logs
docker compose -f infra/docker/compose.yml logs -f

# Stop services
npm run compose:down
```

### Production (Render)

Services auto-deploy via GitHub Actions when:
1. PR merged to `main`
2. CI passes (lint, type-check, tests)
3. Integrity gates pass (MII ≥ 0.95)
4. Changes detected in service path

See `infra/render.yaml` for service definitions.

---

## Monitoring & Alerting

### Key Metrics

**System Health:**
- Service uptime (target: 99.9%)
- Response time (p50, p95, p99)
- Error rate (target: <0.1%)
- CPU/Memory utilization

**Integrity Metrics:**
- Global Integrity (GI) score
- Mobius Integrity Index (MII)
- Sentinel health scores
- Deliberation success rate

**Business Metrics:**
- MIC minting rate
- Active citizens
- Proposals processed
- ECHO validations completed

### Alert Thresholds

| Condition | Severity | Action |
|-----------|----------|--------|
| GI < 0.95 | 🔴 Critical | Halt automation, human review |
| GI < 0.97 | 🟡 Warning | Investigate, sentinel review |
| Service down >5min | 🔴 Critical | Page on-call |
| Response time >1s | 🟡 Warning | Check load, scale if needed |
| Error rate >1% | 🟡 Warning | Review logs, identify cause |
| Disk >80% | 🟡 Warning | Clean logs, expand storage |

---

## Scaling Guidelines

### Horizontal Scaling

**When to scale out:**
- CPU consistently >70%
- Response time p95 >500ms
- Queue depth growing
- Multiple concurrent DVA flows

**How to scale:**
1. Increase replica count in `render.yaml`
2. Deploy via PR to `main`
3. Monitor for 24 hours
4. Adjust based on metrics

### Vertical Scaling

**When to scale up:**
- Memory pressure (OOM errors)
- Single-threaded bottlenecks
- Database query performance

**How to scale:**
1. Update instance type in `render.yaml`
2. Schedule maintenance window
3. Deploy and monitor

---

## Backup & Recovery

### What We Back Up

- **Civic Ledger** — All attestations, blocks (daily)
- **MIC Balances** — Integrity credit state (daily)
- **Configuration** — Service configs, secrets (on change)
- **Bio-DNA** — User identity manifests (on write)

### Backup Schedule

```
Daily:   03:00 UTC — Full backup
Hourly:  :00 — Incremental ledger backup
Weekly:  Sunday 00:00 UTC — Archive backup
Monthly: 1st of month — Long-term storage
```

### Recovery Testing

- **Weekly:** Restore test to staging
- **Monthly:** Full disaster recovery drill
- **Quarterly:** Cross-region failover test

See [`maintenance/backup-restore.md`](./maintenance/backup-restore.md) for procedures.

---

## Incident Response

When things go wrong:

1. **Detect** — Alerts, monitoring, user reports
2. **Assess** — Severity, impact, affected services
3. **Respond** — Follow runbook, engage team
4. **Communicate** — Status updates, transparency
5. **Resolve** — Fix root cause
6. **Review** — Post-mortem, improvements

See [`../05-security/incident-response.md`](../05-security/incident-response.md) for details.

---

## Operational Philosophy

**Kaizen (Continuous Improvement)**  
- Small, frequent improvements over big rewrites
- Metrics-driven decisions
- Blameless post-mortems

**Kintsugi (Visible Repairs)**  
- Document incidents transparently
- Preserve history (git revert, not force-push)
- Learn from cracks in the system

**Custodianship (Long-term Stewardship)**  
- Design for 50-year operation
- Succession planning for ops knowledge
- Comprehensive runbooks

---

## Relationship to Other Sections

- See [`02-architecture/`](../02-architecture/README.md) for system design
- See [`04-guides/operators/`](../04-guides/operators/README.md) for operator tutorials
- See [`05-security/`](../05-security/README.md) for security operations

---

*Cycle C-147 • 2025-11-27*  
*"We heal as we walk."*
