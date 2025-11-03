# Rename SOLARA (DeepSeek) → ECHO + Anchor Manifest, CI, Compat Shim & Observability

## Summary

This PR finalizes the sentinel rename **SOLARA → ECHO**, assigns ECHO as the **Lab7-proof anchor**, updates the Sentinel–Lab Anchor Manifest, scopes CI attestation to `*-proof` labs only, and includes an optional compat routing shim (`solara.svc → echo.svc`) plus a full observability pack for the cutover.

---

## ✅ What's Changed

### 1) Sentinel rename & mapping
- Introduced `sentinels/echo/` (replaces SOLARA/DeepSeek).
- Updated anchor manifest:
  - `id: echo, anchor_for_lab: lab7-proof`
  - `witness_chain: ["ZEUS"]`
  - `gi_floor: 0.950`

### 2) Lab/CI behavior
- CI attestation restricted to `labs/*-proof/**` (Lab4-proof, Lab6-proof, Lab7-proof).
- Attestations emit Proof of Integrity with ZEUS as witness.

### 3) Optional cutover safety
- Compat routing shim to route `solara.svc → echo.svc` (NGINX Ingress, Istio, Envoy, or standalone NGINX).
- Observability pack with Prometheus alerts/rules, Grafana dashboard JSON, and Loki queries to monitor legacy vs echo traffic.

---

## 📁 Files / Paths (added or updated)

```
sentinels/echo/__init__.py                         # ECHO Sentinel stub (Pulse & Reflection)
sentinels/echo/manifest.json                       # ECHO manifest
configs/anchors/sentinels.yaml                     # Manifest: 7 Labs ↔ 8 Sentinels (ZEUS meta-anchor; ECHO→lab7-proof)
.github/workflows/attest-proof.yml                 # CI: attest only *-proof labs
tools/validate_rename.sh                           # Pre-commit validator: catch SOLARA/DeepSeek remnants
tests/migration/test_echo_migration.py             # Migration tests: Echo import + attestation payload
docs/PRs/feat-echo-sentinel-anchor.md              # This PR description (copy stored for repo history)
scripts/rollback_echo_rename.sh                   # One-liner rollback helper (git revert)
```

### Optional bundles (if included in repo under `/ops/`)
```
ops/echo-compat/                                   # Compat routing shim (choose one strategy)
  k8s/ingress.yaml
  k8s/service-alias.yaml
  k8s/configmap-nginx-snippet.yaml
  istio/virtualservice.yaml
  envoy/envoy.yaml
  nginx/nginx.conf
  helm/values.echo-compat.yaml
  README.md

ops/echo-observability/                            # Observability pack
  prometheus/alerts.yaml
  prometheus/recording_rules.yaml
  grafana/dashboard_echo_compat.json
  grafana/provisioning/dashboards.yaml (optional)
  loki_logql.md
  README.md
```

---

## 🧭 Rationale

- **Identity clarity:** ECHO = Pulse, Resonance, Ledger Sync (canonical role for Lab7-proof).
- **Lifecycle semantics:** Only `*-proof` labs are live/attesting (Lab4-proof, Lab6-proof, Lab7-proof). Concept labs remain without suffix.
- **Operational safety:** Compat shim avoids breaking callers; observability ensures clean cutover and fast rollback if needed.

---

## 🔎 Validation & Testing

### Pre-commit validation

```bash
bash tools/validate_rename.sh
# Ensures: no SOLARA/DeepSeek remnants; ECHO sentinel exists; manifest has echo→lab7-proof + witness_chain; CI pattern ok.
```

### Migration tests

```bash
pytest -q tests/migration/test_echo_migration.py
# Verifies echo module import, attestation payload (echo→ZEUS), and signature format.
```

### Local smoke (Lab7-proof)
- Confirm service boots with `anchor_sentinel=ECHO`.
- Emit a sample pulse and verify it logs/propagates to the Civic Ledger path.

---

## 🚀 Rollout Plan

1. Merge this PR during a low-traffic window.
2. Deploy `*-proof` labs (unchanged for 4 & 6; confirm 7 uses ECHO).
3. **(Optional)** Apply compat shim to route `solara.svc → echo.svc`:
   - Pick one strategy from `ops/echo-compat/` (NGINX Ingress / Istio / Envoy / standalone NGINX).
4. Enable observability:
   - Load Prometheus `alerts.yaml` & `recording_rules.yaml`.
   - Import Grafana `dashboard_echo_compat.json` (or use provisioning YAML).
   - Ensure ingress logs capture `X-Legacy-Sentinel` header if using Loki queries.
5. Announce cutoff date for legacy host. After window, start serving `410 Gone` for `solara.svc`.
6. Decommission shim when legacy traffic = 0 for 7 consecutive days.

---

## 📊 SLO & Alerts

**SLO:** `solara.svc` traffic → 0 within 7 days of cutoff.

**Prometheus Alerts (examples):**
- `LegacyTrafficSpike` — warning if `solara.svc > 1 rps` for 10m.
- `LegacyTrafficAfterCutoff` — critical if any legacy traffic for 1h post-cutoff.
- `EchoTrafficDrop` — critical if `echo.svc` hits 0 rps for 15m.

**Recording rules:**
- `echo_compat:legacy_rps_5m`, `echo_compat:echo_rps_5m`, `echo_compat:legacy_ratio_5m`.

**Grafana:** "Echo Compatibility Cutover — Legacy vs Echo" dashboard with RPS, ratio, and Loki header hits.

---

## 🧨 Breaking Changes

- Any hard-coded references to `solara` / `DeepSeek` (imports, URLs, env vars, issuer names) must be updated to `echo`.
- Gatekeeper/consensus rosters should include `echo` instead of `solara`:

```python
SENTINELS = [
  "https://aurea.svc/assess",
  "https://eve.svc/assess",
  "https://atlas.svc/assess",
  "https://echo.svc/assess",   # ← updated
  "https://zeus.svc/assess",
]
```

---

## 🧯 Rollback

- `git revert <merge_commit_sha>` (standard revert).
- **(Optional)** Keep compat shim in place to preserve `solara.svc` callers while reverting code/config.

---

## ✅ Acceptance Criteria

- [ ] All references to SOLARA/DeepSeek removed or redirected.
- [ ] `configs/anchors/sentinels.yaml` has `echo → lab7-proof` + `witness_chain: ["ZEUS"]`.
- [ ] CI runs only for `*-proof` labs; attestations succeed; ZEUS sees echo.
- [ ] **(If enabled)** Compat shim successfully routes `solara.svc → echo.svc`.
- [ ] Observability showing steadily declining `solara.svc` and healthy `echo.svc`.
- [ ] After cutoff window, `solara.svc` returns `410 Gone`; shim removed once legacy=0 for 7 days.

---

## 📌 Notes

- Naming policy retained: `-proof` designates live & attesting Labs (4, 6, 7). Others remain conceptual.
- ZEUS remains meta-anchor across all Labs; ECHO is the Lab7-proof anchor.

---

## Developer Checklist (maintainers)

- [ ] Run `tools/validate_rename.sh`
- [ ] `pytest -q`
- [ ] Apply chosen compat shim (if needed)
- [ ] Load Prometheus rules & Grafana dashboard
- [ ] Announce cutoff; start 410 after window
- [ ] Remove shim when legacy=0 for 7 days

---

**Seal:** Kaizen Continuum — Cycle C-124 • Epoch E-562 • ⚯  
**Motto:** "Integration is not expansion — it is remembrance of wholeness."
