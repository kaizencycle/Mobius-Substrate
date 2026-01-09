# Mobius Packages Workspace

**Type:** Shared libraries and utilities
**Count:** 15+ packages
**Tech Stack:** TypeScript, Node.js 20
**Purpose:** Reusable code shared across apps and services

---

## 📦 Key Packages

### Core Infrastructure
- **integrity-core/** - MII calculations, GI algorithms, core integrity logic
- **civic-sdk/** - Civic protocol SDK, attestations, validator logic
- **atlas-sentinel/** - ATLAS agent sentinel package
- **codex-agentic/** - Agentic code analysis tools

### Protocol & Standards
- **civic-protocol-core/** - Core civic protocol implementations
- **echo-layer/** - Echo layer communications
- **delibproof/** - Deliberation proof generation
- **oaa-memory/** - OAA memory management

### Developer Tools
- **config/** - Shared configuration
- **integrity-units/** - Integrity measurement units
- **local-ledger/** - Local ledger implementations
- **mobius-kernel/** - Core kernel utilities

### Blockchain & Contracts
- **gic-registry-contracts/** - GIC registry smart contracts

---

## 🏗️ Architecture Principles

### 1. **Workspace Protocol**
All packages use workspace protocol for internal dependencies:

```json
{
  "dependencies": {
    "@civic/integrity-core": "workspace:*",
    "@civic/civic-sdk": "workspace:*"
  }
}
```

**Why:** Ensures packages always use local versions, not published versions.

### 2. **Naming Convention**
```
@civic/<package-name>
@kaizen/<package-name>
@mobius/<package-name>
```

**Scopes:**
- `@civic` - Civic protocol related
- `@kaizen` - Kaizen OS related
- `@mobius` - Mobius substrate core

### 3. **Exports Pattern**
```typescript
// src/index.ts - Main export file
export * from './integrity'
export * from './types'
export { default as Calculator } from './Calculator'

// Enable tree-shaking
export type { IntegrityConfig } from './types'
```

---

## 🚀 Development

### Building Packages

**Single Package:**
```bash
# Build specific package
npm run build --workspace=packages/integrity-core

# Watch mode (if available)
npm run dev --workspace=packages/integrity-core
```

**All Packages:**
```bash
# Turbo handles dependency order
npx turbo run build

# Affected packages only
npx turbo run build --filter=...[HEAD^]
```

### Testing Packages

**Unit Tests:**
```bash
# Specific package
npm run test --workspace=packages/integrity-core

# All packages
npx turbo run test

# With coverage
npm run test:coverage --workspace=packages/integrity-core
```

**Integration Tests:**
```bash
# Usually in apps that consume packages
cd apps/portal
npm run test:integration
```

### Type Checking

**All Packages:**
```bash
npx turbo run type-check
```

**Specific Package:**
```bash
cd packages/integrity-core
npx tsc --noEmit
```

---

## 📋 Package Structure

### Standard Layout
```
packages/my-package/
├── src/
│   ├── index.ts          # Main export
│   ├── types.ts          # TypeScript types
│   └── utils/            # Internal utilities
├── dist/                 # Build output (gitignored)
├── package.json
├── tsconfig.json
├── README.md
└── CHANGELOG.md          # Version history
```

### package.json Template
```json
{
  "name": "@civic/my-package",
  "version": "1.0.0",
  "description": "Package description",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist",
    "test": "vitest",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    // Runtime dependencies only
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
    // Build/test dependencies
  }
}
```

### tsconfig.json Template
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

---

## 🔗 Dependency Management

### Internal Dependencies
```json
{
  "dependencies": {
    "@civic/integrity-core": "workspace:*"
  }
}
```

**Build Order:** Turbo automatically builds dependencies first.

### External Dependencies
```json
{
  "dependencies": {
    "ethers": "^6.16.0",
    "zod": "^3.22.0"
  }
}
```

**Version Management:** Keep versions consistent across packages (use root package.json where possible).

### Peer Dependencies
```json
{
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
```

**Use when:** Package extends or integrates with another library.

---

## 📝 Creating New Packages

### 1. Create Directory
```bash
mkdir -p packages/my-new-package/src
cd packages/my-new-package
```

### 2. Initialize package.json
```bash
npm init -y
# Edit to match template above
```

### 3. Add TypeScript Config
```json
// tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

### 4. Create Entry Point
```typescript
// src/index.ts
export const greet = (name: string) => `Hello, ${name}!`
export type { GreetOptions } from './types'
```

### 5. Add to Root Workspace
Root package.json automatically picks up packages/*/

### 6. Build and Test
```bash
cd ../..  # Back to root
npm run build --workspace=packages/my-new-package
npm run test --workspace=packages/my-new-package
```

### 7. Use in App
```json
// apps/portal/package.json
{
  "dependencies": {
    "@civic/my-new-package": "workspace:*"
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)
```typescript
// src/calculator.test.ts
import { describe, it, expect } from 'vitest'
import { calculate } from './calculator'

describe('calculate', () => {
  it('should add numbers correctly', () => {
    expect(calculate(2, 3, 'add')).toBe(5)
  })
})
```

### Integration Tests
Place in consuming apps, not in packages:
```
apps/portal/
└── __tests__/
    └── integrity.integration.test.ts
```

### Type Tests
```typescript
// src/types.test.ts
import type { IntegrityScore } from './types'

// Type-only test
const score: IntegrityScore = {
  value: 0.95,
  timestamp: new Date()
}
```

---

## 🔧 Best Practices

### 1. **Single Responsibility**
Each package should do one thing well.
- ✅ `integrity-core` - Integrity calculations
- ❌ `utils` - Generic catch-all (avoid)

### 2. **Clear Exports**
```typescript
// ✅ Good: Named exports
export { calculateMII } from './mii'
export type { MIIConfig } from './types'

// ❌ Bad: Export everything
export * from './internals'
```

### 3. **Version Consistency**
Keep shared dependencies at same version:
```json
// Root package.json
{
  "devDependencies": {
    "typescript": "^5.0.0",  // All packages inherit
    "vitest": "^1.0.0"
  }
}
```

### 4. **Type Safety First**
```typescript
// ✅ Good: Strict types
export function calculate(a: number, b: number): number

// ❌ Bad: Loose types
export function calculate(a: any, b: any): any
```

### 5. **Documentation**
Every package needs:
- README.md - Usage examples
- CHANGELOG.md - Version history
- JSDoc comments on public APIs

### 6. **Semantic Versioning**
```
1.0.0 - Major.Minor.Patch
^     - Breaking change
  ^   - New feature
    ^ - Bug fix
```

---

## ⚠️ Common Issues

### "Cannot find module '@civic/package'"
```bash
# Ensure dependencies are installed
npm ci

# Ensure package is built
npx turbo run build --filter=@civic/package
```

### "Type error in consuming app"
```bash
# Rebuild package with declarations
cd packages/my-package
npm run build

# Check dist/ has .d.ts files
ls -la dist/
```

### "Circular dependency detected"
```typescript
// ❌ Package A depends on Package B
// ❌ Package B depends on Package A

// ✅ Extract shared code to Package C
// ✅ Both A and B depend on C
```

### "Package not found in turbo"
```bash
# Ensure package.json has name field
# Ensure package is in packages/ directory
# Run from root:
npx turbo run build --filter=@civic/my-package
```

---

## 📊 Key Metrics

### Build Time
- Target: <2 minutes for all packages
- Use: `npx turbo run build --summarize`

### Bundle Size
- Monitor with: `size-limit` (if applicable)
- Tree-shaking: Use named exports

### Type Coverage
- Aim for: 100% type coverage
- No `any` types in public APIs

---

## 📚 References

- **Turbo docs:** https://turbo.build/repo/docs
- **TypeScript:** https://www.typescriptlang.org/
- **Vitest:** https://vitest.dev/
- **npm workspaces:** https://docs.npmjs.com/cli/v10/using-npm/workspaces

---

*Part of Mobius Substrate Monorepo* 🌀
