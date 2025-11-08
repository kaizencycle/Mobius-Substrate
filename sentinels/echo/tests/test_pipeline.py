import base64

from echo_scout.ledger_client import LedgerClient
from echo_scout.oaa_client import OAAClient
from echo_scout.pipeline import EchoPipeline
from echo_scout.schemas import Finding


class DummyLedger(LedgerClient):
    def __init__(self):
        pass  # type: ignore[call-arg]

    def anchor(self, envelope):
        return {"ok": True, "hash": "TEST_HASH"}


def test_happy_path():
    dummy_key = base64.b64encode(b"\x01" * 32).decode()
    oaa = OAAClient("issuer", dummy_key, "oaa.ed25519.v1")
    pipe = EchoPipeline(oaa, DummyLedger())
    finding = Finding(
        domain="technology",
        headline="Data center capex surge",
        summary="x",
        impact="medium",
        sources=[],
    )
    out = pipe.process(finding)
    assert out is not None
    assert out["ledger_receipt"]["ok"]
