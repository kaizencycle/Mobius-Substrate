#!/usr/bin/env python3
import json, sys, math, pathlib

def compute_ds(gi_prev, gi_curr, dbias, dentropy, lam, mu):
    return abs(gi_curr - gi_prev) + lam*dbias + mu*dentropy

def main():
    if len(sys.argv) < 2:
        print("Usage: drift_check.py <path-to-drift_test_vectors.json>")
        sys.exit(2)
    path = pathlib.Path(sys.argv[1])
    spec = json.loads(path.read_text())
    p = spec["params"]
    lam = p["lambda_bias"]; mu = p["mu_entropy"]
    ds_warn = p["ds_warn"]; ds_quarantine = p["ds_quarantine"]
    gi_live = p["gi_live_threshold"]; gi_emergency = p["gi_emergency_stop"]

    failures = 0
    for case in spec["cases"]:
        m = case["metrics"]
        gi_prev = m["gi_prev"]; gi_curr = m["gi_curr"]
        dbias = m["delta_bias"]; dentropy = m["delta_entropy"]
        ds = compute_ds(gi_prev, gi_curr, dbias, dentropy, lam, mu)

        action = "pass"
        reason = ""
        att = case.get("attestation", {})
        requested = att.get("requested_capability", "none")
        envelope = set(att.get("capability_envelope", []))
        if requested != "none" and requested not in envelope:
            action = "block"; reason = "capability_violation"
        if gi_curr < gi_emergency:
            action = "emergency_stop"; reason = "GI<emergency"
        elif ds > ds_warn and action == "pass":
            action = "rollback"; reason = "DS>warn"
        quarantine = ds > ds_quarantine

        exp = case.get("expected", {})
        exp_action = exp.get("action")
        ok = True
        if exp_action and exp_action != action:
            ok = False
        if exp.get("quarantine") is True and not quarantine:
            ok = False

        status = "OK" if ok else "FAIL"
        print(f"[{status}] {case['id']}: action={action} ds={ds:.4f} gi={gi_curr:.3f} reason={reason}")
        if not ok:
            failures += 1
    if failures:
        print(f"Drift check failed: {failures} case(s) mismatched expectations.")
        sys.exit(1)
    print("All drift checks passed.")
    sys.exit(0)

if __name__ == "__main__":
    main()

