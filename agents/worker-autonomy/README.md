# Worker Autonomy Agent (v0.1)

The Worker Autonomy Agent is a personal AI "union steward" for individual workers.

It is responsible for:
- Contract analysis and critique
- Wage fairness auditing
- Workload pattern monitoring
- Burnout risk detection
- Writing attestations to the Civic Ledger

This directory contains the **specification** and a **TypeScript scaffold** for integrating the agent into Mobius Systems.

## Quick Start

```bash
# Install dependencies
npm install

# Run the agent
npm run start -- --worker-id=u123 --org-id=acme-corp
```

## Integration

The agent uses the Civic OS Labor APIs:

```typescript
import { WorkerAutonomyAgent } from "./src/workerAutonomyAgent";

const agent = new WorkerAutonomyAgent({
  workerId: "u123",
  orgId: "acme-corp",
  jurisdiction: "US-NY"
});

// Review a contract
const audit = await agent.reviewContract(contractText);

// Analyze workload
const workload = await agent.analyzeWorkload({
  period: { from: "2025-11-01", to: "2025-11-30" },
  hours: 182
});

// Check wage fairness
const wage = await agent.checkWageFairness({
  role: "senior-analyst",
  currentSalary: 110000,
  externalMarketBand: { p25: 95000, p50: 110000, p75: 120000 }
});
```

## Architecture

The agent is designed to be **privacy-first**:
- All analysis runs locally or via encrypted API calls
- No data is shared without explicit worker consent
- Attestations are signed by the worker's private key

## Roadmap

- [ ] CLI interface for interactive sessions
- [ ] VS Code extension for in-editor contract review
- [ ] Mobile app for real-time workload tracking
- [ ] Integration with DVA.ONE for human review escalation
- [ ] Multi-language support for international workers

---

**Status:** v0.1 Scaffold  
**Owner:** Civic OS / Labor Rights Working Group
