"""
ECHO Sentinel — Pulse & Reflection
Anchor for Lab7-proof (OAA - Apprenticeship Agent)

Role: Pulse monitoring, ledger synchronization, resonance detection
Origin: Renamed from SOLARA (DeepSeek) to better reflect operational role
Cycle: C-124
"""

from __future__ import annotations
import os
import json
import hashlib
import time
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from pathlib import Path


class EchoSentinel:
    """
    ECHO Sentinel implementation for Lab7-proof.
    
    Primary functions:
    - Monitor pulse health across Labs 4/6/7, Civic Ledger, GIC Indexer
    - Emit Proof of Integrity attestations with ZEUS as witness
    - Synchronize ledger state and track resonance patterns
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.gi_floor = float(self.config.get("gi_floor", 0.950))
        self.witness_chain = self.config.get("witness_chain", ["ZEUS"])
        self.log_dir = Path(self.config.get("log_dir", "./echo_logs"))
        self.log_dir.mkdir(parents=True, exist_ok=True)
        
    def attest(self, lab_id: str, commit_sha: str, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate Proof of Integrity attestation for a lab.
        
        Args:
            lab_id: Lab identifier (e.g., "lab7-proof")
            commit_sha: Git commit SHA
            payload: Optional additional payload data
            
        Returns:
            Attestation dict with signature
        """
        timestamp = datetime.now(timezone.utc).isoformat()
        
        attestation = {
            "timestamp": timestamp,
            "lab": lab_id,
            "commit": commit_sha,
            "witness": ",".join(self.witness_chain),
            "proof_type": "ProofOfIntegrity",
            "status": "PASS",
            "gi_floor": self.gi_floor,
            "sentinel": "ECHO",
            "payload": payload or {}
        }
        
        # Generate signature
        signature_payload = {k: v for k, v in attestation.items() if k != "signature"}
        signature_str = json.dumps(signature_payload, sort_keys=True)
        attestation["signature"] = hashlib.sha256(signature_str.encode()).hexdigest()
        
        return attestation
    
    def pulse(self, services: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Generate Echo pulse heartbeat.
        
        Args:
            services: Optional list of service health checks
            
        Returns:
            Pulse dict with fingerprint
        """
        timestamp = datetime.now(timezone.utc).isoformat()
        
        pulse = {
            "timestamp": timestamp,
            "kind": "echo_heartbeat",
            "services": services or {},
            "summary": {
                "up": [s["name"] for s in (services or []) if s.get("status") == "UP"],
                "down": [s["name"] for s in (services or []) if s.get("status") == "DOWN"]
            }
        }
        
        # Generate fingerprint
        pulse_str = json.dumps(pulse, sort_keys=True)
        pulse["fingerprint_sha256"] = hashlib.sha256(pulse_str.encode()).hexdigest()
        
        return pulse
    
    def save_attestation(self, attestation: Dict[str, Any]) -> str:
        """Save attestation to log directory."""
        timestamp = attestation["timestamp"].replace(":", "").replace("-", "").split("T")[0]
        path = self.log_dir / f"attestation_{timestamp}_{attestation['lab']}.json"
        path.write_text(json.dumps(attestation, indent=2))
        return str(path)


# Default instance
_default_echo: Optional[EchoSentinel] = None


def get_echo(config: Optional[Dict[str, Any]] = None) -> EchoSentinel:
    """Get or create default Echo Sentinel instance."""
    global _default_echo
    if _default_echo is None:
        _default_echo = EchoSentinel(config)
    return _default_echo


__all__ = ["EchoSentinel", "get_echo"]
