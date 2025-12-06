# Civic OS Labor API (v0.1)

Base path: `//api/civic/labor`

All endpoints are expected to:

- Log relevant actions to the Civic Ledger
- Respect GI scoring thresholds
- Avoid making irreversible changes without human visibility

---

## POST `/analyze-workload`

Analyze workload distribution and flag potential overwork or inequity.

**Request:**

```json
{
  "org_id": "acme-corp",
  "period": {
    "from": "2025-11-01",
    "to": "2025-11-30"
  },
  "workers": [
    {
      "worker_id": "u123",
      "hours": 182,
      "tasks_completed": 96,
      "role": "support-analyst",
      "team": "custody"
    }
  ],
  "metadata": {
    "source": "hris-system-x",
    "requester": "hr-manager-17"
  }
}
```

**Response:**

```json
{
  "gi_score": 0.91,
  "summary": "Detected 3 workers with sustained overload patterns.",
  "flags": [
    {
      "worker_id": "u123",
      "issue": "overload",
      "details": "Average 52 hours/week over 4 weeks.",
      "recommendations": [
        "Rebalance tickets away from u123.",
        "Grant recovery day in next sprint."
      ]
    }
  ],
  "attestation_id": "labor-attest-01f8..."
}
```

---

## POST `/audit-contract`

Analyze an employment contract for coercive or unfair clauses.

**Request:**

```json
{
  "worker_id": "u123",
  "contract_text": "full legal text here...",
  "jurisdiction": "US-NY",
  "role_family": "software-engineer"
}
```

**Response:**

```json
{
  "gi_score": 0.88,
  "verdict": "REQUIRES_REVIEW",
  "issues": [
    {
      "clause_id": "section-7-noncompete",
      "severity": "high",
      "tag": "noncompete",
      "explanation": "Post-employment non-compete of 24 months is likely unenforceable and coercive in this jurisdiction."
    }
  ],
  "suggested_rewrites": [
    {
      "clause_id": "section-7-noncompete",
      "replacement": "Narrowly scoped non-solicitation clause of 6 months limited to direct clients."
    }
  ],
  "attestation_id": "labor-attest-02a1..."
}
```

---

## POST `/fair-wage`

Audit wage fairness against market and internal benchmarks.

**Request:**

```json
{
  "org_id": "acme-corp",
  "worker": {
    "worker_id": "u123",
    "role": "senior-analyst",
    "years_experience": 7,
    "location": "US-NY",
    "current_salary": 110000
  },
  "comparison_set": {
    "internal_peers": [
      { "salary": 118000 },
      { "salary": 122000 },
      { "salary": 115000 }
    ],
    "external_market_band": {
      "p25": 112000,
      "p50": 120000,
      "p75": 128000
    }
  }
}
```

**Response:**

```json
{
  "gi_score": 0.89,
  "verdict": "BELOW_MARKET",
  "delta": {
    "to_internal_median": 9000,
    "to_external_median": 10000
  },
  "recommendation": "Increase salary to at least $120,000 to align with external median and internal peers.",
  "attestation_id": "labor-attest-033b..."
}
```

---

## POST `/ledger/attest`

Write a labor-related attestation into the Civic Ledger. Implementation detail: this should delegate to the core Civic Ledger service.

**Request (simplified):**

```json
{
  "type": "labor_event",
  "org_id": "acme-corp",
  "worker_id": "u123",
  "event": {
    "kind": "workload_analysis",
    "payload": {
      "hours": 182,
      "flag": "overload"
    }
  }
}
```

**Response (simplified):**

```json
{
  "attestation_id": "labor-attest-045c...",
  "timestamp": "2025-11-25T15:21:12Z"
}
```
