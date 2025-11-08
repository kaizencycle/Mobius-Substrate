"""Minimal OAA client wrapper for Ed25519 signing."""

from __future__ import annotations

import base64
import json
import time
from typing import Dict

import nacl.signing


class OAAClient:
    def __init__(self, issuer: str, private_b64: str, version: str):
        self.issuer = issuer
        self.version = version
        try:
            raw_key = base64.b64decode(private_b64)
        except Exception as exc:  # pragma: no cover - defensive logging
            raise ValueError("Invalid base64 private key") from exc
        if len(raw_key) not in (32, 64):
            raise ValueError("OAA private key must decode to 32 or 64 bytes.")
        self._sk = nacl.signing.SigningKey(raw_key[:32])

    def sign_attestation(self, payload: Dict) -> Dict:
        envelope = {
            "issuer": self.issuer,
            "version": self.version,
            "ts": int(time.time()),
            "payload": payload,
        }
        message = json.dumps(envelope, sort_keys=True).encode()
        signature = self._sk.sign(message).signature
        envelope["sig_ed25519_b64"] = base64.b64encode(signature).decode()
        return envelope

