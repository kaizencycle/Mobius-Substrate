# Mobius Performance Benchmarks

**Status:** Active  
**Last Updated:** C-198  
**Maintainer:** ATLAS Sentinel

---

## Overview

This directory contains performance benchmarks for critical Mobius subsystems. Benchmarks are designed to:

1. **Detect performance regressions** before they reach production
2. **Establish baselines** for capacity planning
3. **Validate scalability** under load
4. **Profile memory usage** for leak detection

---

## Benchmark Categories

### 1. Integrity Calculations (`integrity.bench.ts`)
- MII computation latency
- MFS shard aggregation throughput
- Attestation signature verification

### 2. Consensus Operations (`consensus.bench.ts`)
- Multi-LLM consensus latency
- DelibProof generation time
- Sentinel vote aggregation

### 3. API Throughput (`api.bench.ts`)
- Ledger API requests/second
- DVA.LITE deliberation throughput
- OAA Hub intent parsing

### 4. Memory Profiles (`memory.bench.ts`)
- Long-running service memory growth
- Cache efficiency
- Garbage collection patterns

---

## Running Benchmarks

### Quick Run (Development)
```bash
# Run all benchmarks
npm run benchmark

# Run specific benchmark
npm run benchmark -- --filter=integrity

# Run with verbose output
npm run benchmark -- --verbose
```

### CI/CD Run (Automated)
```bash
# Produces JSON report for comparison
npm run benchmark:ci
```

### Full Suite (Performance Analysis)
```bash
# Extended run with statistical analysis
npm run benchmark:full
```

---

## Performance Targets

| Benchmark | Target | Critical Threshold |
|-----------|--------|-------------------|
| MII Computation | < 10ms | < 50ms |
| Attestation Verify | < 5ms | < 20ms |
| Consensus Latency | < 3s | < 10s |
| API Throughput | > 100 req/s | > 50 req/s |
| Memory Growth | < 50MB/hr | < 200MB/hr |

---

## Output Formats

### Console (Default)
```
Benchmark Results — 2026-01-16T12:00:00Z
─────────────────────────────────────────
✓ integrity/mii-compute        8.2ms  (±0.5ms)
✓ integrity/attestation-verify 3.1ms  (±0.2ms)
✓ consensus/multi-llm          2.4s   (±0.3s)
✓ api/ledger-throughput        142 req/s
─────────────────────────────────────────
All benchmarks passed
```

### JSON (`benchmark-results.json`)
```json
{
  "timestamp": "2026-01-16T12:00:00Z",
  "commit": "abc1234",
  "results": [
    {
      "name": "integrity/mii-compute",
      "mean": 8.2,
      "stddev": 0.5,
      "unit": "ms",
      "status": "pass"
    }
  ]
}
```

---

## Writing Benchmarks

### TypeScript Template
```typescript
// tests/benchmarks/my-feature.bench.ts
import { bench, describe } from 'vitest';

describe('My Feature', () => {
  bench('operation name', async () => {
    // Code to benchmark
    await myOperation();
  }, {
    iterations: 1000,
    time: 5000, // 5 seconds max
  });
});
```

### Python Template
```python
# tests/benchmarks/test_my_feature_bench.py
import pytest
from pytest_benchmark.fixture import BenchmarkFixture

def test_my_operation(benchmark: BenchmarkFixture):
    """Benchmark my_operation performance"""
    result = benchmark(my_operation, arg1, arg2)
    assert result is not None
```

---

## Baseline Management

### Recording Baselines
```bash
# Record current performance as baseline
npm run benchmark:baseline

# Compare against baseline
npm run benchmark:compare
```

### Baseline Storage
- Baselines stored in `tests/benchmarks/.baselines/`
- Git-tracked for regression detection
- Updated automatically in CI when main branch changes

---

## Integration with CI/CD

The benchmark suite runs on:
- **Pull Requests:** Comparison against main branch baseline
- **Main Branch Merges:** Baseline update
- **Nightly:** Full performance regression suite

See `.github/workflows/benchmark.yml` for configuration.

---

## References

- [Testing Strategy](../../docs/11-SUPPLEMENTARY/architecture-docs/TESTING.md)
- [MII Specification](../../specs/mii_spec_v1.md)
- [Observability Guide](../../docs/06-OPERATIONS/observability/MOBIUS_OPS_CONSOLE.md)

---

*"Performance is a feature, not an afterthought."*
