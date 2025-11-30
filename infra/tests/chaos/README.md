# Chaos Test Plans — Cycle C-150

Mobius is adopting chaos engineering to lock in Grok's A+ stability target. These TypeScript files are structured plans rather than runnable suites today—they can be imported by future harnesses or simply referenced during manual drills.

## Available Scenarios

| File | Scenario | Primary KPI |
|------|----------|-------------|
| `random_service_kill.test.ts` | Random termination of core services | Recovery time (API ≤ 90s, Ledger ≤ 180s) |
| `sentinel_offline.test.ts` | Sentinel unreachable, consensus must fail-safe | Fail-safe latency ≤ 60s |
| `latency_spike.test.ts` | 1s latency injection across broker/ledger | GI floor maintained ≥ 0.95 |
| `packet_loss.test.ts` | 5% packet loss between services | Ledger consistency |
| `corrupted_mii_stream.test.ts` | Tampered integrity telemetry | Sink freeze ≤ 2 blocks |

## How to Use

1. Import plan objects inside automation scripts or notebooks.
2. Execute the described steps via Docker, Kubernetes, or Render depending on environment.
3. Log all metrics to Grafana/Prometheus and attach to Echo cycle report.
4. File follow-up issues referencing the corresponding scenario name and include the Echo event ID logged as `chaos-test:<scenario>`.

## Next Steps

- Convert these plans into executable Playwright/Vitest suites once chaos infrastructure is wired.
- Integrate with `infra/observability` dashboards for automatic annotations.
