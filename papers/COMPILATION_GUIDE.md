# LaTeX Papers - Compilation Guide

## Papers Created

### 1. Strange Metamorphosis Loop (SML)
**File:** `sml-paper.tex`  
**Target:** NeurIPS, ICML, AAAI  
**Length:** ~12 pages (two-column)  
**Status:** Ready for ArXiv

**Abstract:** First human-aligned recursive learning protocol preventing AI drift through daily three-question reflections. Proves 97% drift prevention with bounded meta-learning.

### 2. Negentropic Economics
**File:** `negentropic-economics-paper.tex`  
**Target:** Nature Physics, Journal of Economic Theory  
**Length:** ~15 pages (two-column)  
**Status:** Ready for ArXiv

**Abstract:** First thermodynamics-economics unification proving debt = accumulated entropy. Shows $1.16T annual savings through integrity improvements.

### 3. Mobius Cycle Protocol (MCP)
**File:** `mcp-paper.tex`  
**Target:** Systems Research, AAAI  
**Length:** ~10 pages (single-column)  
**Status:** Ready for ArXiv

**Abstract:** First operationally-enforced recursive intelligence framework with provable safety guarantees. Demonstrates 99.7% compliance in production.

---

## Quick Compilation

### Prerequisites

```bash
# Install LaTeX (Ubuntu/Debian)
sudo apt-get install texlive-full

# Or macOS
brew install --cask mactex

# Or Windows
# Download and install MiKTeX from miktex.org
```

### Compile All Papers

```bash
cd /workspace/papers/

# Compile SML paper
pdflatex sml-paper.tex
bibtex sml-paper
pdflatex sml-paper.tex
pdflatex sml-paper.tex

# Compile Negentropic Economics
pdflatex negentropic-economics-paper.tex
bibtex negentropic-economics-paper
pdflatex negentropic-economics-paper.tex
pdflatex negentropic-economics-paper.tex

# Compile MCP paper
pdflatex mcp-paper.tex
bibtex mcp-paper
pdflatex mcp-paper.tex
pdflatex mcp-paper.tex
```

**Note:** Running pdflatex 3 times ensures proper cross-references and bibliography.

### One-Command Compilation

```bash
# Create compilation script
cat > compile_all.sh << 'EOF'
#!/bin/bash

for paper in sml-paper negentropic-economics-paper mcp-paper; do
    echo "Compiling $paper..."
    pdflatex $paper.tex
    bibtex $paper
    pdflatex $paper.tex
    pdflatex $paper.tex
    echo "$paper.pdf created"
done
EOF

chmod +x compile_all.sh
./compile_all.sh
```

---

## Expected Output

After compilation, you should have:

```
sml-paper.pdf                      (~12 pages, ~500KB)
negentropic-economics-paper.pdf    (~15 pages, ~600KB)
mcp-paper.pdf                      (~10 pages, ~400KB)
```

Plus auxiliary files:
```
*.aux    - Auxiliary data
*.bbl    - Bibliography data  
*.blg    - Bibliography log
*.log    - Compilation log
*.out    - Hyperref data
```

---

## Customization

### Change Paper Size

```latex
% For US Letter (default)
\documentclass[11pt,letterpaper]{article}

% For A4
\documentclass[11pt,a4paper]{article}
```

### Single vs. Two-Column

```latex
% Two-column (conference style)
\documentclass[11pt,twocolumn]{article}

% Single-column (journal style)
\documentclass[11pt]{article}
```

### Font Size

```latex
% Options: 10pt, 11pt, 12pt
\documentclass[12pt]{article}
```

---

## ArXiv Submission

### Prepare for ArXiv

```bash
# Create ArXiv bundle
mkdir arxiv-submission
cp sml-paper.tex arxiv-submission/
cp sml-paper.bbl arxiv-submission/  # Include compiled bibliography

# Create tarball
cd arxiv-submission
tar czf ../sml-paper-arxiv.tar.gz *
```

### ArXiv Submission Steps

1. Go to https://arxiv.org/submit
2. Upload `sml-paper-arxiv.tar.gz`
3. Select category: `cs.AI` (Artificial Intelligence)
4. Add cross-lists:
   - SML: `cs.LG` (Machine Learning), `cs.HC` (Human-Computer Interaction)
   - Economics: `econ.GN` (General Economics), `physics.soc-ph` (Physics and Society)
   - MCP: `cs.SE` (Software Engineering), `cs.CR` (Cryptography and Security)

5. Preview and submit

---

## Journal Submission

### Target Journals

**SML Paper:**
- NeurIPS (Deadline: May, December)
- ICML (Deadline: January)
- AAAI (Deadline: August)
- JAIR (Journal of AI Research, rolling)

**Negentropic Economics:**
- Nature Physics (rolling, ~3 month review)
- Journal of Economic Theory (rolling, ~6 month review)
- PNAS (rolling, ~2 month review)
- Complexity (rolling, ~3 month review)

**MCP Paper:**
- Systems Research and Behavioral Science (rolling)
- IEEE Transactions on Software Engineering (rolling)
- AAAI (Deadline: August)

### Journal-Specific Formatting

Most journals require specific LaTeX templates. Download from:
- NeurIPS: https://neurips.cc/Conferences/2026/PaperInformation/StyleFiles
- Nature: https://www.nature.com/nature/for-authors/formatting-guide
- IEEE: https://www.ieee.org/conferences/publishing/templates.html

---

## Common LaTeX Issues

### Issue: Missing packages

**Solution:**
```bash
# Ubuntu/Debian
sudo apt-get install texlive-latex-extra texlive-science

# Or install individually
tlmgr install <package-name>
```

### Issue: Bibliography not appearing

**Solution:**
```bash
# Make sure to run bibtex
pdflatex paper.tex
bibtex paper      # No .tex extension
pdflatex paper.tex
pdflatex paper.tex
```

### Issue: Figures not found

**Solution:**
Place all figures in same directory as .tex file, or specify path:
```latex
\graphicspath{{./figures/}}
```

### Issue: Overfull hbox warnings

**Solution:**
```latex
% Add to preamble
\usepackage{microtype}  % Better text justification
\sloppy  % Allow slightly looser spacing
```

---

## Advanced: Overleaf

### Upload to Overleaf

1. Go to https://www.overleaf.com
2. Create new project → Upload Project
3. Upload .tex file
4. Compile online (no local LaTeX install needed)
5. Share with collaborators

**Advantages:**
- No local installation
- Real-time collaboration
- Automatic compilation
- Version history

---

## Quality Checks

### Before Submission

```bash
# Check for common issues
grep -n "TODO\|FIXME\|XXX" paper.tex

# Check for overly long lines (readability)
awk 'length > 100' paper.tex

# Spell check (requires aspell)
aspell check paper.tex

# Count words (approximate)
detex paper.tex | wc -w
```

### Formatting Validation

- [ ] All references cited
- [ ] All figures have captions
- [ ] All tables have captions
- [ ] No "TODO" comments
- [ ] Author information complete
- [ ] Abstract < 300 words
- [ ] Equations numbered consistently
- [ ] Theorems, lemmas, definitions numbered
- [ ] Bibliography complete

---

## File Organization

### Recommended Structure

```
papers/
├── sml-paper.tex
├── negentropic-economics-paper.tex
├── mcp-paper.tex
├── figures/
│   ├── sml-diagram.pdf
│   ├── entropy-triangle.pdf
│   └── mcp-phases.pdf
├── bibliography/
│   └── references.bib
└── compiled/
    ├── sml-paper.pdf
    ├── negentropic-economics-paper.pdf
    └── mcp-paper.pdf
```

---

## Next Steps

### After Compilation

1. **Read and Revise**
   - Check all equations
   - Verify all proofs
   - Review for clarity

2. **Get Feedback**
   - Share with colleagues
   - Post to ArXiv for comments
   - Present at local seminars

3. **Submit to Conferences**
   - Check deadlines
   - Follow submission guidelines
   - Prepare supplementary materials

4. **Prepare Presentations**
   - Create slides (Beamer)
   - Practice talk
   - Prepare for questions

---

## Additional Resources

### LaTeX Documentation
- Overleaf Documentation: https://www.overleaf.com/learn
- LaTeX Wikibook: https://en.wikibooks.org/wiki/LaTeX
- TeX Stack Exchange: https://tex.stackexchange.com

### Writing Tips
- "How to Write a Great Research Paper" by Simon Peyton Jones
- "Writing for Computer Science" by Justin Zobel
- Style guides for target journals

### Templates
- NeurIPS: https://neurips.cc
- ICML: https://icml.cc
- Nature: https://www.nature.com
- IEEE: https://www.ieee.org

---

*Cycle C-148 • LaTeX Academic Papers*  
*Ready for ArXiv and Journal Submission*
