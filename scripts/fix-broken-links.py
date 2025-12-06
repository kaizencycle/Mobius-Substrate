#!/usr/bin/env python3
"""
Fix broken links in markdown files by finding correct file paths and updating links.
"""
import json
import os
import re
from pathlib import Path
from collections import defaultdict

def find_file_in_repo(filename, repo_root):
    """Find a file by name in the repository."""
    matches = []
    for root, dirs, files in os.walk(repo_root):
        # Skip node_modules and other ignored directories
        if 'node_modules' in root or '.git' in root:
            continue
        if filename in files:
            matches.append(os.path.join(root, filename))
    return matches

def find_directory_in_repo(dirname, repo_root):
    """Find a directory by name in the repository."""
    matches = []
    for root, dirs, files in os.walk(repo_root):
        if 'node_modules' in root or '.git' in root:
            continue
        if dirname in dirs:
            matches.append(os.path.join(root, dirname))
    return matches

def calculate_relative_path(from_file, to_file):
    """Calculate relative path from one file to another."""
    from_dir = os.path.dirname(os.path.abspath(from_file))
    to_path = os.path.abspath(to_file)
    rel_path = os.path.relpath(to_path, from_dir)
    # Normalize path separators for markdown
    return rel_path.replace('\\', '/')

def fix_link_in_file(file_path, line_num, old_url, new_url):
    """Fix a link in a markdown file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        if line_num > len(lines):
            return False
        
        line = lines[line_num - 1]
        # Replace the URL in markdown link format [text](url)
        # Handle both [text](url) and [text](url "title") formats
        pattern = r'(\[[^\]]+\]\()' + re.escape(old_url) + r'([^\)]*\))'
        new_line = re.sub(pattern, r'\1' + new_url + r'\2', line)
        
        if new_line != line:
            lines[line_num - 1] = new_line
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            return True
    except Exception as e:
        print(f"Error fixing {file_path}:{line_num}: {e}")
    return False

def main():
    repo_root = '/workspace'
    broken_links_file = os.path.join(repo_root, 'broken-links.json')
    
    with open(broken_links_file, 'r') as f:
        broken_links = json.load(f)
    
    print(f"Processing {len(broken_links)} broken links...")
    
    # Group by resolved path to process duplicates efficiently
    by_resolved = defaultdict(list)
    for link in broken_links:
        resolved = link['resolved']
        by_resolved[resolved].append(link)
    
    fixed_count = 0
    not_found_count = 0
    
    # Common file mappings (files that exist but in different locations)
    file_mappings = {
        'Cathedral-Rulebook.md': 'docs/02-THEORETICAL-FOUNDATIONS/cathedrals/Cathedral-Rulebook.md',
        'HIVE-Operator-Handbook-v0.1.md': 'docs/05-IMPLEMENTATION/hive/HIVE-Operator-Handbook-v0.1.md',
        'FOUNDING_AGENTS_SOVEREIGN_STACK.md': 'docs/04-TECHNICAL-ARCHITECTURE/overview/technical/FOUNDING_AGENTS_SOVEREIGN_STACK.md',
        'FORMAL_VERIFICATION.md': 'docs/11-SUPPLEMENTARY/architecture-docs/FORMAL_VERIFICATION.md',
    }
    
    for resolved_path, links in by_resolved.items():
        # Remove /workspace prefix
        clean_path = resolved_path.replace('/workspace/', '')
        
        # Check if it's an absolute path starting with /docs
        if clean_path.startswith('/docs/'):
            clean_path = clean_path[1:]  # Remove leading /
        
        # Check if file exists
        full_path = os.path.join(repo_root, clean_path)
        
        # Try to find the file if it doesn't exist
        if not os.path.exists(full_path):
            # Extract filename or directory name
            if clean_path.endswith('.md'):
                filename = os.path.basename(clean_path)
                if filename in file_mappings:
                    full_path = os.path.join(repo_root, file_mappings[filename])
                else:
                    # Try to find by filename
                    matches = find_file_in_repo(filename, repo_root)
                    if matches:
                        # Use the first match (could be improved with better heuristics)
                        full_path = matches[0]
                    else:
                        not_found_count += len(links)
                        continue
            elif os.path.basename(clean_path):  # Directory
                dirname = os.path.basename(clean_path)
                matches = find_directory_in_repo(dirname, repo_root)
                if matches:
                    # Check if there's a README.md in the directory
                    for match in matches:
                        readme = os.path.join(match, 'README.md')
                        if os.path.exists(readme):
                            full_path = readme
                            break
                    else:
                        full_path = matches[0] if matches else None
                else:
                    not_found_count += len(links)
                    continue
            else:
                not_found_count += len(links)
                continue
        
        if not os.path.exists(full_path):
            not_found_count += len(links)
            continue
        
        # Fix all links pointing to this resolved path
        for link in links:
            file_path = os.path.join(repo_root, link['file'])
            old_url = link['url']
            
            # Calculate correct relative path
            new_url = calculate_relative_path(file_path, full_path)
            
            if fix_link_in_file(file_path, link['line'], old_url, new_url):
                fixed_count += 1
            else:
                # Try alternative patterns
                # Sometimes the URL might be in a different format
                pass
    
    print(f"\nFixed: {fixed_count} links")
    print(f"Not found: {not_found_count} links")
    print(f"Total processed: {len(broken_links)} links")

if __name__ == '__main__':
    main()
