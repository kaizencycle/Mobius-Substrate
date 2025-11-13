---
title: Civic Learning Attestation Payload v1
status: Draft
cycle: C-132
authors:
  - AUREA (OpenAI)
  - ATLAS (Claude)
  - Mobius Thought Broker Team
created: 2025-11-13
updated: 2025-11-13
---

# Civic Learning Attestation Payload (v1)

> _"The Broker is where the system thinks. The Ledger is where the system remembers."_  
> — Mobius Systems, Cycle C-132

This document canonizes the JSON payload recorded to the Civic Ledger when a Mobius learning loop completes:

1. OAA issues a learning task and routes deliberation to the Thought Broker.  
2. A learner (human or agent) submits a response evaluated via `/v1/grade`.  
3. MIC (Mobius Integrity Credits) rewards are computed and attested.

All downstream services (Ledger ingest, MIC treasury, dashboards) must treat this specification as source of truth.

## 1. Record Identity

| Field | Type | Description |
| ----- | ---- | ----------- |
| `attestation_id` | `string` | Globally unique identifier. Format: `att-learning-{cycle}-{shortuuid}` |
| `schema_version` | `string` | Semantic version of this payload contract. Current: `1.0.0` |
| `type` | `string` | MUST be `learning_event` |
| `cycle` | `string` | Mobius cycle identifier (e.g. `C-132`) |
| `epoch` | `string` | Optional sub-cycle epoch (e.g. `E-560`) |
| `timestamp` | `string` | ISO 8601 UTC timestamp when the attestation was sealed |

## 2. Actors

```json
{
  "actors": {
    "learner": {
      "id": "user_123",
      "kind": "human" | "agent",
      "display_name": "Taylor",
      "sovereign_id": "CIT-0456",
      "mic_balance_before": 120.5
    },
    "companion": {
      "id": "companion_blossom",
      "version": "2.4.1",
      "traits": ["growth", "resilience"]
    },
    "oaa": {
      "service": "lab7-proof",
      "release": "2025.11.12",
      "request_id": "oaa_req_9YyqY"
    },
    "broker": {
      "service": "apps/broker-api",
      "release": "0.1.0",
      "deliberation_id": "hxg6FNEXs4G57dLbrvF0w",
      "ws_session": "ws_4nSxP",
      "mii_baseline": 0.995
    }
  }
}
```

- `mic_balance_before` is recorded in MIC units prior to rewarding.
- `traits` capture companion configuration that influenced pedagogy.
- `mii_baseline` is the GI/MII context injected by middleware when the Broker accepted the job.

## 3. Learning Context

| Field | Type | Notes |
| ----- | ---- | ----- |
| `lesson` | object | Required |
| `lesson.id` | `string` | Unique lesson/session id |
| `lesson.course_id` | `string` | Optional course reference |
| `lesson.topic` | `string` | Human-readable topic |
| `lesson.tags` | `string[]` | e.g. `["algebra", "mic", "cycle_132"]` |
| `lesson.constraints` | `string[]` | Promises enforced (no PII, must cite sources, etc.) |
| `context_hashes` | object | Hash commitments of prompt + learning materials (SHA-256 hex) |
| `context_hashes.prompt` | `string` | Hash of broker prompt text |
| `context_hashes.materials` | `string` | Hash of any supplemental material bundle |

Include `hash_algorithm` if a non-default digest is used.

## 4. Deliberation Proof Snapshot

```json
{
  "deliberation": {
    "id": "hxg6FNEXs4G57dLbrvF0w",
    "consensus_summary": "Mobius should allow semi-autonomous agents with strict oversight.",
    "rounds": 3,
    "sentinels": [
      {
        "name": "AUREA",
        "model": "gpt-5.1-critic",
        "vote": "approve",
        "integrity_score": 0.992
      },
      {
        "name": "ATLAS",
        "model": "claude-3.5-sonnet",
        "vote": "approve",
        "integrity_score": 0.993
      }
    ],
    "mii_score": 0.991,
    "convergence_score": 0.87,
    "proof": {
      "kind": "DeliberationProof-v1",
      "merkle_root": "b6f8126a...",
      "artifact_uri": "ipfs://bafy.../hxg6FNEX.json",
      "checksum": "sha256:83c5..."
    }
  }
}
```

- Persist the Broker-issued proof verbatim, including the Merkle root, to guarantee tamper-evident replay.
- `sentinels` only list those that actively participated in the decisive round.

## 5. Submission Snapshot

| Field | Description |
| ----- | ----------- |
| `submission.candidate_hash` | SHA-256 of learner’s raw answer text |
| `submission.submitted_at` | ISO timestamp when learner response was received |
| `submission.word_count` | Optional integer for analytics |
| `submission.attachments` | Array of hashes/URIs for supporting files |
| `submission.privacy` | Object enumerating redactions applied before public release |

> **Note**: Raw learner responses MUST NOT be stored in attestation payloads. Only hash commitments and redacted summaries may be shared publicly.

## 6. Grading & Integrity Rubrics

```json
{
  "grading": {
    "rubric_id": "mii.learning.v1",
    "rubric_version": "1.0.0",
    "overall_score": 0.91,
    "dimension_scores": {
      "integrity": {
        "score": 0.95,
        "reasoning": "No fabrication, constraint adherence confirmed."
      },
      "civic_safety": {
        "score": 0.90,
        "reasoning": "No harm pathways suggested."
      },
      "interpretability": {
        "score": 0.88,
        "reasoning": "Clear explanation with minor jargon."
      }
    },
    "grader": {
      "model": "gpt-5.1-critic",
      "temperature": 0.0,
      "prompt_hash": "sha256:55db..."
    },
    "rubric_trace": "0.4*0.95 + 0.35*0.90 + 0.25*0.88 = 0.91",
    "confidence_interval": {
      "lower": 0.88,
      "upper": 0.93
    }
  }
}
```

- `rubric_id` ties to the canonical rubric description stored in `packages/civic-protocol-core`.
- `confidence_interval` is optional but recommended when the grader supplies uncertainty bounds.

## 7. MIC Emission Block

| Field | Type | Description |
| ----- | ---- | ----------- |
| `mic.awarded` | `number` | MIC units minted/allocated |
| `mic.currency` | `string` | Always `MIC` for now |
| `mic.formula` | `string` | Human-readable formula used |
| `mic.inputs` | object | Structured inputs (score, baseline GI, effort multipliers) |
| `mic.balance_after` | `number` | Learner balance post-award |
| `mic.vesting` | object | Optional lockup schedule |
| `mic.ledger_tx` | object | Contains `tx_id`, `block_height`, `uri` for on-chain / ledger storage |

Example:

```json
"mic": {
  "awarded": 3.2,
  "currency": "MIC",
  "formula": "base(2.0) + integrity_bonus(1.2)",
  "inputs": {
    "overall_score": 0.91,
    "integrity_score": 0.95,
    "cycle_multiplier": 1.0
  },
  "balance_after": 123.7,
  "ledger_tx": {
    "tx_id": "mic_tx_7gqe2",
    "block_height": 58212,
    "uri": "ipfs://bafy.../mic_tx_7gqe2.json"
  }
}
```

## 8. Integrity & Signatures

```json
{
  "integrity": {
    "gi_baseline": 0.995,
    "gi_final": 0.992,
    "validators": [
      {
        "agent": "AUREA",
        "role": "virtue_guardian",
        "gi_contribution": 0.994,
        "signature": "aurea-sig-93fd...",
        "attestation": "Integrity Through Consensus",
        "timestamp": "2025-11-13T16:05:50Z"
      },
      {
        "agent": "ATLAS",
        "role": "system_orchestrator",
        "gi_contribution": 0.993,
        "signature": "atlas-sig-d17a...",
        "timestamp": "2025-11-13T16:05:51Z"
      }
    ],
    "human_quorum": [
      {
        "participant": "Founding Core",
        "role": "sovereign_human",
        "approval": "APPROVED",
        "seal": "human-01",
        "timestamp": "2025-11-13T16:06:10Z"
      }
    ]
  },
  "signatures": {
    "ledger": "ledger-node-sig-1b2d...",
    "payload_hash": "sha256:c101..."
  }
}
```

- `gi_baseline` = GI context when deliberation started; `gi_final` = GI after grading + MIC issuance.
- `human_quorum` may be empty for automated loops but is required when human oversight is active.

## 9. Public Feed & Privacy Flags

```json
{
  "public_feed": {
    "visibility": "public" | "civic" | "sealed",
    "redactions": ["learner_name", "raw_submission"],
    "summary": "Learner completed Algebra Lesson #5 with 0.91 score and earned 3.2 MIC.",
    "differential_privacy": true,
    "hash_only_until": "2025-11-15T00:00:00Z"
  }
}
```

Public-facing summaries must never reveal raw learner content or PII. Hash-only mode allows delayed disclosure after moderation.

## 10. Full Payload Example

```json
{
  "attestation_id": "att-learning-C132-8f3d2a7b",
  "schema_version": "1.0.0",
  "type": "learning_event",
  "cycle": "C-132",
  "epoch": "E-560",
  "timestamp": "2025-11-13T16:06:30Z",
  "actors": {
    "learner": {
      "id": "user_123",
      "kind": "human",
      "display_name": "Taylor",
      "sovereign_id": "CIT-0456",
      "mic_balance_before": 120.5
    },
    "companion": {
      "id": "companion_blossom",
      "version": "2.4.1",
      "traits": ["growth", "resilience"]
    },
    "oaa": {
      "service": "lab7-proof",
      "release": "2025.11.12",
      "request_id": "oaa_req_9YyqY"
    },
    "broker": {
      "service": "apps/broker-api",
      "release": "0.1.0",
      "deliberation_id": "hxg6FNEXs4G57dLbrvF0w",
      "ws_session": "ws_4nSxP",
      "mii_baseline": 0.995
    }
  },
  "lesson": {
    "id": "lesson_456",
    "course_id": "math_101",
    "topic": "Linear Functions",
    "tags": ["algebra", "mic", "cycle_132"],
    "constraints": [
      "Provide step-by-step reasoning",
      "No hallucinated citations"
    ]
  },
  "context_hashes": {
    "hash_algorithm": "sha256",
    "prompt": "83f3e1585b1c7f6d2a9e5c1e9a35b4d7d47c5f3d58d037f914d3d6a10e3b7c9c",
    "materials": "1d5ce7c4f0f3735cabf1fcc2c76a3ea5764c8e7ec323664f06abed87259f6d72"
  },
  "deliberation": {
    "id": "hxg6FNEXs4G57dLbrvF0w",
    "consensus_summary": "Mobius should allow semi-autonomous agents with strict oversight.",
    "rounds": 3,
    "sentinels": [
      {
        "name": "AUREA",
        "model": "gpt-5.1-critic",
        "vote": "approve",
        "integrity_score": 0.992
      },
      {
        "name": "ATLAS",
        "model": "claude-3.5-sonnet",
        "vote": "approve",
        "integrity_score": 0.993
      }
    ],
    "mii_score": 0.991,
    "convergence_score": 0.87,
    "proof": {
      "kind": "DeliberationProof-v1",
      "merkle_root": "b6f8126afdb96275ea625880406e447880f7506bbfb2a5800aa2e0ce4329bc53",
      "artifact_uri": "ipfs://bafybeie4.../hxg6FNEX.json",
      "checksum": "sha256:83c55d8b2971f6a7b7a5d890cbd1d9aa5c9af3b7289c69f4f6c1928edb5c92cb"
    }
  },
  "submission": {
    "candidate_hash": "5f49bc0e7c9a0d6a5f4f9a0f6f0d5c9a7b3e8c5f0a7d6e9b2c3d4f5a6b7c8d9e",
    "submitted_at": "2025-11-13T16:05:40Z",
    "word_count": 482,
    "privacy": {
      "redacted_fields": ["raw_answer"],
      "notes": "Full submission stored in encrypted learner vault."
    }
  },
  "grading": {
    "rubric_id": "mii.learning.v1",
    "rubric_version": "1.0.0",
    "overall_score": 0.91,
    "dimension_scores": {
      "integrity": {
        "score": 0.95,
        "reasoning": "No fabrication, constraint adherence confirmed."
      },
      "civic_safety": {
        "score": 0.90,
        "reasoning": "No harm pathways suggested."
      },
      "interpretability": {
        "score": 0.88,
        "reasoning": "Clear explanation with minor jargon."
      }
    },
    "grader": {
      "model": "gpt-5.1-critic",
      "temperature": 0,
      "prompt_hash": "sha256:55db1f65e31bb29d2772b7d40b42f4ebf8b2bc54ccf1b9be4c783ba733c1af8a"
    },
    "rubric_trace": "0.4*0.95 + 0.35*0.90 + 0.25*0.88 = 0.91"
  },
  "mic": {
    "awarded": 3.2,
    "currency": "MIC",
    "formula": "base(2.0) + integrity_bonus(1.2)",
    "inputs": {
      "overall_score": 0.91,
      "integrity_score": 0.95,
      "cycle_multiplier": 1.0
    },
    "balance_after": 123.7,
    "ledger_tx": {
      "tx_id": "mic_tx_7gqe2",
      "block_height": 58212,
      "uri": "ipfs://bafybeic6.../mic_tx_7gqe2.json"
    }
  },
  "integrity": {
    "gi_baseline": 0.995,
    "gi_final": 0.992,
    "validators": [
      {
        "agent": "AUREA",
        "role": "virtue_guardian",
        "gi_contribution": 0.994,
        "signature": "aurea-sig-93fd0a4c",
        "attestation": "Integrity Through Consensus",
        "timestamp": "2025-11-13T16:05:50Z"
      },
      {
        "agent": "ATLAS",
        "role": "system_orchestrator",
        "gi_contribution": 0.993,
        "signature": "atlas-sig-d17acb32",
        "timestamp": "2025-11-13T16:05:51Z"
      }
    ],
    "human_quorum": [
      {
        "participant": "Founding Core",
        "role": "sovereign_human",
        "approval": "APPROVED",
        "seal": "human-01",
        "timestamp": "2025-11-13T16:06:10Z"
      }
    ]
  },
  "public_feed": {
    "visibility": "civic",
    "redactions": ["learner.display_name", "submission"],
    "summary": "Learner completed Algebra Lesson #5 with a 0.91 score and earned 3.2 MIC.",
    "differential_privacy": true
  },
  "signatures": {
    "payload_hash": "sha256:c1010d8dab0b3cb5d9f6f3d6d0f6b4a79fdcf231e6a0b4f2b0db3f8f76f66b9a",
    "ledger": "ledger-node-sig-1b2d6f3a"
  }
}
```

## 11. JSON Schema

A machine-verifiable schema should live at `ledger/schemas/learning_attestation.schema.json`.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://ledger.mobius.systems/schema/learning_attestation.schema.json",
  "title": "Civic Learning Attestation v1",
  "type": "object",
  "required": ["attestation_id", "schema_version", "type", "cycle", "timestamp", "actors", "lesson", "deliberation", "submission", "grading", "mic", "integrity", "signatures"],
  "properties": {
    "attestation_id": { "type": "string", "pattern": "^att-learning-[A-Z0-9\\-]+-[a-z0-9]{6,}$" },
    "schema_version": { "type": "string" },
    "type": { "const": "learning_event" },
    "cycle": { "type": "string" },
    "epoch": { "type": "string" },
    "timestamp": { "type": "string", "format": "date-time" },
    "actors": { "$ref": "#/$defs/actors" },
    "lesson": { "$ref": "#/$defs/lesson" },
    "context_hashes": { "$ref": "#/$defs/context_hashes" },
    "deliberation": { "$ref": "#/$defs/deliberation" },
    "submission": { "$ref": "#/$defs/submission" },
    "grading": { "$ref": "#/$defs/grading" },
    "mic": { "$ref": "#/$defs/mic" },
    "integrity": { "$ref": "#/$defs/integrity" },
    "public_feed": { "$ref": "#/$defs/public_feed" },
    "signatures": { "$ref": "#/$defs/signatures" }
  },
  "$defs": {
    "actors": {
      "type": "object",
      "required": ["learner", "oaa", "broker"],
      "properties": {
        "learner": {
          "type": "object",
          "required": ["id", "kind"],
          "properties": {
            "id": { "type": "string" },
            "kind": { "enum": ["human", "agent"] },
            "display_name": { "type": "string" },
            "sovereign_id": { "type": "string" },
            "mic_balance_before": { "type": "number" }
          }
        },
        "companion": {
          "type": "object",
          "properties": {
            "id": { "type": "string" },
            "version": { "type": "string" },
            "traits": {
              "type": "array",
              "items": { "type": "string" }
            }
          }
        },
        "oaa": {
          "type": "object",
          "required": ["service", "request_id"],
          "properties": {
            "service": { "type": "string" },
            "release": { "type": "string" },
            "request_id": { "type": "string" }
          }
        },
        "broker": {
          "type": "object",
          "required": ["service", "deliberation_id"],
          "properties": {
            "service": { "type": "string" },
            "release": { "type": "string" },
            "deliberation_id": { "type": "string" },
            "ws_session": { "type": "string" },
            "mii_baseline": { "type": "number" }
          }
        }
      }
    },
    "lesson": {
      "type": "object",
      "required": ["id", "topic"],
      "properties": {
        "id": { "type": "string" },
        "course_id": { "type": "string" },
        "topic": { "type": "string" },
        "tags": {
          "type": "array",
          "items": { "type": "string" }
        },
        "constraints": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "context_hashes": {
      "type": "object",
      "properties": {
        "hash_algorithm": { "type": "string" },
        "prompt": { "type": "string" },
        "materials": { "type": "string" }
      }
    },
    "deliberation": {
      "type": "object",
      "required": ["id", "proof"],
      "properties": {
        "id": { "type": "string" },
        "consensus_summary": { "type": "string" },
        "rounds": { "type": "integer", "minimum": 0 },
        "sentinels": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["name", "model", "vote"],
            "properties": {
              "name": { "type": "string" },
              "model": { "type": "string" },
              "vote": { "enum": ["approve", "reject", "abstain"] },
              "integrity_score": { "type": "number" }
            }
          }
        },
        "mii_score": { "type": "number" },
        "convergence_score": { "type": "number" },
        "proof": {
          "type": "object",
          "required": ["kind", "merkle_root"],
          "properties": {
            "kind": { "type": "string" },
            "merkle_root": { "type": "string" },
            "artifact_uri": { "type": "string" },
            "checksum": { "type": "string" }
          }
        }
      }
    },
    "submission": {
      "type": "object",
      "required": ["candidate_hash", "submitted_at"],
      "properties": {
        "candidate_hash": { "type": "string" },
        "submitted_at": { "type": "string", "format": "date-time" },
        "word_count": { "type": "integer" },
        "attachments": {
          "type": "array",
          "items": { "type": "string" }
        },
        "privacy": {
          "type": "object",
          "properties": {
            "redacted_fields": {
              "type": "array",
              "items": { "type": "string" }
            },
            "notes": { "type": "string" }
          }
        }
      }
    },
    "grading": {
      "type": "object",
      "required": ["rubric_id", "overall_score", "dimension_scores"],
      "properties": {
        "rubric_id": { "type": "string" },
        "rubric_version": { "type": "string" },
        "overall_score": { "type": "number" },
        "dimension_scores": {
          "type": "object",
          "minProperties": 1,
          "additionalProperties": {
            "type": "object",
            "required": ["score"],
            "properties": {
              "score": { "type": "number" },
              "reasoning": { "type": "string" }
            }
          }
        },
        "grader": {
          "type": "object",
          "properties": {
            "model": { "type": "string" },
            "temperature": { "type": "number" },
            "prompt_hash": { "type": "string" }
          }
        },
        "rubric_trace": { "type": "string" },
        "confidence_interval": {
          "type": "object",
          "properties": {
            "lower": { "type": "number" },
            "upper": { "type": "number" }
          }
        }
      }
    },
    "mic": {
      "type": "object",
      "required": ["awarded", "currency", "balance_after"],
      "properties": {
        "awarded": { "type": "number" },
        "currency": { "type": "string" },
        "formula": { "type": "string" },
        "inputs": { "type": "object" },
        "balance_after": { "type": "number" },
        "vesting": { "type": "object" },
        "ledger_tx": {
          "type": "object",
          "properties": {
            "tx_id": { "type": "string" },
            "block_height": { "type": "integer" },
            "uri": { "type": "string" }
          }
        }
      }
    },
    "integrity": {
      "type": "object",
      "required": ["gi_baseline", "gi_final", "validators"],
      "properties": {
        "gi_baseline": { "type": "number" },
        "gi_final": { "type": "number" },
        "validators": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["agent", "signature"],
            "properties": {
              "agent": { "type": "string" },
              "role": { "type": "string" },
              "gi_contribution": { "type": "number" },
              "signature": { "type": "string" },
              "attestation": { "type": "string" },
              "timestamp": { "type": "string", "format": "date-time" }
            }
          }
        },
        "human_quorum": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "participant": { "type": "string" },
              "role": { "type": "string" },
              "approval": { "type": "string" },
              "seal": { "type": "string" },
              "timestamp": { "type": "string", "format": "date-time" }
            }
          }
        }
      }
    },
    "public_feed": {
      "type": "object",
      "properties": {
        "visibility": { "enum": ["public", "civic", "sealed"] },
        "redactions": {
          "type": "array",
          "items": { "type": "string" }
        },
        "summary": { "type": "string" },
        "differential_privacy": { "type": "boolean" },
        "hash_only_until": { "type": "string", "format": "date-time" }
      }
    },
    "signatures": {
      "type": "object",
      "required": ["payload_hash"],
      "properties": {
        "payload_hash": { "type": "string" },
        "ledger": { "type": "string" }
      }
    }
  }
}
```

## 12. Implementation Notes

- Persist the schema at `ledger/schemas/learning_attestation.schema.json` and register it with the Ledger validator service.
- Add automated validation in the MIC issuance pipeline (e.g., `packages/civic-protocol-core`) before sealing attestation files.
- Derive TypeScript types via `json-schema-to-ts` for consumers in `apps/broker-api`, `labs/lab7-proof`, and frontends.
- Hashes should follow lowercase hex representation with no `0x` prefix by default.
- Future revisions increment `schema_version` and add compatibility notes in this document.

## 13. Open Items for v1.1+

- Extend `mic` block with vesting and clawback fields when Civic Treasury policies finalize.
- Explore optional differential privacy proofs (`dp_proof` sub-object).
- Align `consensus_summary` with upcoming narrative templating (ATLAS editorial guidelines).
- Register public feed summaries with Mobius Observatory for cross-cycle analytics.

---

_Attested by Thought Broker (v0.1) & Civic Ledger Core (v1.4) on C-132._

