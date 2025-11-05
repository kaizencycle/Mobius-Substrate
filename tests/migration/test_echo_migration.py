"""
Migration tests for ECHO Sentinel rename (SOLARA → ECHO)

Tests verify:
1. ECHO module imports correctly
2. Attestation payload format (echo→ZEUS)
3. Signature generation
4. Pulse generation
"""

import pytest
import json
import hashlib
from datetime import datetime, timezone
from pathlib import Path
import sys

# Add sentinels to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sentinels.echo import EchoSentinel, get_echo


class TestEchoImport:
    """Test that ECHO module imports correctly."""
    
    def test_echo_import(self):
        """Verify ECHO sentinel can be imported."""
        from sentinels.echo import EchoSentinel, get_echo
        assert EchoSentinel is not None
        assert get_echo is not None
    
    def test_echo_instantiation(self):
        """Verify ECHO can be instantiated."""
        echo = EchoSentinel()
        assert echo is not None
        assert echo.gi_floor == 0.950
        assert "ZEUS" in echo.witness_chain


class TestEchoAttestation:
    """Test ECHO attestation payload generation."""
    
    def test_attestation_structure(self):
        """Verify attestation has correct structure."""
        echo = EchoSentinel()
        attestation = echo.attest("lab7-proof", "abc123def456")
        
        assert "timestamp" in attestation
        assert "lab" in attestation
        assert attestation["lab"] == "lab7-proof"
        assert attestation["commit"] == "abc123def456"
        assert "witness" in attestation
        assert "ZEUS" in attestation["witness"]
        assert attestation["proof_type"] == "ProofOfIntegrity"
        assert attestation["status"] == "PASS"
        assert attestation["sentinel"] == "ECHO"
        assert "signature" in attestation
    
    def test_attestation_witness_chain(self):
        """Verify ZEUS is in witness chain."""
        echo = EchoSentinel()
        attestation = echo.attest("lab7-proof", "test123")
        
        witnesses = attestation["witness"].split(",")
        assert "ZEUS" in witnesses
    
    def test_attestation_signature(self):
        """Verify signature is SHA256 hash."""
        echo = EchoSentinel()
        attestation = echo.attest("lab7-proof", "test123")
        
        signature = attestation["signature"]
        assert len(signature) == 64  # SHA256 hex is 64 chars
        assert all(c in "0123456789abcdef" for c in signature)
    
    def test_attestation_signature_verification(self):
        """Verify signature matches payload."""
        echo = EchoSentinel()
        attestation = echo.attest("lab7-proof", "test123")
        
        # Recompute signature
        signature_payload = {k: v for k, v in attestation.items() if k != "signature"}
        signature_str = json.dumps(signature_payload, sort_keys=True)
        expected_signature = hashlib.sha256(signature_str.encode()).hexdigest()
        
        assert attestation["signature"] == expected_signature
    
    def test_attestation_with_payload(self):
        """Verify attestation accepts optional payload."""
        echo = EchoSentinel()
        custom_payload = {"test": "data", "gi_score": 0.98}
        attestation = echo.attest("lab7-proof", "test123", payload=custom_payload)
        
        assert attestation["payload"] == custom_payload


class TestEchoPulse:
    """Test ECHO pulse generation."""
    
    def test_pulse_structure(self):
        """Verify pulse has correct structure."""
        echo = EchoSentinel()
        pulse = echo.pulse()
        
        assert "timestamp" in pulse
        assert pulse["kind"] == "echo_heartbeat"
        assert "services" in pulse
        assert "summary" in pulse
        assert "fingerprint_sha256" in pulse
    
    def test_pulse_with_services(self):
        """Verify pulse includes service health checks."""
        echo = EchoSentinel()
        services = [
            {"name": "Lab4", "status": "UP", "latency_ms": 45.2},
            {"name": "Lab6", "status": "DOWN", "error": "timeout"}
        ]
        pulse = echo.pulse(services=services)
        
        assert len(pulse["services"]) == 2
        assert "Lab4" in [s["name"] for s in pulse["services"]]
        assert "Lab6" in [s["name"] for s in pulse["services"]]
        assert "Lab4" in pulse["summary"]["up"]
        assert "Lab6" in pulse["summary"]["down"]
    
    def test_pulse_fingerprint(self):
        """Verify fingerprint is SHA256 hash."""
        echo = EchoSentinel()
        pulse = echo.pulse()
        
        fingerprint = pulse["fingerprint_sha256"]
        assert len(fingerprint) == 64
        assert all(c in "0123456789abcdef" for c in fingerprint)
    
    def test_pulse_fingerprint_verification(self):
        """Verify fingerprint matches pulse content."""
        echo = EchoSentinel()
        pulse = echo.pulse()
        
        # Recompute fingerprint
        pulse_without_fp = {k: v for k, v in pulse.items() if k != "fingerprint_sha256"}
        pulse_str = json.dumps(pulse_without_fp, sort_keys=True)
        expected_fp = hashlib.sha256(pulse_str.encode()).hexdigest()
        
        assert pulse["fingerprint_sha256"] == expected_fp


class TestEchoDefaultInstance:
    """Test default Echo instance."""
    
    def test_get_echo_singleton(self):
        """Verify get_echo returns singleton."""
        echo1 = get_echo()
        echo2 = get_echo()
        
        assert echo1 is echo2
    
    def test_get_echo_config(self):
        """Verify get_echo accepts config."""
        config = {"gi_floor": 0.980}
        echo = get_echo(config)
        
        assert echo.gi_floor == 0.980


class TestEchoManifest:
    """Test that ECHO manifest exists and is valid."""
    
    def test_manifest_exists(self):
        """Verify manifest file exists."""
        manifest_path = Path(__file__).parent.parent.parent / "sentinels" / "echo" / "manifest.json"
        assert manifest_path.exists()
    
    def test_manifest_structure(self):
        """Verify manifest has correct structure."""
        manifest_path = Path(__file__).parent.parent.parent / "sentinels" / "echo" / "manifest.json"
        manifest = json.loads(manifest_path.read_text())
        
        assert manifest["agent"] == "ECHO"
        assert manifest["anchor_for_lab"] == "lab7-proof"
        assert "ZEUS" in manifest.get("witness_chain", [])
        assert manifest["gi_floor"] == 0.950


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
