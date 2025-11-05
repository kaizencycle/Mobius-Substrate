# Kaizen Bridge — Projector

Python FastAPI microservice for projecting KV cache tensors between agent pairs.

## Quick Start

1. Create virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -e .
```

3. Run projector:
```bash
uvicorn src.app:app --host 0.0.0.0 --port 4011 --reload
```

## Configuration

See `bridge_config.yaml` for projector model definitions.

## Testing

```bash
python -m src.tests.test_roundtrip
```
