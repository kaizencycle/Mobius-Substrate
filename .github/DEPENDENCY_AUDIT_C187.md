# Dependency Audit Report — Cycle C-187

**Date:** 2026-01-10  
**Auditor:** ATLAS  
**Scope:** PR #224 dependency additions review  

---

## Executive Summary

PR #224 (C-180 Full Sweep) added four common dependencies to many packages for security remediation:
- `@modelcontextprotocol/sdk`: 1.25.1
- `eslint-config-next`: 16.1.1
- `ethers`: 6.16.0
- `next`: 14.2.35

This audit identifies packages that received these dependencies but don't directly use them.

---

## Findings

### Packages with Potentially Unnecessary Dependencies

The following 25 packages have the C-180 security dependencies but show no direct imports:

#### Packages (16)
| Package | Notes |
|---------|-------|
| `packages/atlas-sentinel` | May use via re-exports |
| `packages/civic-protocol-core` | Large package, may have indirect usage |
| `packages/civic-sdk` | May use via re-exports |
| `packages/codex-agentic` | May use via re-exports |
| `packages/config` | Shared config, unlikely to need |
| `packages/delibproof` | Crypto library, ethers might be used |
| `packages/echo-layer` | No apparent usage |
| `packages/gic-registry-contracts` | Smart contracts, ethers likely needed |
| `packages/integrity-units` | No apparent usage |
| `packages/local-ledger` | No apparent usage |
| `packages/mobius-kernel` | No apparent usage |
| `packages/oaa-memory` | No apparent usage |
| `packages/sdk-example-service` | No apparent usage |
| `packages/shield-policies` | No apparent usage |
| `packages/tokenomics-engine` | No apparent usage |
| `packages/ui-kit` | Next.js may be needed for React compatibility |

#### Sentinels (5)
| Sentinel | Notes |
|----------|-------|
| `sentinels/atlas` | No src directory inspected |
| `sentinels/aurea` | No src directory inspected |
| `sentinels/uriel` | No src directory inspected |
| `sentinels/zeus-coordinator` | No src directory inspected |
| `sentinels/zeus-sentinel` | No src directory inspected |

#### Services (4)
| Service | Notes |
|---------|-------|
| `services/civic-ledger` | May use ethers for blockchain |
| `services/epoch-burn` | No apparent usage |
| `services/gi-aggregator` | No apparent usage |
| `services/mock-wallet` | May use ethers for wallet mock |

---

## Analysis

### Why These Dependencies Were Added

PR #224 added these dependencies as part of a security remediation strategy:

1. **Version Consistency:** Ensures all packages use the same secure versions
2. **Vulnerability Prevention:** Prevents transitive dependency issues
3. **npm audit Fix:** `npm audit fix` often adds packages to ensure consistent resolution

### Risks of Removing Them

| Risk | Impact |
|------|--------|
| **Version Drift** | Individual packages may update independently, creating inconsistencies |
| **Security Gaps** | Future security updates may miss packages without explicit deps |
| **Resolution Issues** | npm may resolve to different versions without explicit pinning |
| **Build Failures** | Some packages may have implicit dependencies through re-exports |

### Benefits of Removing Them

| Benefit | Impact |
|---------|--------|
| **Smaller node_modules** | Reduced disk usage per package |
| **Faster installs** | Fewer dependencies to resolve |
| **Cleaner dependency graph** | Easier to understand actual dependencies |
| **Reduced attack surface** | Fewer packages = fewer potential vulnerabilities |

---

## Recommendations

### Short Term (Current Approach - Keep As Is)

**Recommendation:** DO NOT remove these dependencies at this time.

**Rationale:**
- The current approach ensures security consistency
- Risk of breakage outweighs disk space benefits
- npm workspace hoisting minimizes actual duplication
- Focus should be on functional improvements

### Medium Term (Next Quarter)

Consider implementing a better dependency management strategy:

1. **Catalog Overrides (npm 10+)**
   ```json
   // package.json (root)
   {
     "overrides": {
       "next": "14.2.35",
       "ethers": "6.16.0",
       "@modelcontextprotocol/sdk": "1.25.1"
     }
   }
   ```

2. **Workspace Protocol**
   - Move shared dependencies to root package.json
   - Use `workspace:*` protocol for internal packages
   - Let hoisting handle version consistency

### Long Term (Future Cycle)

1. **Implement Dependency Bot**
   - Automated dependency updates with security focus
   - Consistent version bumps across all packages

2. **Package Audit Workflow**
   - CI check for unused dependencies
   - Automatic removal of unused packages

---

## Action Items

| Priority | Item | Owner | Status |
|----------|------|-------|--------|
| Low | Document current dependency strategy | ATLAS | ✅ Done |
| Low | Track unused deps for future cleanup | - | This doc |
| Medium | Evaluate npm overrides approach | - | Future |
| Medium | Add unused dependency lint check | - | Future |

---

## Conclusion

While 25 packages have potentially unnecessary security dependencies, **removing them now is not recommended** due to:

1. Risk of version inconsistency
2. Potential build breakages from implicit dependencies
3. Complexity of verifying all usage patterns
4. The dependencies serve a security purpose (version pinning)

The overhead is minimal due to npm workspace hoisting, and the current approach ensures consistent security posture across the monorepo.

---

*Generated: 2026-01-10*  
*Cycle: C-187*  
*"We heal as we walk."*
