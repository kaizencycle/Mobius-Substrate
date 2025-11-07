# PR Pack B: Lab Repos Sentinel Runbooks & Health

**Branch:** `feat/sentinel-runbooks-and-health`

## Summary

This PR adds canonical runbooks, health checks, threat models, CI/CD, and security hygiene to all lab proof repositories (lab4-proof, lab6-proof, lab7-proof).

## Files Added (per lab)

### Documentation
- `.env.template` - Environment variable template (no secrets)
- `RUNBOOK.md` - Sentinel runbook with severity levels and escalation procedures
- `HEALTHCHECK.md` - Health endpoint documentation and SLOs
- `threat-model.md` - Threat model skeleton

### Testing
- `tests/test_health.py` - Health endpoint tests

### CI/CD
- `.github/workflows/lab-ci.yml` - Tests, lint, build, Trivy security scan
- `.pre-commit-config.yaml` - Pre-commit hooks (gitleaks, yaml/json checks)

### Docker & Build
- `Dockerfile.health` - Hardened Dockerfile with healthcheck
- `Makefile` - Common development commands

## Applied To

- ✅ `labs/lab4-proof/` (E.O.M.M.)
- ✅ `labs/lab6-proof/` (Citizen Shield)
- ✅ `labs/lab7-proof/` (OAA Hub)

## Usage

```bash
# Start development server
make dev

# Run tests
make test

# Lint code
make lint

# Build Docker image
make build
```

## CI Behavior

- **On PR/Push**: Runs tests, linting, Docker build, and Trivy security scan
- **Trivy**: Scans for HIGH/CRITICAL vulnerabilities
- **Graceful failures**: Tests and builds continue even if optional dependencies missing

## Health Endpoints

Each lab should implement:
- `GET /healthz` - Liveness probe
- `GET /readyz` - Readiness probe (checks downstreams)
- `GET /metrics` - Prometheus metrics

## SLOs

- p95 request latency: < 250ms
- Error rate: < 0.5% per 5m
- Uptime: 99.5% rolling 30d

## Next Steps

1. Ensure each lab's `app/main.py` implements `/healthz` and `/readyz` endpoints
2. Add actual health check logic to `/readyz` (check ledger, database connections)
3. Configure Prometheus metrics endpoint if not already present
4. Review and customize threat models per lab's specific risks

