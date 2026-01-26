# What Mobius Is Not

This document prevents category errors when evaluating Mobius.

---

## 1. Not an Alignment Technique

**Alignment research** modifies how models learn and behave: RLHF, Constitutional AI, mechanistic interpretability, scalable oversight.

**Mobius** does not touch model training. It records **decisions and provenance**, not model weights. If a model is misaligned, Mobius will faithfully record the misaligned decision.

**Use Mobius with aligned models. It does not replace alignment.**

---

## 2. Not an AGI/ASI Containment System

**AGI safety** addresses catastrophic risks from superintelligent systems: specification gaming, deceptive alignment, capability overhang.

**Mobius** constrains **humans and institutions using AI**, not hypothetical superintelligence. A superintelligence that values its own goals over legitimacy would ignore or game the Substrate.

**Use Mobius to govern the humans using AI, not to contain ASI.**

---

## 3. Not a Performance Optimizer

**Optimizers** improve speed, cost, or capability: quantization, speculative decoding, MoE routing, scaling laws.

**Mobius** adds overhead for auditability. Use it at **decision checkpoints** where legitimacy > latency.

---

## 4. Not a Substitute for Interpretability

**Interpretability** explains *why* a model produced an output: activation patching, logit lens, attention visualization.

**Mobius** records *what* humans and agents *claim* as their reasoning. EPICON logs **intent**, not mechanistic explanation.

**Use Mobius alongside interpretability tools.**

---

## 5. Not a Currency

**Money** has external market value, price discovery, and liquidity.

**MIC** is reputation capital: it gates permissions, weights governance votes, and signals trustworthiness *within the Mobius ecosystem*. It cannot be traded for dollars or compute.

**Treat MIC like academic citations, not Bitcoin.**

---

## 6. Not a Finished Protocol

This is **v0 infrastructure**. EPICON is markdown today. MIC has no external market. MII is a hypothesis. Sentinels are LLM-based auditors.

**Proof comes from pilots + evaluations, not documentation.**

---

## If You Expected Any of the Above

You may be evaluating the wrong tool. Review **AI alignment research** (Anthropic, OpenAI, Redwood Research) for AGI safety. Review **MLOps tools** (Weights & Biases, MLflow) for performance optimization.

**Mobius is governance infrastructure for legitimacy-preservation.** Nothing more, nothing less.

---

## Related Documents

- [MIC Specification](./MIC_SPEC.md) - Reputation capital mechanics
- [MII Calibration](./MII_CALIBRATION.md) - Integrity index thresholds
- [Sentinel Evaluation Protocol](./SENTINEL_EVAL_PROTOCOL.md) - How we validate sentinel value-add
