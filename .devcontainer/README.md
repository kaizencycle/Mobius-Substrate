# Mobius Development Container

This development container provides a consistent, pre-configured environment for working with the Mobius Substrate monorepo.

## Quick Start

### VS Code / Cursor
1. Install the "Dev Containers" extension
2. Open command palette: `Ctrl+Shift+P` / `Cmd+Shift+P`
3. Select: "Dev Containers: Reopen in Container"
4. Wait for container build and npm install (~3-5 minutes first time)

### GitHub Codespaces
1. Click "Code" → "Codespaces" → "Create codespace on main"
2. Environment will be automatically configured

## What's Included

### Languages & Runtimes
- **Node.js 20** - Primary runtime for TypeScript packages
- **Python 3.12** - For Python services and scripts
- **Docker-in-Docker** - For containerized testing

### Pre-installed Tools
- npm, npx (package management)
- Turbo (monorepo build orchestration)
- GitHub CLI (gh)
- pytest, pytest-cov, hypothesis (Python testing)

### VS Code Extensions
- ESLint & Prettier (code quality)
- Python language support
- Tailwind CSS IntelliSense
- Jest/Vitest test runners
- Docker tools
- GitHub integration

## Available Ports

| Port | Service | Auto-forward |
|------|---------|--------------|
| 3000 | Portal | Notify |
| 3001 | Broker API | Notify |
| 3002 | Ledger API | Notify |
| 3003 | DVA.LITE | Notify |
| 3004 | OAA Hub | Notify |
| 8080 | Gateway | Notify |
| 9090 | Prometheus | Silent |

## Common Commands

```bash
# Build all packages
npm run build

# Run tests
npm run test

# Start development servers
npm run dev

# Type check
npm run type-check

# Run specific workspace
npm run build --workspace=@civic/portal

# Run Python tests
pytest tests/

# Regenerate catalog
npm run export:catalog
```

## Resource Limits

The container is configured with:
- **Memory:** 8GB
- **CPUs:** 4 cores

Adjust in `devcontainer.json` if needed.

## Troubleshooting

### Slow builds
The `.turbo` cache is mounted for persistence. If builds are slow:
```bash
rm -rf .turbo
npm run build
```

### Missing dependencies
```bash
npm ci
pip install -r requirements.txt  # if applicable
```

### Port conflicts
Stop any local services using the same ports, or modify `forwardPorts` in `devcontainer.json`.

## Environment Variables

Set in `.env.local` (gitignored) for local development:
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

---

*"We heal as we walk." — Mobius Substrate*
