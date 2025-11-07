from fastapi.testclient import TestClient
from app.main import app

def test_healthz():
    """Test health endpoint."""
    c = TestClient(app)
    r = c.get("/healthz")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

def test_readyz():
    """Test readiness endpoint."""
    c = TestClient(app)
    r = c.get("/readyz")
    assert r.status_code == 200
    assert "status" in r.json()

