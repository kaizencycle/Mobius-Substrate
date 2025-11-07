# Threat Model (Lab7 - OAA Hub)

## Assets

- Attestations, model configs, API keys (if any)

## Adversaries

- External attacker, insider with repo access, data scraper

## Entry Points

- Public API, CI artifacts, model prompts

## Controls

- Pre-commit secrets scan; no keys in repo
- Signed container images (CI supply chain)
- Rate limits + loop guard
- Structured audit logs with request_id and model_version

## Gaps (to verify)

- Formal red-team prompts
- Model jailbreak hardening suite

