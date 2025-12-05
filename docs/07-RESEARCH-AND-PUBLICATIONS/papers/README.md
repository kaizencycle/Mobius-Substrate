# Mobius Papers & Whitepapers

This directory contains all academic papers, whitepapers, and formal specifications for **Mobius Systems**.

> *Consolidated in C-155 from `/whitepaper/`, `/whitepapers/`, and `/papers/`*

---

## Contents

### Foundational Whitepapers

| Document | Description |
|----------|-------------|
| **[Mobius-Whitepaper-v1.0.md](./Mobius-Whitepaper-v1.0.md)** | Complete system whitepaper - constitutional, economic, and governance blueprint |
| **[Executive-Summary.md](./Executive-Summary.md)** | 2-page overview for quick reference |
| **[Mobius-Yellow-Paper-Math-Edition.md](./Mobius-Yellow-Paper-Math-Edition.md)** | Mathematical foundations and proofs |
| **[Chapter-07-Economics-of-Mobius.md](./Chapter-07-Economics-of-Mobius.md)** | Economic model deep-dive |

### Academic Papers (Publication Ready)

| Paper | Target Venues | Status |
|-------|---------------|--------|
| **[sml-paper.tex](./sml-paper.tex)** — Strange Metamorphosis Loop | NeurIPS, ICML, AAAI | Ready for ArXiv |
| **[negentropic-economics-paper.tex](./negentropic-economics-paper.tex)** — Negentropic Economics | Nature Physics, Journal of Economic Theory | Ready for ArXiv |
| **[mcp-paper.tex](./mcp-paper.tex)** — Mobius Cycle Protocol | Systems Research, IEEE TSE | Ready for ArXiv |

### Research Briefs

| Document | Description |
|----------|-------------|
| **[AlphaCivilization_ResearchBrief.md](./AlphaCivilization_ResearchBrief.md)** | AlphaCivilization research overview |
| **[AlphaCivilization_v0.1.tex](./AlphaCivilization_v0.1.tex)** | AlphaCivilization technical paper |
| **[AI_ANTI_EXPLOITATION_WHITEPAPER.md](./AI_ANTI_EXPLOITATION_WHITEPAPER.md)** | AI exploitation prevention framework |

### Supporting Materials

| Directory | Contents |
|-----------|----------|
| **[appendices/](./appendices/)** | RFC index, glossary, schemas, constitutional invariants |
| **[diagrams/](./diagrams/)** | Architecture maps and flow diagrams |
| **[assets/](./assets/)** | Exported images and diagrams |

### Compilation & Workflow

| File | Purpose |
|------|---------|
| **[COMPILATION_GUIDE.md](./COMPILATION_GUIDE.md)** | Instructions for compiling LaTeX papers |
| **[compile_all.sh](./compile_all.sh)** | Script to compile all papers |
| **[README-academic-papers.md](./README-academic-papers.md)** | Original academic papers readme (historical) |

---

## Directory Structure

```
docs/papers/
├── Mobius-Whitepaper-v1.0.md      # Main whitepaper
├── Executive-Summary.md            # Quick overview
├── Mobius-Yellow-Paper-Math-Edition.md
├── Chapter-07-Economics-of-Mobius.md
│
├── sml-paper.tex                   # Strange Metamorphosis Loop
├── negentropic-economics-paper.tex # Negentropic Economics
├── mcp-paper.tex                   # Mobius Cycle Protocol
│
├── AlphaCivilization_ResearchBrief.md
├── AlphaCivilization_v0.1.tex
├── AI_ANTI_EXPLOITATION_WHITEPAPER.md
│
├── appendices/
│   ├── Appendix-A-RFC-Index.md
│   ├── Appendix-B-Glossary.md
│   ├── Appendix-C-Data-Schemas.md
│   └── Appendix-D-Constitutional-Invariants.md
│
├── diagrams/
│   ├── cathedral-architecture.md
│   └── gi-sim-flow.md
│
├── assets/
│   └── (PNG exports)
│
├── COMPILATION_GUIDE.md
├── compile_all.sh
├── Version-History.md
└── README.md                       # This file
```

---

## How to Use

### For Readers

1. Start with **[Executive-Summary.md](./Executive-Summary.md)** for high-level overview
2. Read **[Mobius-Whitepaper-v1.0.md](./Mobius-Whitepaper-v1.0.md)** for complete architecture
3. Consult **[appendices/](./appendices/)** for detailed specifications
4. Review **[diagrams/](./diagrams/)** for visual understanding

### For Researchers

1. Review academic papers (`.tex` files)
2. See **[COMPILATION_GUIDE.md](./COMPILATION_GUIDE.md)** for compilation
3. Reference **[README-academic-papers.md](./README-academic-papers.md)** for submission status

### For Contributors

1. Read full whitepaper
2. Review related RFCs in `/specs/`
3. Follow RFC contribution process (see Appendix A)
4. Propose improvements via GitHub PR

---

## Compilation

### Quick Start

```bash
cd docs/papers/
./compile_all.sh
# Or manually:
pdflatex sml-paper.tex
bibtex sml-paper
pdflatex sml-paper.tex
pdflatex sml-paper.tex
```

See **[COMPILATION_GUIDE.md](./COMPILATION_GUIDE.md)** for detailed instructions.

---

## Version Information

**Current Version:** v1.0 (Genesis Edition)  
**Release Date:** 2025-12-03  
**Status:** Published  
**Consolidation:** C-155 (December 5, 2025)

---

## License

- **Whitepapers:** Creative Commons BY-NC-SA 4.0 + Mobius Ethical Addendum
- **Academic Papers:** Appropriate academic licenses (see individual paper headers)

---

## Related Documentation

- **RFC Specifications:** `/specs/`
- **Technical Docs:** `/docs/`
- **Foundation Documents:** `/FOUNDATION/`
- **For Academics:** `/FOR-ACADEMICS/`

---

**Mobius — A Civic Operating System for the AI Era**

*"We heal as we walk."*  
*"Scars remind us we also heal."*
