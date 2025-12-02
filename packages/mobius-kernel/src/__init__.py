"""
Mobius Kernel - Constitutional Enforcement for Kaizen OS
=========================================================

This package provides the core kernel for enforcing constitutional
constraints in the Mobius Agent Stack.

Core Principle: "Mind above Hands, Sentinels around all"

Usage:
    from mobius_kernel import MobiusKernel
    from mobius_kernel.thought_broker_integration import (
        ThoughtBrokerKernelIntegration,
        BrokeredRequest,
        RequestType
    )
    
    # Initialize kernel
    kernel = MobiusKernel("config/agents/mobius_agent_stack.v1.1.1.json")
    
    # Initialize broker
    broker = ThoughtBrokerKernelIntegration(kernel)
    
    # Process requests
    request = BrokeredRequest(
        request_id="req-001",
        agent_id="AUREA",
        request_type=RequestType.ARCHITECT,
        payload={"task": "design module"}
    )
    response = broker.broker_request(request)
"""

from .mobius_kernel import (
    MobiusKernel,
    AgentSpec,
    ActionType,
)

from .thought_broker_integration import (
    ThoughtBrokerKernelIntegration,
    BrokeredRequest,
    BrokeredResponse,
    RequestType,
    LedgerClient,
    MockLedgerClient,
)

__version__ = "1.1.1"
__all__ = [
    "MobiusKernel",
    "AgentSpec",
    "ActionType",
    "ThoughtBrokerKernelIntegration",
    "BrokeredRequest",
    "BrokeredResponse",
    "RequestType",
    "LedgerClient",
    "MockLedgerClient",
]
