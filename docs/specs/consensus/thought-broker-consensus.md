# Thought Broker Consensus Algorithm Specification v1.0

**Status**: Draft  
**Version**: 1.0.0  
**Date**: 2025-11-09

---

## Overview

The Thought Broker implements a multi-agent consensus protocol where four sentinel cortices (AUREA, HERMES, EVE, JADE) deliberate on decisions and reach agreement through structured voting.

---

## Consensus Model

### Participants

- **AUREA** (Logic Cortex): OpenAI GPT-4.1
- **HERMES** (Operations Cortex): Anthropic Claude 3.5
- **EVE** (Ethics Cortex): DeepSeek Chat
- **JADE** (Morale Cortex): Google Gemini Pro

### Decision Types

1. **Binary Decisions**: Approve/Reject (e.g., PR merge, deployment)
2. **Graded Decisions**: Score 0-1 (e.g., MII assessment, risk evaluation)
3. **Ranked Decisions**: Ordering of options (e.g., priority ranking)

---

## Consensus Algorithm

### Phase 1: Proposal Distribution

```typescript
interface Proposal {
  id: string;
  type: 'binary' | 'graded' | 'ranked';
  prompt: string;
  context: Record<string, any>;
  deadline: string;  // ISO 8601
}

async function distributeProposal(proposal: Proposal): Promise<void> {
  // Send to all cortices in parallel
  const responses = await Promise.all([
    aurea.deliberate(proposal),
    hermes.deliberate(proposal),
    eve.deliberate(proposal),
    jade.deliberate(proposal)
  ]);
  
  return responses;
}
```

### Phase 2: Individual Deliberation

Each cortex returns:

```typescript
interface DeliberationResponse {
  cortex: string;           // 'AUREA' | 'HERMES' | 'EVE' | 'JADE'
  decision: Decision;
  reasoning: string;
  confidence: number;        // 0-1
  timestamp: string;
  signature: string;        // Ed25519 signature
}

interface Decision {
  // For binary decisions
  approve?: boolean;
  
  // For graded decisions
  score?: number;
  
  // For ranked decisions
  ranking?: string[];
}
```

### Phase 3: Consensus Aggregation

#### Binary Consensus (3-of-4 Threshold)

```typescript
function aggregateBinaryConsensus(
  responses: DeliberationResponse[]
): ConsensusResult {
  const approvals = responses.filter(r => r.decision.approve === true);
  const rejections = responses.filter(r => r.decision.approve === false);
  
  // Require 3 of 4 approvals
  if (approvals.length >= 3) {
    return {
      consensus: true,
      decision: 'approve',
      confidence: calculateConfidence(responses),
      votes: { approve: approvals.length, reject: rejections.length }
    };
  }
  
  // Require 3 of 4 rejections
  if (rejections.length >= 3) {
    return {
      consensus: true,
      decision: 'reject',
      confidence: calculateConfidence(responses),
      votes: { approve: approvals.length, reject: rejections.length }
    };
  }
  
  // No consensus (2-2 split)
  return {
    consensus: false,
    decision: 'no_consensus',
    confidence: 0,
    votes: { approve: approvals.length, reject: rejections.length }
  };
}
```

#### Graded Consensus (Weighted Average)

```typescript
function aggregateGradedConsensus(
  responses: DeliberationResponse[]
): ConsensusResult {
  // Weight by confidence
  const weights = responses.map(r => r.confidence);
  const scores = responses.map(r => r.decision.score!);
  
  const weightedSum = scores.reduce((sum, score, i) => 
    sum + score * weights[i], 0
  );
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  const consensusScore = weightedSum / totalWeight;
  
  // Require all 4 responses
  if (responses.length === 4) {
    return {
      consensus: true,
      decision: consensusScore,
      confidence: Math.min(...weights),
      votes: { count: 4 }
    };
  }
  
  return {
    consensus: false,
    decision: null,
    confidence: 0,
    votes: { count: responses.length }
  };
}
```

### Phase 4: Value Conflict Resolution

When cortices disagree (e.g., AUREA approves but EVE rejects):

```typescript
interface ConflictResolution {
  strategy: 'veto' | 'weighted' | 'escalate';
  rules: ConflictRule[];
}

interface ConflictRule {
  condition: string;  // e.g., "EVE.reject AND AUREA.approve"
  action: 'veto' | 'weight' | 'escalate';
  priority: number;
}

const DEFAULT_RULES: ConflictRule[] = [
  {
    condition: "EVE.reject",
    action: 'veto',  // Ethics veto overrides logic
    priority: 1
  },
  {
    condition: "JADE.reject AND confidence < 0.7",
    action: 'escalate',  // Low confidence morale rejection → human review
    priority: 2
  },
  {
    condition: "AUREA.approve AND HERMES.approve",
    action: 'weight',  // Logic + ops agreement weighted higher
    priority: 3
  }
];

function resolveConflict(
  responses: DeliberationResponse[],
  rules: ConflictRule[]
): ConflictResolution {
  // Apply rules in priority order
  for (const rule of rules.sort((a, b) => a.priority - b.priority)) {
    if (evaluateCondition(rule.condition, responses)) {
      return {
        strategy: rule.action,
        rules: [rule]
      };
    }
  }
  
  // Default: weighted consensus
  return { strategy: 'weighted', rules: [] };
}
```

---

## Time-Bounded Deliberation

### Timeout Policy

```typescript
const DELIBERATION_TIMEOUT = 30 * 1000;  // 30 seconds

async function deliberateWithTimeout(
  proposal: Proposal
): Promise<ConsensusResult> {
  const deadline = Date.now() + DELIBERATION_TIMEOUT;
  
  const responses = await Promise.race([
    distributeProposal(proposal),
    timeout(deadline)
  ]);
  
  if (responses.length < 3) {
    // Insufficient responses → escalate to human
    return {
      consensus: false,
      decision: 'timeout',
      requiresHumanReview: true
    };
  }
  
  return aggregateConsensus(responses);
}
```

---

## Failure Modes & Fallback

### Cortex Failure

```typescript
async function handleCortexFailure(
  failedCortex: string,
  remainingResponses: DeliberationResponse[]
): Promise<ConsensusResult> {
  // If 3 of 4 respond, proceed with 3-of-3 consensus
  if (remainingResponses.length >= 3) {
    return aggregateConsensus(remainingResponses);
  }
  
  // If only 2 respond, require both to agree
  if (remainingResponses.length === 2) {
    const agree = remainingResponses[0].decision === remainingResponses[1].decision;
    if (agree) {
      return {
        consensus: true,
        decision: remainingResponses[0].decision,
        confidence: 0.7,  // Reduced confidence
        degraded: true
      };
    }
  }
  
  // Insufficient responses → escalate
  return {
    consensus: false,
    decision: 'insufficient_responses',
    requiresHumanReview: true
  };
}
```

### Recursive Self-Correction Prevention

```typescript
interface CorrectionGuard {
  maxCorrections: number;
  correctionWindow: number;  // milliseconds
  corrections: CorrectionRecord[];
}

function checkCorrectionLimit(
  guard: CorrectionGuard,
  proposalId: string
): boolean {
  const recent = guard.corrections.filter(c => 
    Date.now() - c.timestamp < guard.correctionWindow
  );
  
  if (recent.length >= guard.maxCorrections) {
    // Too many corrections → halt and escalate
    return false;
  }
  
  guard.corrections.push({
    proposalId,
    timestamp: Date.now()
  });
  
  return true;
}

// Default: max 3 corrections per 5 minutes
const DEFAULT_GUARD: CorrectionGuard = {
  maxCorrections: 3,
  correctionWindow: 5 * 60 * 1000,
  corrections: []
};
```

---

## Deliberation Proof Generation

```typescript
interface DeliberationProof {
  proposalId: string;
  consensus: ConsensusResult;
  responses: DeliberationResponse[];
  aggregationMethod: string;
  timestamp: string;
  proofHash: string;  // Merkle root of responses
}

function generateDeliberationProof(
  proposal: Proposal,
  responses: DeliberationResponse[],
  consensus: ConsensusResult
): DeliberationProof {
  // Merkle tree of responses
  const leaves = responses.map(r => hashResponse(r));
  const proofHash = merkleRoot(leaves);
  
  return {
    proposalId: proposal.id,
    consensus,
    responses,
    aggregationMethod: consensus.type,
    timestamp: new Date().toISOString(),
    proofHash
  };
}
```

---

## Performance Requirements

- **Latency**: < 30 seconds for binary decisions
- **Throughput**: 100+ decisions per minute
- **Availability**: 99.9% (3-of-4 cortices must be available)

---

## Security Properties

1. **Byzantine Fault Tolerance**: Tolerates 1 of 4 cortices failing
2. **Non-repudiation**: Each response is cryptographically signed
3. **Auditability**: Full deliberation trail in Deliberation Proof
4. **Freshness**: Timestamps prevent replay

---

**Status**: Draft v1.0  
**Next Review**: 2025-11-25  
**Owner**: Technical Steering Committee

