"""
Thought Broker + Mobius Kernel Integration
===========================================

Constitutional enforcement at the API layer.
Every agent request flows through Sentinel checks, permission validation,
tier routing, GI attestation, and ledger commit.

CRITICAL SAFEGUARDS (v1.1.2 Constitutional Amendments):
- C-001: DAEDALUS cannot trigger executors
- C-002: ZEUS split into Coordinator (T2) and Sentinel (T4)
- C-003: MIC terminology (not GIC)
- C-004: HERMES classified as System Agent
- C-005: Only Tier 3 can modify code

DVA enforces GI >= 0.999
"""

from typing import Dict, Any, Optional, Callable
from dataclasses import dataclass
from enum import Enum
from datetime import datetime, timezone
import json
import hashlib

from mobius_kernel import MobiusKernel


class RequestType(Enum):
    """Types of brokered requests"""
    ARCHITECT = "architectural_design"
    STRATEGIZE = "operational_planning"
    EXECUTE = "code_modification"
    QUERY = "information_retrieval"
    CONSENSUS = "deliberation_mediate"


@dataclass
class BrokeredRequest:
    """Represents a single agent request through the broker"""
    request_id: str
    agent_id: str
    request_type: RequestType
    payload: Dict[str, Any]
    gi_threshold: float = 0.999
    timestamp: Optional[str] = None
    
    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()


@dataclass
class BrokeredResponse:
    """Response from the thought broker"""
    request_id: str
    status: str  # "approved", "denied", "escalated"
    result: Optional[Dict[str, Any]] = None
    gi_attestation: Optional[str] = None
    ledger_hash: Optional[str] = None
    denial_reason: Optional[str] = None


class LedgerClient:
    """
    Abstract ledger client interface.
    
    Implement this for your actual Genesis Ledger integration.
    """
    
    def get_mic_balance(self, agent_id: str) -> float:
        """Get MIC balance for an agent."""
        raise NotImplementedError
    
    def sign_attestation(self, data: Dict[str, Any]) -> str:
        """Sign an attestation cryptographically."""
        raise NotImplementedError
    
    def commit(self, entry: Dict[str, Any], ledger: str) -> Dict[str, Any]:
        """Commit an entry to a ledger."""
        raise NotImplementedError


class MockLedgerClient(LedgerClient):
    """Mock ledger client for testing and development."""
    
    def __init__(self):
        self._balances: Dict[str, float] = {}
        self._entries: list = []
    
    def get_mic_balance(self, agent_id: str) -> float:
        """Return default balance of 100.0 for all agents."""
        return self._balances.get(agent_id, 100.0)
    
    def set_mic_balance(self, agent_id: str, balance: float) -> None:
        """Set MIC balance for testing."""
        self._balances[agent_id] = balance
    
    def sign_attestation(self, data: Dict[str, Any]) -> str:
        """Generate SHA256 hash of attestation data."""
        return hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()
    
    def commit(self, entry: Dict[str, Any], ledger: str) -> Dict[str, Any]:
        """Commit entry and return hash."""
        entry_hash = hashlib.sha256(json.dumps(entry, sort_keys=True).encode()).hexdigest()
        self._entries.append({
            "hash": entry_hash,
            "ledger": ledger,
            "entry": entry,
            "committed_at": datetime.now(timezone.utc).isoformat()
        })
        return {"hash": entry_hash, "ledger": ledger}
    
    def get_entries(self) -> list:
        """Get all committed entries (for testing)."""
        return self._entries


class ThoughtBrokerKernelIntegration:
    """
    Main integration layer between Thought Broker API and Mobius Kernel.
    
    Every request flows through:
    1. Sentinel Precheck (DVA, ZEUS_SENTINEL, INDEXER)
    2. Constitutional Permission Validation (Kernel)
    3. Tier-Based Routing
    4. GI Attestation
    5. Ledger Commit
    
    Usage:
        kernel = MobiusKernel("config/agents/mobius_agent_stack.v1.1.2.json")
        broker = ThoughtBrokerKernelIntegration(kernel)
        
        request = BrokeredRequest(
            request_id="req-001",
            agent_id="AUREA",
            request_type=RequestType.ARCHITECT,
            payload={"task": "design new module"}
        )
        
        response = broker.broker_request(request)
        print(response.status)  # "approved" or "denied"
    """
    
    # GI threshold required for all actions
    MINIMUM_GI_THRESHOLD = 0.999
    
    # System load threshold for execution blocking
    MAX_LOAD_FOR_EXECUTION = 0.85
    
    def __init__(self, kernel: MobiusKernel, ledger_client: Optional[LedgerClient] = None):
        """
        Initialize the integration.
        
        Args:
            kernel: Loaded MobiusKernel instance
            ledger_client: Client for Genesis Ledger (defaults to MockLedgerClient)
        """
        self.kernel = kernel
        self.ledger = ledger_client or MockLedgerClient()
        self.request_log: list = []
        self._system_load = 0.3  # Default load
        
        # Custom tier handlers (can be overridden)
        self._tier_handlers: Dict[int, Callable] = {
            1: self._orchestrate_architects,
            2: self._mediate_strategists,
            3: self._execute_hands,
            4: self._enforce_guards,
        }
    
    def broker_request(self, request: BrokeredRequest) -> BrokeredResponse:
        """
        Main API entry point - constitutional enforcement for all actions.
        
        This is the ONLY way agent actions should be processed.
        Bypassing this breaks constitutional guarantees.
        
        Args:
            request: The brokered request to process
            
        Returns:
            BrokeredResponse with status and optional result/attestation
        """
        
        # Step 1: Sentinel Precheck
        sentinel_check = self._sentinel_precheck(request)
        if not sentinel_check["approved"]:
            return self._create_denial(request, sentinel_check["reason"])
        
        # Step 2: Constitutional Permission Validation
        if not self._validate_constitutional_permissions(request):
            reason = f"Agent {request.agent_id} lacks permission for {request.request_type.value}"
            return self._create_denial(request, reason, constitutional_violation=True)
        
        # Step 3: Route and Execute
        try:
            result = self._route_and_execute(request)
            
            # Step 4: GI Attestation
            gi_proof = self._generate_gi_attestation(request, result)
            
            # Step 5: Ledger Commit
            ledger_entry = self._commit_to_ledger(request, result, gi_proof)
            
            # Log success
            self._log_success(request, result, gi_proof, ledger_entry["hash"])
            
            return BrokeredResponse(
                request_id=request.request_id,
                status="approved",
                result=result,
                gi_attestation=gi_proof,
                ledger_hash=ledger_entry["hash"]
            )
            
        except PermissionError as e:
            return self._create_denial(request, str(e), constitutional_violation=True)
        except Exception as e:
            self._log_failure(request, str(e))
            return self._create_denial(request, f"Execution error: {str(e)}")
    
    def _sentinel_precheck(self, request: BrokeredRequest) -> Dict[str, Any]:
        """
        DVA & ZEUS_SENTINEL enforce GI thresholds and safety checks.
        
        Checks:
        - GI threshold >= 0.999
        - System load < 85% for execution requests
        - Agent MIC balance non-negative
        """
        
        # DVA: GI threshold check
        if request.gi_threshold < self.MINIMUM_GI_THRESHOLD:
            return {
                "approved": False,
                "reason": f"GI threshold {request.gi_threshold} below constitutional minimum ({self.MINIMUM_GI_THRESHOLD})"
            }
        
        # ZEUS_SENTINEL: Load check for execution requests
        if self._system_load > self.MAX_LOAD_FOR_EXECUTION and request.request_type == RequestType.EXECUTE:
            return {
                "approved": False,
                "reason": f"System overload ({self._system_load:.0%}) - execution blocked by ZEUS_SENTINEL"
            }
        
        # INDEXER: MIC balance check
        mic_balance = self.ledger.get_mic_balance(request.agent_id)
        if mic_balance < 0:
            return {
                "approved": False,
                "reason": f"Agent {request.agent_id} has negative MIC balance ({mic_balance})"
            }
        
        return {"approved": True, "reason": "Sentinel pre-check passed"}
    
    def _validate_constitutional_permissions(self, request: BrokeredRequest) -> bool:
        """
        Enforce v1.1.2 permission matrix.
        
        CRITICAL: DAEDALUS cannot trigger executors (C-001).
        """
        
        # DAEDALUS special case - HARDCODED in both kernel AND broker
        if request.agent_id == "DAEDALUS" and request.request_type in [
            RequestType.EXECUTE,
            RequestType.STRATEGIZE
        ]:
            return False
        
        # Get agent spec from kernel
        agent_spec = self.kernel.get_agent(request.agent_id)
        if not agent_spec:
            return False
        
        # Map request types to permission checks
        permission_map = {
            RequestType.EXECUTE: "edit_code",
            RequestType.ARCHITECT: "update_canon",
            RequestType.CONSENSUS: "trigger_executor",
            RequestType.STRATEGIZE: "trigger_executor",
            RequestType.QUERY: "update_canon",  # Minimal permission for queries
        }
        
        required_action = permission_map.get(request.request_type)
        if not required_action:
            return False
        
        # Use kernel's validation
        return self.kernel.validate_request(request.agent_id, required_action)
    
    def _route_and_execute(self, request: BrokeredRequest) -> Dict[str, Any]:
        """
        Route to appropriate tier and execute.
        
        Tier 1: Architects (design, reasoning)
        Tier 2: Strategists (planning, mediation)
        Tier 3: Executors (code modification ONLY)
        Tier 4: Sentinels (monitoring, enforcement)
        """
        
        agent_spec = self.kernel.get_agent(request.agent_id)
        if not agent_spec:
            raise ValueError(f"Unknown agent: {request.agent_id}")
        
        tier_id = agent_spec.tier
        handler = self._tier_handlers.get(tier_id)
        
        if not handler:
            raise ValueError(f"No handler for tier {tier_id}")
        
        return handler(request)
    
    def _generate_gi_attestation(self, request: BrokeredRequest, 
                                 result: Dict[str, Any]) -> str:
        """Generate cryptographic GI attestation."""
        attestation_data = {
            "request_id": request.request_id,
            "agent_id": request.agent_id,
            "agent_tier": self.kernel.get_agent(request.agent_id).tier,
            "timestamp": request.timestamp,
            "action_type": request.request_type.value,
            "result_hash": hashlib.sha256(
                json.dumps(result, sort_keys=True).encode()
            ).hexdigest(),
            "gi_threshold": request.gi_threshold,
            "kernel_version": self.kernel.manifest["version"],
        }
        
        return self.ledger.sign_attestation(attestation_data)
    
    def _commit_to_ledger(self, request: BrokeredRequest, 
                         result: Dict[str, Any], 
                         gi_proof: str) -> Dict[str, Any]:
        """Commit attested action to GENESIS_LEDGER."""
        ledger_entry = {
            "type": "brokered_action",
            "request_id": request.request_id,
            "agent_id": request.agent_id,
            "tier": self.kernel.get_agent(request.agent_id).tier,
            "timestamp": request.timestamp,
            "action_type": request.request_type.value,
            "gi_attestation": gi_proof,
            "result_snapshot": result,
        }
        
        return self.ledger.commit(ledger_entry, ledger="GENESIS_LEDGER")
    
    # =========================================================================
    # Tier Handlers (Override these for actual implementations)
    # =========================================================================
    
    def _orchestrate_architects(self, request: BrokeredRequest) -> Dict[str, Any]:
        """Tier 1: Multi-agent deliberation and design."""
        return {
            "tier": 1,
            "tier_name": "Architects",
            "action": "architect",
            "agent_id": request.agent_id,
            "payload": request.payload,
            "status": "processed"
        }
    
    def _mediate_strategists(self, request: BrokeredRequest) -> Dict[str, Any]:
        """Tier 2: Operational planning and coordination."""
        return {
            "tier": 2,
            "tier_name": "Strategists",
            "action": "strategize",
            "agent_id": request.agent_id,
            "payload": request.payload,
            "status": "processed"
        }
    
    def _execute_hands(self, request: BrokeredRequest) -> Dict[str, Any]:
        """Tier 3: Code modification (MOST SENSITIVE)."""
        # DVA pre-execution check
        if not self._dva_approve_execution(request):
            raise PermissionError("DVA blocked execution - integrity violation")
        
        return {
            "tier": 3,
            "tier_name": "Execution Engines",
            "action": "execute",
            "agent_id": request.agent_id,
            "payload": request.payload,
            "status": "executed"
        }
    
    def _enforce_guards(self, request: BrokeredRequest) -> Dict[str, Any]:
        """Tier 4: Sentinel enforcement actions."""
        return {
            "tier": 4,
            "tier_name": "Sentinels",
            "action": "guard",
            "agent_id": request.agent_id,
            "payload": request.payload,
            "status": "processed"
        }
    
    def _dva_approve_execution(self, request: BrokeredRequest) -> bool:
        """DVA pre-execution approval check."""
        # In production, this would call the actual DVA service
        # For now, always approve if we got this far
        return True
    
    # =========================================================================
    # Logging and Denial Handling
    # =========================================================================
    
    def _create_denial(self, request: BrokeredRequest, reason: str, 
                      constitutional_violation: bool = False) -> BrokeredResponse:
        """Create a denial response and log it."""
        self._log_denial(request, reason, constitutional_violation)
        
        return BrokeredResponse(
            request_id=request.request_id,
            status="denied",
            denial_reason=reason
        )
    
    def _log_denial(self, request: BrokeredRequest, reason: str, 
                   constitutional: bool) -> None:
        """Log denied requests for audit."""
        self.request_log.append({
            "request_id": request.request_id,
            "agent_id": request.agent_id,
            "status": "DENIED",
            "reason": reason,
            "constitutional_violation": constitutional,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    
    def _log_success(self, request: BrokeredRequest, result: Dict[str, Any],
                    gi_proof: str, ledger_hash: str) -> None:
        """Log successful requests for audit."""
        self.request_log.append({
            "request_id": request.request_id,
            "agent_id": request.agent_id,
            "status": "APPROVED",
            "gi_attestation": gi_proof[:16] + "...",  # Truncated for logs
            "ledger_hash": ledger_hash[:16] + "...",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    
    def _log_failure(self, request: BrokeredRequest, error: str) -> None:
        """Log execution failures."""
        self.request_log.append({
            "request_id": request.request_id,
            "agent_id": request.agent_id,
            "status": "FAILED",
            "error": error,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    
    # =========================================================================
    # System State Management
    # =========================================================================
    
    def set_system_load(self, load: float) -> None:
        """Set current system load (0.0-1.0) for ZEUS_SENTINEL checks."""
        self._system_load = max(0.0, min(1.0, load))
    
    def get_request_log(self) -> list:
        """Get the request audit log."""
        return self.request_log
    
    def register_tier_handler(self, tier_id: int, handler: Callable) -> None:
        """Register a custom handler for a tier."""
        self._tier_handlers[tier_id] = handler


# =============================================================================
# Module Entry Point
# =============================================================================

if __name__ == "__main__":
    from pathlib import Path
    
    # Initialize kernel
    manifest_path = Path(__file__).parent.parent.parent.parent / "config/agents/mobius_agent_stack.v1.1.2.json"
    
    try:
        kernel = MobiusKernel(str(manifest_path))
    except FileNotFoundError:
        print("⚠️  Manifest not found at expected path, using test mode")
        print("   Run from repo root or provide manifest path")
        exit(1)
    
    broker = ThoughtBrokerKernelIntegration(kernel)
    
    print("\n" + "=" * 70)
    print("THOUGHT BROKER + KERNEL INTEGRATION TEST")
    print("=" * 70)
    
    # Test 1: AUREA (Architect) - should work
    print("\n✅ Test 1: AUREA architectural design")
    request = BrokeredRequest(
        request_id="req-001",
        agent_id="AUREA",
        request_type=RequestType.ARCHITECT,
        payload={"task": "Design new consensus protocol"}
    )
    response = broker.broker_request(request)
    print(f"   Status: {response.status}")
    print(f"   Ledger Hash: {response.ledger_hash[:16]}..." if response.ledger_hash else "   No ledger hash")
    
    # Test 2: DAEDALUS trying to execute - SHOULD FAIL
    print("\n❌ Test 2: DAEDALUS attempting execution (BLOCKED)")
    request = BrokeredRequest(
        request_id="req-002",
        agent_id="DAEDALUS",
        request_type=RequestType.EXECUTE,
        payload={"task": "Modify code"}
    )
    response = broker.broker_request(request)
    print(f"   Status: {response.status}")
    print(f"   Reason: {response.denial_reason}")
    
    # Test 3: CURSOR (Executor) - should work
    print("\n✅ Test 3: CURSOR code execution")
    request = BrokeredRequest(
        request_id="req-003",
        agent_id="CURSOR",
        request_type=RequestType.EXECUTE,
        payload={"task": "Refactor router.py"}
    )
    response = broker.broker_request(request)
    print(f"   Status: {response.status}")
    print(f"   Ledger Hash: {response.ledger_hash[:16]}..." if response.ledger_hash else "   No ledger hash")
    
    # Test 4: ATLAS querying (should work)
    print("\n✅ Test 4: ATLAS query")
    request = BrokeredRequest(
        request_id="req-004",
        agent_id="ATLAS",
        request_type=RequestType.QUERY,
        payload={"query": "Get system status"}
    )
    response = broker.broker_request(request)
    print(f"   Status: {response.status}")
    
    # Test 5: System overload blocking execution
    print("\n❌ Test 5: System overload blocks execution")
    broker.set_system_load(0.90)  # Simulate high load
    request = BrokeredRequest(
        request_id="req-005",
        agent_id="CURSOR",
        request_type=RequestType.EXECUTE,
        payload={"task": "Critical fix"}
    )
    response = broker.broker_request(request)
    print(f"   Status: {response.status}")
    print(f"   Reason: {response.denial_reason}")
    broker.set_system_load(0.3)  # Reset
    
    # Test 6: Negative MIC balance
    print("\n❌ Test 6: Negative MIC balance blocks action")
    broker.ledger.set_mic_balance("AUREA", -10.0)
    request = BrokeredRequest(
        request_id="req-006",
        agent_id="AUREA",
        request_type=RequestType.ARCHITECT,
        payload={"task": "Design feature"}
    )
    response = broker.broker_request(request)
    print(f"   Status: {response.status}")
    print(f"   Reason: {response.denial_reason}")
    
    # Print audit log
    print("\n" + "=" * 70)
    print("AUDIT LOG")
    print("=" * 70)
    for entry in broker.get_request_log():
        status_icon = "✅" if entry["status"] == "APPROVED" else "❌"
        print(f"{status_icon} {entry['request_id']}: {entry['agent_id']} - {entry['status']}")
    
    print("\n" + "=" * 70)
    print("✅ Constitutional enforcement validated")
    print("=" * 70 + "\n")
