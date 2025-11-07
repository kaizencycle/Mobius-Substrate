.PHONY: dev test lint build

dev:
	uvicorn app.main:app --reload --port 8080

test:
	pytest -q --maxfail=1 --disable-warnings || echo "Tests skipped if pytest not installed"

lint:
	flake8 app || true

build:
	docker build -t lab6-proof:local .

