# What Mobius Is Not

This document exists to prevent category errors when evaluating Mobius. If you expect it to do these things, it will disappoint.

---

## 1) Not an Alignment Technique

Alignment research changes how models learn and behave: RLHF, Constitutional AI, scalable oversight, interpretability.

Mobius does not touch model training. It sits **outside** the model, recording what humans and agents decide to do with model outputs.

If a model is misaligned, Mobius can still provide value — by recording the decision chain — but it does not *correct* the model.

**Use Mobius with aligned models. It does not replace alignment.**

---

## 2) Not an AGI Safety System

AGI safety addresses catastrophic risks from superintelligent systems: specification gaming, deceptive alignment, capability overhang.

Mobius assumes AI systems are tools used by humans and institutions. It constrains **human misuse** and **institutional amnesia**, not ASI optimization.

**Use Mobius to govern the humans using AI — not to contain ASI.**

---

## 3) Not a Performance Optimizer

Optimizers improve speed, cost, or capability: quantization, speculative decoding, MoE routing.

Mobius adds overhead: consequential actions require attestation and review. The bet is that legitimacy is worth more than marginal latency.

**Use Mobius when auditability > speed. Use it at decision checkpoints, not on every token.**

---

## 4) Not a Substitute for Interpretability

Interpretability explains why a model produced an output: activation patching, logit lens, attention visualization.

Mobius records what humans and agents **claim** as their reasoning. It does not prove that reasoning matches model internals.

**EPICON is a statement of intent, not mechanistic explanation.**

---

## 5) Not a Currency

Money has external market value, liquidity, and price discovery.

MIC is reputation capital: it gates permissions, weights governance, and signals trustworthiness within Mobius.

**Treat MIC like academic citations — not Bitcoin.**

---

## 6) Not a Finished Protocol

This is v0. EPICON may be markdown today. MIC has no external market. MII is a working hypothesis. Sentinels are LLM-based auditors.

Mobius is a bet that legitimacy-preservation infrastructure will be necessary. The bet is defensible; the proof is pending.

**Help us collect the data.**

---

## Summary Table

| What Mobius Is Not | What Mobius Is |
|--------------------|----------------|
| Model alignment technique | Decision chain auditor |
| AGI containment system | Human/institutional accountability layer |
| Performance optimizer | Legitimacy-preserving overhead |
| Interpretability tool | Intent recording system |
| Currency/token | Reputation capital |
| Finished protocol | Falsifiable v0 hypothesis |

---

## What This Means for Evaluation

When evaluating Mobius, ask:

- **Does it improve decision traceability?** (Yes, this is the goal)
- **Does it make AI models safer?** (No, that's alignment research)
- **Does it prevent AGI takeover?** (No, that's AGI safety)
- **Does it speed up inference?** (No, it adds overhead deliberately)
- **Does it explain model internals?** (No, that's interpretability)

Mobius is useful if it reduces "why did we do this?" incidents and makes rollback faster and less political. Mobius fails if it becomes performative compliance or is ignored during real pressure.

---

*"We heal as we walk." — Mobius Substrate*
