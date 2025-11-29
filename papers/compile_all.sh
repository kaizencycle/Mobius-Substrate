#!/bin/bash
# Compilation script for all LaTeX papers
# Usage: ./compile_all.sh

set -e  # Exit on error

PAPERS=("sml-paper" "negentropic-economics-paper" "mcp-paper")

for paper in "${PAPERS[@]}"; do
    echo "=========================================="
    echo "Compiling $paper..."
    echo "=========================================="
    
    # First pass
    pdflatex -interaction=nonstopmode "$paper.tex" || true
    
    # Bibliography
    bibtex "$paper" || true
    
    # Second pass (for references)
    pdflatex -interaction=nonstopmode "$paper.tex" || true
    
    # Third pass (for final references)
    pdflatex -interaction=nonstopmode "$paper.tex" || true
    
    if [ -f "$paper.pdf" ]; then
        echo "✓ $paper.pdf created successfully"
    else
        echo "✗ Failed to create $paper.pdf"
        exit 1
    fi
    
    echo ""
done

echo "=========================================="
echo "All papers compiled successfully!"
echo "=========================================="

# Clean up auxiliary files (optional)
# Uncomment to remove .aux, .log, .out files
# rm -f *.aux *.log *.out *.bbl *.blg
