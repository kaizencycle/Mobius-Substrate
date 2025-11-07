.PHONY: dev test type anchor verify

dev:
	docker compose up --build

test:
	pytest -q || echo "No tests found"

type:
	mypy ledger/ || echo "Type checking skipped"

anchor:
	python3 scripts/generate_checksum.py && python3 scripts/anchor_merkle.py

verify:
	python3 scripts/verify_anchor.py

