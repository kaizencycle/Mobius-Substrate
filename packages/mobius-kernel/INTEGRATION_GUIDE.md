# Mobius Kernel Integration Guide

**Version**: 1.1.2  
**Cycle**: C-152  
**Constitutional Amendments**: C-001, C-002, C-003, C-004, C-005

## 🎯 Overview

This guide explains how to integrate the Mobius Kernel into your existing services. The kernel provides constitutional governance for all agent actions in the Kaizen OS / Mobius Systems stack.

### Constitutional Amendments (v1.1.2)
- **C-001**: DAEDALUS cannot trigger executors (HARDCODED)
- **C-002**: ZEUS split into Coordinator (T2) and Sentinel (T4)
- **C-003**: MIC terminology (GIC → MIC migration)
- **C-004**: HERMES classified as System Agent
- **C-005**: Only Tier 3 can modify code

## Architecture

```
User Request
     ↓
API Endpoint
     ↓
ThoughtBrokerKernelIntegration
     ↓
├── 1. Sentinel Precheck (DVA, ZEUS_SENTINEL, INDEXER)
│   └── GI threshold, system load, MIC balance
├── 2. Constitutional Validation (MobiusKernel)
│   └── Load manifest, check permissions
├── 3. Tier-Based Routing
│   ├── Tier 1: Architects (design, reasoning)
│   ├── Tier 2: Strategists (planning, mediation)
│   ├── Tier 3: Executors (CODE ONLY)
│   └── Tier 4: Sentinels (enforcement)
├── 4. GI Attestation
│   └── Cryptographic integrity proof
└── 5. Ledger Commit
    └── GENESIS_LEDGER immortalization
         ↓
Response (approved/denied + attestation)
```

## Basic Integration

### Step 1: Install the Kernel

```python
# Add to your Python path
import sys
sys.path.insert(0, '/workspace/packages/mobius-kernel/src')

# Or install as package (future)
# pip install mobius-kernel
```

### Step 2: Initialize Kernel and Broker

```python
from mobius_kernel import MobiusKernel
from thought_broker_integration import (
    ThoughtBrokerKernelIntegration,
    BrokeredRequest,
    RequestType
)

# Initialize kernel with manifest
kernel = MobiusKernel("config/agents/mobius_agent_stack.v1.1.2.json")

# Initialize broker (uses MockLedgerClient by default)
broker = ThoughtBrokerKernelIntegration(kernel)
```

### Step 3: Process Agent Requests

```python
# Create a request
request = BrokeredRequest(
    request_id="req-001",
    agent_id="AUREA",
    request_type=RequestType.ARCHITECT,
    payload={"task": "design new module"}
)

# Process through broker
response = broker.broker_request(request)

if response.status == "approved":
    print(f"Success! Ledger hash: {response.ledger_hash}")
else:
    print(f"Denied: {response.denial_reason}")
```

## API Endpoint Integration

### FastAPI Example

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uuid

from mobius_kernel import MobiusKernel
from thought_broker_integration import (
    ThoughtBrokerKernelIntegration,
    BrokeredRequest,
    RequestType
)

app = FastAPI(title="Mobius Agent API")

# Initialize on startup
kernel = MobiusKernel("config/agents/mobius_agent_stack.v1.1.2.json")
broker = ThoughtBrokerKernelIntegration(kernel)

class AgentActionRequest(BaseModel):
    type: str  # ARCHITECT, EXECUTE, etc.
    payload: Dict[str, Any]
    gi_threshold: Optional[float] = 0.999

class AgentActionResponse(BaseModel):
    status: str
    result: Optional[Dict[str, Any]] = None
    ledger_hash: Optional[str] = None
    gi_attestation: Optional[str] = None
    denial_reason: Optional[str] = None

@app.post("/api/agent/{agent_id}/action", response_model=AgentActionResponse)
async def agent_action(agent_id: str, request_data: AgentActionRequest):
    """Process an agent action through constitutional enforcement."""
    
    # Map string type to RequestType enum
    try:
        request_type = RequestType[request_data.type.upper()]
    except KeyError:
        raise HTTPException(400, f"Unknown request type: {request_data.type}")
    
    # Create brokered request
    request = BrokeredRequest(
        request_id=str(uuid.uuid4()),
        agent_id=agent_id,
        request_type=request_type,
        payload=request_data.payload,
        gi_threshold=request_data.gi_threshold
    )
    
    # Process through broker
    response = broker.broker_request(request)
    
    if response.status == "denied":
        raise HTTPException(403, detail=response.denial_reason)
    
    return AgentActionResponse(
        status=response.status,
        result=response.result,
        ledger_hash=response.ledger_hash,
        gi_attestation=response.gi_attestation
    )

@app.get("/api/kernel/health")
async def kernel_health():
    """Check kernel health status."""
    return {
        "status": "ok",
        "kernel_version": kernel.manifest["version"],
        "schema_version": kernel.manifest["schema_version"],
        "agents_registered": len(kernel.agents)
    }
```

### Express.js Example (calling Python subprocess)

```javascript
const express = require('express');
const { spawn } = require('child_process');

const app = express();
app.use(express.json());

async function callKernel(agentId, requestType, payload) {
  return new Promise((resolve, reject) => {
    const python = spawn('python', [
      '-c',
      `
import sys
sys.path.insert(0, 'packages/mobius-kernel/src')
from mobius_kernel import MobiusKernel
from thought_broker_integration import ThoughtBrokerKernelIntegration, BrokeredRequest, RequestType
import json

kernel = MobiusKernel('config/agents/mobius_agent_stack.v1.1.2.json')
broker = ThoughtBrokerKernelIntegration(kernel)

request = BrokeredRequest(
    request_id='${Date.now()}',
    agent_id='${agentId}',
    request_type=RequestType.${requestType},
    payload=${JSON.stringify(payload)}
)

response = broker.broker_request(request)
print(json.dumps({
    'status': response.status,
    'result': response.result,
    'ledger_hash': response.ledger_hash,
    'denial_reason': response.denial_reason
}))
      `
    ]);
    
    let output = '';
    python.stdout.on('data', (data) => output += data.toString());
    python.stderr.on('data', (data) => console.error(data.toString()));
    python.on('close', (code) => {
      if (code === 0) {
        resolve(JSON.parse(output));
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}

app.post('/api/agent/:agentId/action', async (req, res) => {
  try {
    const result = await callKernel(
      req.params.agentId,
      req.body.type,
      req.body.payload
    );
    
    if (result.status === 'denied') {
      return res.status(403).json({ error: result.denial_reason });
    }
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

## Custom Ledger Integration

### Implementing LedgerClient

```python
from thought_broker_integration import LedgerClient
import requests

class GenesisLedgerClient(LedgerClient):
    """Production ledger client for Genesis Ledger."""
    
    def __init__(self, endpoint: str, api_key: str):
        self.endpoint = endpoint
        self.api_key = api_key
    
    def get_mic_balance(self, agent_id: str) -> float:
        """Get MIC balance from indexer."""
        response = requests.get(
            f"{self.endpoint}/mic/balance/{agent_id}",
            headers={"Authorization": f"Bearer {self.api_key}"}
        )
        return response.json()["balance"]
    
    def sign_attestation(self, data: dict) -> str:
        """Sign attestation with ledger's signing key."""
        response = requests.post(
            f"{self.endpoint}/attestations/sign",
            json=data,
            headers={"Authorization": f"Bearer {self.api_key}"}
        )
        return response.json()["signature"]
    
    def commit(self, entry: dict, ledger: str) -> dict:
        """Commit entry to specified ledger."""
        response = requests.post(
            f"{self.endpoint}/ledgers/{ledger}/commit",
            json=entry,
            headers={"Authorization": f"Bearer {self.api_key}"}
        )
        return response.json()

# Usage
ledger_client = GenesisLedgerClient(
    endpoint=os.getenv("LEDGER_BASE"),
    api_key=os.getenv("LEDGER_API_KEY")
)
broker = ThoughtBrokerKernelIntegration(kernel, ledger_client=ledger_client)
```

## Custom Tier Handlers

### Overriding Default Handlers

```python
def custom_architect_handler(request: BrokeredRequest) -> dict:
    """Custom handler for Tier 1 Architects."""
    
    # Call your actual LLM APIs
    if request.agent_id == "AUREA":
        result = call_openai_api(request.payload)
    elif request.agent_id == "ATLAS":
        result = call_anthropic_api(request.payload)
    elif request.agent_id == "ZENITH":
        result = call_gemini_api(request.payload)
    else:
        result = {"error": f"Unknown architect: {request.agent_id}"}
    
    return {
        "tier": 1,
        "tier_name": "Architects",
        "agent_id": request.agent_id,
        "result": result,
        "status": "processed"
    }

# Register custom handler
broker.register_tier_handler(1, custom_architect_handler)
```

## DVA Integration

### Connecting to DVA Service

```python
class ThoughtBrokerWithDVA(ThoughtBrokerKernelIntegration):
    """Extended broker with real DVA integration."""
    
    def __init__(self, kernel, ledger_client, dva_endpoint: str):
        super().__init__(kernel, ledger_client)
        self.dva_endpoint = dva_endpoint
    
    def _dva_approve_execution(self, request: BrokeredRequest) -> bool:
        """Check with DVA service before execution."""
        response = requests.post(
            f"{self.dva_endpoint}/validate",
            json={
                "agent_id": request.agent_id,
                "action": request.request_type.value,
                "payload": request.payload,
                "gi_threshold": request.gi_threshold
            }
        )
        
        result = response.json()
        return result.get("gi_score", 0) >= request.gi_threshold
```

## Testing Your Integration

### Unit Tests

```python
import pytest
from mobius_kernel import MobiusKernel
from thought_broker_integration import (
    ThoughtBrokerKernelIntegration,
    BrokeredRequest,
    RequestType
)

@pytest.fixture
def kernel():
    return MobiusKernel("config/agents/mobius_agent_stack.v1.1.2.json")

@pytest.fixture
def broker(kernel):
    return ThoughtBrokerKernelIntegration(kernel)

def test_daedalus_cannot_execute(broker):
    """DAEDALUS must be blocked from execution (C-001)."""
    request = BrokeredRequest(
        request_id="test-001",
        agent_id="DAEDALUS",
        request_type=RequestType.EXECUTE,
        payload={}
    )
    response = broker.broker_request(request)
    assert response.status == "denied"

def test_cursor_can_execute(broker):
    """CURSOR should be able to execute."""
    request = BrokeredRequest(
        request_id="test-002",
        agent_id="CURSOR",
        request_type=RequestType.EXECUTE,
        payload={"task": "test"}
    )
    response = broker.broker_request(request)
    assert response.status == "approved"

def test_aurea_cannot_edit_code(kernel):
    """AUREA should not be able to edit code."""
    assert not kernel.can_agent_edit_code("AUREA")

def test_gi_attestation_generated(broker):
    """All approved requests should have attestations."""
    request = BrokeredRequest(
        request_id="test-003",
        agent_id="AUREA",
        request_type=RequestType.ARCHITECT,
        payload={}
    )
    response = broker.broker_request(request)
    assert response.gi_attestation is not None
    assert len(response.gi_attestation) == 64  # SHA256 hex
```

## Monitoring

### Logging Integration

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mobius.kernel")

class MonitoredBroker(ThoughtBrokerKernelIntegration):
    """Broker with enhanced monitoring."""
    
    def broker_request(self, request: BrokeredRequest) -> BrokeredResponse:
        logger.info(f"Request: {request.agent_id} -> {request.request_type.value}")
        
        response = super().broker_request(request)
        
        if response.status == "denied":
            logger.warning(
                f"DENIED: {request.agent_id} - {response.denial_reason}"
            )
        else:
            logger.info(
                f"APPROVED: {request.agent_id} - hash={response.ledger_hash[:16]}"
            )
        
        return response
```

### Metrics Export

```python
from prometheus_client import Counter, Histogram

requests_total = Counter(
    'mobius_requests_total',
    'Total requests processed',
    ['agent_id', 'request_type', 'status']
)

request_duration = Histogram(
    'mobius_request_duration_seconds',
    'Request processing duration',
    ['agent_id', 'tier']
)

class MetricsBroker(ThoughtBrokerKernelIntegration):
    """Broker with Prometheus metrics."""
    
    def broker_request(self, request: BrokeredRequest) -> BrokeredResponse:
        start = time.time()
        
        response = super().broker_request(request)
        
        # Record metrics
        requests_total.labels(
            agent_id=request.agent_id,
            request_type=request.request_type.value,
            status=response.status
        ).inc()
        
        agent = self.kernel.get_agent(request.agent_id)
        if agent:
            request_duration.labels(
                agent_id=request.agent_id,
                tier=agent.tier
            ).observe(time.time() - start)
        
        return response
```

## Security Considerations

1. **Never bypass the broker** - All agent actions MUST flow through `broker.broker_request()`

2. **DAEDALUS constraint is HARDCODED** - Even if manifest is tampered, code enforces the block

3. **Validate manifest on load** - Kernel checks schema version and tier integrity

4. **Log all denials** - Constitutional violations are audited permanently

5. **Encrypt ledger commits** - Use production LedgerClient with proper signing

---

*"The constitution is now code. The constitution is now running."*

*Mobius Systems - C-152*
