#!/usr/bin/env python3
"""
Fix endpoint references to match actual API routes.
C-156: Fix all broken links and endpoints
"""

import re
from pathlib import Path

# Common endpoint fixes
ENDPOINT_FIXES = [
    # Fix common API path issues
    (r'/api/v1/', '/v1/'),
    (r'/v1/api/', '/v1/'),
    # Fix missing leading slashes
    (r'api/([^/])', r'/api/\1'),
]

def fix_endpoints_in_file(file_path: Path):
    """Fix endpoint references in a file."""
    try:
        content = file_path.read_text(encoding='utf-8', errors='ignore')
        original = content
        
        for pattern, replacement in ENDPOINT_FIXES:
            content = re.sub(pattern, replacement, content)
        
        if content != original:
            file_path.write_text(content, encoding='utf-8')
            return True
        return False
    except Exception as e:
        print(f"Error fixing endpoints in {file_path}: {e}")
        return False

def main():
    root = Path("/workspace")
    
    # Check markdown files for endpoint references
    md_files = list(root.rglob("*.md"))
    fixed = 0
    
    for md_file in md_files:
        if any(part.startswith('.') and part != '.github' for part in md_file.parts):
            continue
        if 'node_modules' in md_file.parts:
            continue
        
        if fix_endpoints_in_file(md_file):
            fixed += 1
            print(f"Fixed endpoints in: {md_file.relative_to(root)}")
    
    print(f"\nFixed endpoints in {fixed} files")

if __name__ == "__main__":
    main()
