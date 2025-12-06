#!/usr/bin/env python3
"""
Bulk fix common broken link patterns.
C-156: Fix all broken links and endpoints
"""

import os
import re
from pathlib import Path

# Common fixes mapping: (pattern, replacement)
FIXES = [
    # MIC Whitepaper v2.0 -> v2.1
    (r'MIC_Whitepaper_v2\.0\.md', 'MIC_Whitepaper_v2.1.md'),
    (r'MIC_Whitepaper v2\.0', 'MIC Whitepaper v2.1'),
    
    # Fix relative path issues
    (r'\.\./docs/02-architecture/', '../docs/04-TECHNICAL-ARCHITECTURE/'),
    (r'\.\./docs/06-operations/', '../docs/06-OPERATIONS/'),
    (r'docs/02-architecture/', 'docs/04-TECHNICAL-ARCHITECTURE/'),
    (r'docs/06-operations/', 'docs/06-OPERATIONS/'),
    
    # Fix double docs/ path
    (r'docs/docs/', 'docs/'),
]

def fix_file(file_path: Path):
    """Fix broken links in a single file."""
    try:
        content = file_path.read_text(encoding='utf-8', errors='ignore')
        original = content
        
        for pattern, replacement in FIXES:
            content = re.sub(pattern, replacement, content)
        
        if content != original:
            file_path.write_text(content, encoding='utf-8')
            return True
        return False
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

def main():
    root = Path("/workspace")
    md_files = list(root.rglob("*.md"))
    
    fixed_count = 0
    for md_file in md_files:
        if any(part.startswith('.') and part != '.github' for part in md_file.parts):
            continue
        if 'node_modules' in md_file.parts:
            continue
        
        if fix_file(md_file):
            fixed_count += 1
            print(f"Fixed: {md_file.relative_to(root)}")
    
    print(f"\nFixed {fixed_count} files")

if __name__ == "__main__":
    main()
