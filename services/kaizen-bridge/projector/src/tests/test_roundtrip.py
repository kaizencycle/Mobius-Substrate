from .registry import get_projector
import numpy as np
import base64
import time
from .model import b64_to_tensor, tensor_to_packet_like

def test_roundtrip():
    pj = get_projector("hermes_to_aurea_v1")
    fake = np.random.randn(4096).astype(np.float32).tobytes()
    pkt = {
        "model":"HERMES-LLM","layer":[20,21],"dtype":"float32","shape":[1,4096],
        "bytes_b64": base64.b64encode(fake).decode("utf-8"),
        "nonce":"x", "ts":"2025-11-05T00:00:00Z"
    }
    y = pj(b64_to_tensor(pkt))
    out = tensor_to_packet_like(y, pkt)
    assert "bytes_b64" in out

if __name__ == "__main__":
    test_roundtrip()
    print("✓ Roundtrip test passed")
