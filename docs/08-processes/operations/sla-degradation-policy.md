# SLA & Degradation Policy v0.1

## Service Level Objectives

- Ingest p95 latency < 250 ms
- Read p95 latency < 150 ms
- Consensus finality < 2 seconds

## Degradation Triggers

- SLO miss sustained for 5 minutes **and**
- MII drop greater than 0.02 from baseline

## Response Playbook

- Disable non-critical writes; enable cache-first reads.
- Activate circuit breakers to shed load gracefully.
- Notify Sentinel for automated “Healing Loop” PR.
- Escalate to human override if degradation persists beyond 15 minutes.
