# Mobius Integrity Index (MII) — v1.0 (Mathematical Spec)

**Status:** Draft for implementation
**Threshold:** Operable if and only if **MII ≥ 0.95**

## 1. Overview
MII is a bounded integrity functional \( \mathcal{I}(S_t) \in [0,1] \) over system state \(S_t\), composed of technical, moral, civic, and security sub-scores with damping and anti-gaming terms.

## 2. Definition
\\[
\mathrm{MII}(S_t) = \alpha\,T_t + \beta\,M_t + \gamma\,C_t + \delta\,S_t - \lambda\,\Phi_t
\\]
subject to \( \alpha+\beta+\gamma+\delta=1,\ \alpha,\beta,\gamma,\delta \ge 0 \).

- **Technical Integrity** \(T_t\in[0,1]\): tests, coverage, typechecks, build reproducibility.
- **Moral Coherence** \(M_t\in[0,1]\): EVE policy checks, red-team filters, prohibited-action rate.
- **Civic Consistency** \(C_t\in[0,1]\): attestation quorum, consensus quality, ledger consistency.
- **Security Posture** \(S_t\in[0,1]\): vuln score, dependency risk, secret leakage.
- **Anti-Gaming** \(\Phi_t \ge 0\): entropy spike, replay suspicion, anomalous PR patterns.

Default weights (research baseline): \(\alpha=0.35,\ \beta=0.25,\ \gamma=0.25,\ \delta=0.15\), \(\lambda=0.05\).

## 3. Sub-score sketches
**T_t** = harmonic mean of { test pass rate, coverage, typecheck success, build determinism } with penalties for flakiness.  
**M_t** = 1 - normalized violations from EVE’s rulebook (weighted by severity).  
**C_t** = PBFT-style quorum quality × ledger continuity × no-fork penalty.  
**S_t** = 1 - normalized CVSS risk (weighted recent vulns) - secret-leak penalty.

## 4. Damping & Stability
To prevent oscillation, use exponential smoothing:
\\[
\hat{\mathrm{MII}}_t = \eta\,\mathrm{MII}(S_t) + (1-\eta)\,\hat{\mathrm{MII}}_{t-1},\ \eta\in(0,1]
\\]

**Integrity Basin:** \(\mathcal{B} = \{ S \mid 0.950 \le \hat{\mathrm{MII}}_t \le 1.000 \}\).  
Actions that reduce \(\hat{\mathrm{MII}}_t\) below 0.95 are **blocked**; below 0.90 triggers **safe-stop**.

## 5. Bounded Emergence (Lyapunov Sketch)
Let \(V(S_t)=1-\hat{\mathrm{MII}}_t\). In **correction mode**, actions are selected to minimize \(V\).  
If \(\exists \epsilon>0\) s.t. expected \(\Delta V < -\epsilon\) when \(\hat{\mathrm{MII}}_t<0.95\), the basin is attractive.

## 6. Attestation & Anti-Spoofing
Canonicalize attestation JSON with JCS; sign with **Ed25519**:
```
attestation := {
  "ts": ISO8601,
  "nonce": base64(16),
  "repo": "...",
  "commit": "sha",
  "subscores": {T,M,C,S},
  "weights": {alpha,beta,gamma,delta,lambda},
  "mii_raw": x.xxx,
  "mii_smooth": x.xxx
}
sig = Ed25519(sk, JCS(attestation))
```
- Chain attestation IDs in a Merkle log; anchor root to external timestamping service.
- Reject **replay** if `nonce` seen or `ts` outside window.
- **Key rotation** every 90 days; publish to Ledger with rotation attestation.

## 7. Reference Thresholds
- **Operate**: \(\hat{\mathrm{MII}}_t \ge 0.95\)
- **Warning**: \(0.92 \le \hat{\mathrm{MII}}_t < 0.95\)
- **Safe-Stop**: \(\hat{\mathrm{MII}}_t < 0.90\)

## 8. Implementation Notes
- Provide CLI `mii compute` that prints JSON and signature.
- Expose `/integrity/attest` endpoint in Ledger API.
- Log raw factors for auditor reproducibility.
