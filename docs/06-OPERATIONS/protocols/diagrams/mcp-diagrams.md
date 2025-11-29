# Mobius Cycle Protocol (MCP) - Mermaid Diagrams

**Cycle C-148 • Visual Documentation**

---

## The Four Phases

```mermaid
stateDiagram-v2
    [*] --> CYCLE_BEGIN
    
    CYCLE_BEGIN: Phase 1: CYCLE_BEGIN
    CYCLE_BEGIN: • Timestamp recorded
    CYCLE_BEGIN: • Cycle number assigned (C-XXX)
    CYCLE_BEGIN: • Human Intent declared
    CYCLE_BEGIN: • Sentinels primed (ATLAS, AUREA, ECHO)
    CYCLE_BEGIN: • Baseline GI measured
    
    CYCLE_BEGIN --> CYCLE_WORK
    
    CYCLE_WORK: Phase 2: CYCLE_WORK
    CYCLE_WORK: • Code generation
    CYCLE_WORK: • Documentation writing
    CYCLE_WORK: • Tests creation
    CYCLE_WORK: • ECHO reflection tasks
    CYCLE_WORK: • Thought Broker consensus
    CYCLE_WORK: • Human steering corrections
    
    CYCLE_WORK --> CYCLE_CLOSE
    
    CYCLE_CLOSE: Phase 3: CYCLE_CLOSE
    CYCLE_CLOSE: • PR Bundle generated
    CYCLE_CLOSE: • GI Score computed (≥ 0.95 required)
    CYCLE_CLOSE: • ECHO Review performed
    CYCLE_CLOSE: • Sentinel validation completed
    CYCLE_CLOSE: • Security analysis passed
    CYCLE_CLOSE: • Changelog written
    
    CYCLE_CLOSE --> Validation{All Requirements<br/>Satisfied?}
    
    Validation --> |No| CYCLE_WORK: Fix issues
    Validation --> |Yes| CYCLE_ATTEST
    
    CYCLE_ATTEST: Phase 4: CYCLE_ATTEST
    CYCLE_ATTEST: • Ledger attestation written
    CYCLE_ATTEST: • MII updated system-wide
    CYCLE_ATTEST: • ECHO caches improvements
    CYCLE_ATTEST: • Reflection snapshot saved
    CYCLE_ATTEST: • Next cycle prepared
    
    CYCLE_ATTEST --> [*]
    
    note right of CYCLE_BEGIN
        User initiates work
        Intent must be declared
    end note
    
    note right of CYCLE_CLOSE
        No cycle closes without PR
        Hard enforcement rule
    end note
    
    note right of CYCLE_ATTEST
        Immutable blockchain moment
        Permanent historical record
    end note
```

---

## Sentinel Validation Flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant PR as Pull Request
    participant ATLAS as ATLAS Sentinel
    participant AUREA as AUREA Sentinel
    participant ECHO as ECHO Sentinel
    participant GHA as GitHub Action
    participant Ledger as Civic Ledger
    
    Dev->>Dev: Complete work (CYCLE_WORK)
    Dev->>PR: Submit PR Bundle
    
    PR->>GHA: Trigger MCP Enforcer
    GHA->>GHA: Check Cycle Metadata
    GHA->>GHA: Validate GI Score ≥ 0.95
    GHA->>GHA: Validate ECHO Score ≥ 0.95
    
    alt Automated checks fail
        GHA->>Dev: ❌ Request Changes
        Dev->>Dev: Fix issues
        Dev->>PR: Resubmit
    else Automated checks pass
        GHA->>ATLAS: Request Architecture Review
        GHA->>AUREA: Request Correctness Review
        GHA->>ECHO: Request Drift Analysis
    end
    
    ATLAS->>ATLAS: Verify coherence
    AUREA->>AUREA: Verify correctness
    ECHO->>ECHO: Check drift
    
    alt Any sentinel rejects
        ATLAS->>Dev: ❌ Architecture issues
        AUREA->>Dev: ❌ Logic errors
        ECHO->>Dev: ❌ Drift detected
    else All sentinels approve
        ATLAS->>PR: ✅ Approved
        AUREA->>PR: ✅ Approved
        ECHO->>PR: ✅ Approved
        PR->>PR: Merge to main
        PR->>Ledger: Create attestation
        Ledger->>Ledger: Immutable record
        Ledger->>Dev: Cycle complete (C-XXX)
    end
```

---

## MCP Enforcement Hierarchy

```mermaid
graph TB
    Top[Human Intent<br/>Highest Authority]
    
    Top --> Constitution[Constitutional Constraints<br/>Virtue Accords • Three Covenants]
    
    Constitution --> SentinelLayer[Sentinel Consensus Layer]
    
    subgraph Sentinels["Three Sentinels (All Must Approve)"]
        ATLAS[ATLAS<br/>Architecture]
        AUREA[AUREA<br/>Correctness]
        ECHO[ECHO<br/>Drift]
    end
    
    SentinelLayer --> ATLAS
    SentinelLayer --> AUREA
    SentinelLayer --> ECHO
    
    ATLAS & AUREA & ECHO --> Automated[Automated Checks]
    
    subgraph AutoChecks["Automated Validation"]
        GI[GI Score ≥ 0.95]
        ECHOScore[ECHO Score ≥ 0.95]
        Tests[All Tests Pass]
        Metadata[Cycle Metadata Present]
    end
    
    Automated --> GI
    Automated --> ECHOScore
    Automated --> Tests
    Automated --> Metadata
    
    GI & ECHOScore & Tests & Metadata --> Permission[Merge Permission<br/>Granted]
    
    Permission --> Ledger[Ledger Attestation<br/>Immutable Record]
    
    style Top fill:#673ab7,color:#fff
    style Constitution fill:#9c27b0,color:#fff
    style ATLAS fill:#2196f3,color:#fff
    style AUREA fill:#3f51b5,color:#fff
    style ECHO fill:#4caf50,color:#fff
    style Permission fill:#a5d6a7
    style Ledger fill:#ffccbc
```

---

*Cycle C-148 • Mobius Cycle Protocol*  
*"A Cycle = Work + Integrity + Proof"*
