#!/usr/bin/env python3
"""
Fix incorrect endpoint changes made by the endpoint fixer.
This fixes patterns like //api/ back to /api/ and broker-/api back to broker-api
"""

import re
from pathlib import Path

# Fixes for incorrect patterns
FIXES = [
    # Fix double slashes in API paths
    (r'//api/', '/api/'),
    # Fix directory names with -/api
    (r'broker-/api', 'broker-api'),
    (r'ledger-/api', 'ledger-api'),
    (r'indexer-/api', 'indexer-api'),
    (r'eomm-/api', 'eomm-api'),
    (r'shield-/api', 'shield-api'),
    # Fix paths like pages//api/ back to pages/api/
    (r'pages//api/', 'pages/api/'),
    (r'app//api/', 'app/api/'),
    # Fix URLs with //api
    (r'https://[^/]+//api/', lambda m: m.group(0).replace('//api/', '/api/')),
]

def fix_file(file_path: Path):
    """Fix incorrect endpoint patterns in a file."""
    try:
        content = file_path.read_text(encoding='utf-8', errors='ignore')
        original = content
        
        for pattern, replacement in FIXES:
            if callable(replacement):
                content = re.sub(pattern, replacement, content)
            else:
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
