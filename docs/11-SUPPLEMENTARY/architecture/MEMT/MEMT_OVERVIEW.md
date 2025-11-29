# Mobius Multi-Engine Model Taxonomy (MEMT) Overview

## Quick Reference

MEMT is the classification and routing system that maps AI models to their cognitive specializations within Mobius Systems.

## The Five Engine Classes

| Class | Model | Role | Sentinel | Specialty |
|-------|-------|------|----------|-----------|
| **ACI** | GPT | Architect | AUREA | Systems design, planning, synthesis |
| **ENI** | Claude | Engineer | ATLAS | Code, logic, verification |
| **SXI** | Gemini | Operator | HERMES | Tools, UI, multimodal |
| **OEI** | DeepSeek | Optimizer | ZEUS | Math, performance, compute |
| **MSI** | ECHO | Memory | ECHO | Persistence, recall, caching |

## Task Routing Quick Guide

```
ARCHITECTURE      → ACI primary, ENI verify
ENGINEERING       → ENI primary, OEI optimize  
FRONTEND          → SXI primary, ACI verify
MATH_OPTIMIZATION → OEI primary, ENI verify
MEMORY_RECALL     → MSI primary, ACI verify
CIVIC_POLICY      → ENI + ACI + SXI + MSI
CRITICAL_DECISION → ALL engines + consensus
```

## GI Thresholds by Risk Level

| Risk Level | GI Threshold | Consensus Required |
|------------|--------------|-------------------|
| LOW | 0.90 | No |
| MEDIUM | 0.93 | No |
| HIGH | 0.95 | Yes |
| CRITICAL | 0.98 | Yes |

## File Structure

```
/docs/architecture/MEMT/
├── MEMT_WHITEPAPER.md        # Full 40-page academic paper
├── MEMT_OVERVIEW.md          # This file
├── MEMT_HIERARCHY.mermaid    # Engine hierarchy diagram
├── MEMT_INTEROP_MATRIX.mermaid
├── MEMT_FAILURE_MODES.mermaid
├── MEMT_ENGINE_ROLES_IN_DVA.mermaid
└── MEMT_FULL_TAXONOMY_ASCII.txt

/apps/broker-api/src/
├── types/memt.ts             # MEMT type definitions
└── services/memtRouter.ts    # MEMT routing logic
```

## Related Documentation

- [DVA MEMT Integration](../../dva/DVA_MEMT_INTEGRATION.md)
- [GI Engine Rules](../../governance/GI_ENGINE_RULES.md)
- [Multi-Engine Broker](../MULTI_ENGINE_BROKER.md)
- [ECHO Layer Canon](../ECHO_LAYER_CANON.md)
