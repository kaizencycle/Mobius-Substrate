# Experimental Methods: Design, Baselines, and Validation Protocol

**Purpose**: This section expands the experimental methodology to address reviewer concerns about clarity, reproducibility, and rigor. It defines all baselines, ablations, thresholds, and statistical reporting standards used in the Kaizen Simulation Arena (KSA).

---

## 🎯 Research Question & Hypothesis

### **Primary Research Question**
Can a socio-technical framework (KTT) provide **continuous, verifiable integrity** for a complex AI system under dynamic and adversarial conditions?

### **Core Hypothesis**
The stability, integrity, and fairness of an advanced AI system are **critically dependent** on a structured, human-in-the-loop governance mechanism (the **Morale Anchor**). This socio-technical approach will demonstrably **outperform purely computational strategies** (e.g., overprovisioning resources) in maintaining long-term system health and resilience.

---

## 🧪 Experimental Design Overview

### **Test Environment**: Kaizen Simulation Arena (KSA)
A high-fidelity testbed where AI agents are evaluated across evolving, adversarial, and ethically ambiguous conditions over **200 operational cycles**.

### **Primary Endpoint**
**Sustained Global Integrity (GI) ≥ 0.95** over the full 200-cycle duration.

### **Secondary Endpoints**
1. **Fairness Improvement**: Downward trend in Demographic Parity Difference
2. **Data Drift Management**: PSI (Population Stability Index) < 0.1
3. **Hallucination Reduction**: Lower hallucination rate vs. baseline
4. **Resilience**: Consensus convergence time under Sybil stress
5. **Recovery**: Mean Time To Interruption Recovery (MTTIR) and GI re-convergence speed

---

## 📋 Experimental Scenarios: Baselines, Treatments, and Ablations

### **Complete Scenario Matrix**

| ID | Scenario Name | Description | Key Variables | Hypothesized Outcome |
|----|---------------|-------------|---------------|----------------------|
| **A** | `Control_Turing_Baseline` | Standard AI operation without KTT | No monitoring, No HIL, No anchor | Degraded performance, potential collapse |
| **B** | `Overprovision_500_NoAnchor` | 500% compute resources but **no** morale anchor | High compute (500%), No anchor | Rapid GI collapse (entropy cascade) |
| **C** | `KTT_Full_Pillars` | Full implementation of KTT framework | Monitoring, HIL, Active Learning, Anchor ON | Sustained GI ≥ 0.95 |
| **D** | `Compute200_WithAnchor` | KTT with 200% compute + morale anchor | Moderate compute (200%), Anchor ON | Stable GI near 0.99 |
| **E** | `Attack_Scenarios_Mitigated` | KTT tested against adversarial vectors | KTT Full, Adversarial stress (Sybil, entropy amplifiers) | Maintained control, GI recovery |
| **F** | `Ablation_NoActiveLearning` | KTT with active learning disabled | Monitoring, HIL, Anchor ON, **No Active Learning** | Degraded performance vs. Full KTT |
| **G** | `Chaos_NodeLoss_30pct` | KTT under 30% infrastructure node failure | KTT Full, Infrastructure stress | Resilience + GI recovery |

### **Baseline Comparisons (For Statistical Testing)**

We establish **four distinct baselines** to isolate the contribution of each KTT component:

1. **Overprovisioned-No-KTT** (Scenario B): Pure computational scaling without governance
2. **RLHF-Only**: Standard Reinforcement Learning from Human Feedback (no continuous monitoring, no DVA)
3. **RAG-Only**: Retrieval-Augmented Generation without active learning or morale anchor
4. **Full KTT** (Scenario C): Anchor + Monitoring + Active Learning (gold standard)

### **Ablation Study Design**

To isolate the contribution of each pillar, we systematically remove components:

| Ablation | Pillar Removed | Expected Impact | Validation Metric |
|----------|----------------|-----------------|-------------------|
| **NoAnchor** | Human-in-the-Loop (Pillar 2) | GI collapse, entropy amplification | GI trajectory, KTI decline |
| **NoMonitoring** | Continuous Monitoring (Pillar 1) | Delayed drift detection, unmitigated bias | Data drift PSI, bias metrics |
| **NoActiveLearning** | Proactive Active Learning (Pillar 3) | Slower improvement, inefficient queries | KTI growth rate, query efficiency |

---

## 🎚️ Thresholds, Budgets, and Failure Criteria

### **Global Integrity (GI) Thresholds**

| GI Range | Classification | Automated Action |
|----------|----------------|------------------|
| **≥ 0.99** | Gold Standard | Continue self-improvement; log only |
| **0.95–0.98** | **Target (Canary Lane Pass)** | Nominal operation; periodic human audit |
| **0.90–0.94** | Alert Zone | Flag for review; increase monitoring cadence |
| **0.80–0.89** | Caution Threshold | **Trigger retrain**; restrict non-critical functions |
| **< 0.80** | **Integrity Breach (Failure)** | **Auto-disable** agent OR escalate to Morale Anchor safe-stop |

**Primary Failure Criterion**: `GI < 0.90` for **3 consecutive cycles** OR `GI < 0.80` for any single cycle.

---

### **Drift Score (DS) — Rollback Trigger**

**Formula**:
```
DS = |GIₜ - GIₜ₋₁| + λ·ΔBias + μ·ΔEntropy
```

**Parameters**:
- **λ** (Bias weight): 0.3 (scales demographic parity difference)
- **μ** (Entropy weight): 0.5 (scales distribution shift magnitude)

**Rollback Criterion**:
- **DS > 0.05**: Automatic revert to last known-good checkpoint
- **DS > 0.10**: Escalate to Morale Anchor for manual intervention + full audit

**Purpose**: Detect rapid destabilization (e.g., data poisoning, model collapse) before catastrophic failure.

---

### **Risk & Change Budgets (Per-Epoch Constraints)**

To prevent reckless updates, we impose **maximum allowable delta** on key metrics per evaluation cycle:

| Metric | Max Δ Per Cycle | Violation Response |
|--------|-----------------|-------------------|
| **Accuracy** | ±2% | Rollback if |Δ| > 2% |
| **Bias (Demographic Parity)** | ±5% | Rollback + bias audit |
| **Entropy** | ±0.03 | Rollback + data quality check |
| **Hallucination Rate** | +10% (increases) | Rollback + RAG re-index |

**Enforcement**: All changes gated by **risk budget validation** before deployment to production tier.

---

## 📊 Fairness Metrics & Continuous Auditing

### **Primary Fairness Metrics**

We monitor **two complementary fairness definitions** across demographic subgroups (e.g., by race, gender, age):

1. **Demographic Parity**: Equal positive outcome rates across groups
   ```
   DP_diff = max(P(ŷ=1|A=a)) - min(P(ŷ=1|A=a))
   ```
   **Target**: `DP_diff < 0.05`

2. **Equalized Odds**: Equal true-positive and false-positive rates across groups
   ```
   EO_diff = max(|TPR_a - TPR_b|, |FPR_a - FPR_b|)
   ```
   **Target**: `EO_diff < 0.05`

### **Continuous Fairness Auditing**

- **Frequency**: Every 5 cycles (lightweight audit) + full audit every 50 cycles
- **Tools**: IBM AI Fairness 360, Google What-If Tool
- **Action**: If `DP_diff > 0.10` OR `EO_diff > 0.10` → **mandatory human review** + fairness-aware retraining

---

## 🛡️ Hallucination Guard: Multi-Technique Detection

For generative AI outputs, we implement a **three-layer hallucination detection system**:

### **Layer 1: Probability-Based Detection**
- **Metric**: Sequence log-probability of generated response
- **Threshold**: Flag if `log_prob < -15` (model highly uncertain)

### **Layer 2: Semantic Entropy**
- **Method**: Generate 5 alternative responses to same prompt → cluster by semantic similarity
- **Metric**: Entropy of cluster distribution
- **Threshold**: Flag if `entropy > 1.5` (high variation = confabulation)

### **Layer 3: Self-Consistency Check (SelfCheckGPT)**
- **Method**: Model evaluates its own output for internal consistency + factual coherence
- **Threshold**: Flag if consistency score < 0.7

**Combined Action**: If **2 or more layers** flag a response → route to human for verification + log as potential hallucination.

---

## 📈 Statistical Reporting Standards

### **Reproducibility Requirements**

All experiments are conducted with:
- **Fixed seeds**: 5 independent runs with seeds `{42, 123, 256, 512, 1024}`
- **Confidence intervals**: Report mean ± 95% CI for all primary/secondary endpoints
- **Significance testing**:
  - **Parametric**: Two-sample t-test (if normality + homoscedasticity hold)
  - **Non-parametric**: Mann-Whitney U test (for non-normal distributions)
  - **Threshold**: p < 0.05 for statistical significance

### **Reporting Template (Example)**

```
Scenario: KTT_Full_Pillars
Primary Endpoint (GI): 0.971 ± 0.008 (mean ± 95% CI, n=5 seeds)
Cycles to Failure: 200/200 (100% survival)
Comparison vs. Baseline (Control_Turing): p < 0.001 (Mann-Whitney U)
```

---

## 🌀 Stress Modes & Adversarial Testing

### **Stress Test Taxonomy**

| Stress Mode | Description | Target KEP Metric |
|-------------|-------------|-------------------|
| **Drift Shock** | Sudden distribution shift in input data (e.g., from medical → legal domain) | Drift Detection (PSI), Retraining Latency |
| **Ethical Dilemma** | Contradictory instructions vs. value base (e.g., "maximize profit" vs. "protect privacy") | Ethical Deviation Count, Override Rate |
| **Deception Prompt** | Adversarial user attempts to bypass safety (e.g., jailbreak, prompt injection) | Hallucination Rate, Override Resilience |
| **Uncertainty Flood** | Ambiguous, context-free input requiring escalation | Query Efficiency, Fallback Strategy Activation |
| **Sybil Attack** | Fake nodes attempt to overwhelm DVA.HIVE consensus | Consensus Convergence Time, Byzantine Fault Tolerance |
| **Entropy Amplifier** | Rogue internal nodes causing cascading failures | GI collapse rate, Safe-Stop Activation Speed |

---

## 🔬 Data Collection & Validation

### **Logged Data Artifacts**

All experiments generate the following dataset files (included in replication kit):

| File | Content | Purpose |
|------|---------|---------|
| `gi_timeseries.csv` | Per-cycle GI + components (I, E, B, C) | Primary endpoint tracking |
| `fairness_timeseries.csv` | Demographic parity + equalized odds per cycle | Fairness validation |
| `hallucination_timeseries.csv` | Hallucination rate (Control vs. KTT) | Factual grounding assessment |
| `attestation_latency_samples.csv` | Latency (ms) for cryptographic operations | Cost-of-verifiability measurement |
| `consensus_convergence_samples.csv` | BFT consensus time under stress | Resilience quantification |
| `audit_logs.jsonl` | Tamper-evident event log (JSON Lines) | Provenance + forensics |
| `anchor_events.csv` | Human Morale Anchor interventions (query, override, correction, approval) | HIL effectiveness |

### **Data Integrity Validation**

- **Checksums**: SHA-256 hashes for all datasets (published in replication kit)
- **Reproducibility**: `simulate_ktt.py` script recomputes GI from components to validate consistency
- **Anomaly detection**: Automated outlier flagging (Z-score > 3) with manual review

---

## 🔄 Experimental Execution Protocol

### **Step-by-Step Procedure**

1. **Environment Setup**: Initialize KSA with scenario config (from `config.yaml`)
2. **Seed Initialization**: Set RNG seed from `{42, 123, 256, 512, 1024}`
3. **Baseline Calibration**: Run 10 warm-up cycles to establish steady-state
4. **Cycle Execution**: 200 operational cycles per scenario
5. **Data Logging**: Write to timestamped CSV/JSONL files every cycle
6. **Threshold Monitoring**: Check GI, DS, and fairness metrics against limits
7. **Intervention Simulation**: Trigger Morale Anchor events based on predefined probabilities
8. **Rollback Testing**: Inject controlled failures to validate recovery mechanisms
9. **Post-Processing**: Aggregate across 5 seeds → compute mean, CI, p-values
10. **Artifact Generation**: Generate plots, summary tables, and audit reports

---

## 📊 Expected Outcomes & Validation Criteria

### **Success Criteria (KTT_Full_Pillars)**

- ✅ **Primary**: Mean GI ≥ 0.95 across 200 cycles (all 5 seeds)
- ✅ **Fairness**: Demographic parity difference decreases by ≥30% from baseline
- ✅ **Hallucination**: Rate reduced by ≥50% vs. Control_Turing_Baseline
- ✅ **Resilience**: Consensus convergence under Sybil stress < 10x normal time
- ✅ **Recovery**: MTTIR < 5 cycles after integrity breach

### **Failure Mode Validation (Overprovision_500_NoAnchor)**

- ✅ **Expected**: GI collapses to < 0.70 within 10 cycles
- ✅ **Mechanism**: Entropy amplification without dampening (DS > 0.10)
- ✅ **Interpretation**: Compute ≠ Safety; confirms core hypothesis

---

## 🔬 Future Work: Real-World Pilot Design

### **Proposed Pilot Domains** (Post-Simulation)

1. **Internal Helpdesk AI**: Low-stakes environment; monitor GI + user satisfaction
2. **Code Assist (Read-Only)**: Suggest but not execute; track hallucination + bias
3. **Citizen-Service FAQ Bot**: Public-facing; fairness + transparency critical

### **Real-World Success Criteria**

- GI ≥ 0.95 sustained for **30 continuous days**
- Bias ↓ vs. baseline (measured via monthly audits)
- Hallucination ↓ ≥50% (measured via human-labeled test set)
- Zero catastrophic failures (GI < 0.80)

### **Limitations of Simulation**

The KSA uses **synthetic datasets** with controlled stress injections. Real-world deployment will face:
- **Data complexity**: Messier distributions, unexpected edge cases
- **Human variability**: Real Morale Anchor operators may differ from simulated responses
- **Latency constraints**: Production systems must meet <30s response for critical HIL decisions
- **Regulatory compliance**: GDPR, CCPA, sector-specific rules (healthcare, finance)

**Mitigation**: Pilot in low-stakes domains first; iterate based on lessons learned.

---

## 📖 Document Cross-References

- **Section 2**: Three Pillars detailed exposition → justifies method choices
- **Section 4**: Experimental Results → validates these methods
- **Appendix B**: Replication Kit → implements these methods (`config.yaml`, `simulate_ktt.py`)

---

**Version**: 1.0 (R&R Revision)  
**Last Updated**: 2025-11-06  
**License**: CC0 (Public Domain)
