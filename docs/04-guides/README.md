# Guides & How-Tos

This is the **practical handbook** section.

If you want to **do something** with Mobius today, start here.

---

## Contents

Organized by the directories that actually live inside `docs/04-guides/`:

### `quickstart/`
**For everyone — get started in minutes**
- `START_HERE.md` — Orientation, tooling, and local runbook
- `HELLO_WORLD.md` — Your first Mobius program end‑to‑end

### `deployment/`
**For platform custodians shipping Mobius**
- `DEPLOYMENT_GUIDE.md` — Baseline deployment steps and checklists
- `VERCEL_DEPLOYMENT_GUIDE.md` — Deploying UI workloads to Vercel
- `CIVIC_MOUNT_INTEGRATION.md` — Wiring into Civic Mount infrastructure

### `development/`
**For engineers contributing code**
- `FRONTEND_DEVELOPMENT.md` — UI environment and workflows
- `API_INTEGRATION.md` — Calling Mobius services safely
- `cursor-integration.md` — Using Cursor with Mobius projects
- `MKDOCS_GUIDE.md` — How we build and preview docs
- `MKDOCS_IMPLEMENTATION.md` — MkDocs deep dive for maintainers

### `operations/`
**For DevOps/SRE teams keeping Mobius healthy**
- `CUSTODIAN_GUIDE.md` — Day‑to‑day service operations
- `RECOVERY_PLAYBOOK.md` — Disaster recovery and restoration plan
- `FORKING_GUIDE.md` — Policy + steps for controlled network forks

---

## Quick Reference by Task

**I want to…**

- **Run Mobius locally** → [`quickstart/START_HERE.md`](./quickstart/START_HERE.md)
- **Ship a deployment** → [`deployment/DEPLOYMENT_GUIDE.md`](./deployment/DEPLOYMENT_GUIDE.md)
- **Publish to Vercel** → [`deployment/VERCEL_DEPLOYMENT_GUIDE.md`](./deployment/VERCEL_DEPLOYMENT_GUIDE.md)
- **Integrate with APIs** → [`development/API_INTEGRATION.md`](./development/API_INTEGRATION.md)
- **Use Cursor effectively** → [`development/cursor-integration.md`](./development/cursor-integration.md)
- **Operate production** → [`operations/CUSTODIAN_GUIDE.md`](./operations/CUSTODIAN_GUIDE.md)
- **Recover from incidents** → [`operations/RECOVERY_PLAYBOOK.md`](./operations/RECOVERY_PLAYBOOK.md)

---

## Guide Principles

All guides follow these standards:

1. **Action-Oriented** — Clear steps, not just theory
2. **Copy-Pasteable** — Code examples that actually work
3. **Prerequisites Listed** — Know what you need upfront
4. **Expected Outcomes** — Know what success looks like
5. **Troubleshooting** — Common problems and solutions
6. **Further Reading** — Links to deeper documentation

---

## Contributing New Guides

We welcome new guides! If you've solved a problem or built something useful:

1. Write a guide following the principles above
2. Place it in the appropriate folder (`quickstart/`, `deployment/`, `development/`, or `operations/`)
3. Add it to this README
4. Submit a PR with `[C-XXX]` cycle tag
5. Earn MIC for your contribution!

See [`developers/contributing.md`](./developers/contributing.md) for details.

---

## Relationship to Other Sections

- See [`02-architecture/`](../02-architecture/README.md) for understanding system design
- See [`03-specifications/`](../03-specifications/README.md) for exact technical details
- See [`06-OPERATIONS/`](../06-OPERATIONS/README.md) for production operations

---

*Cycle C-147 • 2025-11-27*  
*"We heal as we walk."*
