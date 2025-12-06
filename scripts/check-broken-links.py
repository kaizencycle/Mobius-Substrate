#!/usr/bin/env python3
"""
Check for broken links and endpoints in the Mobius Systems codebase.
C-156: Fix all broken links and endpoints
"""

import os
import re
import json
from pathlib import Path
from typing import List, Dict, Tuple, Set
from urllib.parse import urlparse, unquote

class LinkChecker:
    def __init__(self, root_dir: str = "/workspace"):
        self.root_dir = Path(root_dir)
        self.broken_links: List[Dict] = []
        self.checked_files: Set[str] = set()
        
    def find_markdown_files(self) -> List[Path]:
        """Find all markdown files in the repository."""
        md_files = []
        for path in self.root_dir.rglob("*.md"):
            # Skip node_modules, .git, and other ignored directories
            if any(part.startswith('.') and part != '.github' for part in path.parts):
                continue
            if 'node_modules' in path.parts:
                continue
            md_files.append(path)
        return md_files
    
    def extract_links(self, file_path: Path) -> List[Tuple[int, str, str]]:
        """Extract all links from a markdown file.
        Returns: List of (line_number, link_text, link_url)"""
        links = []
        content = file_path.read_text(encoding='utf-8', errors='ignore')
        
        # Markdown link pattern: [text](url)
        md_link_pattern = r'\[([^\]]+)\]\(([^\)]+)\)'
        for match in re.finditer(md_link_pattern, content):
            line_num = content[:match.start()].count('\n') + 1
            link_text = match.group(1)
            link_url = match.group(2)
            links.append((line_num, link_text, link_url))
        
        # HTML link pattern: <a href="url">text</a>
        html_link_pattern = r'<a\s+href=["\']([^"\']+)["\']>([^<]+)</a>'
        for match in re.finditer(html_link_pattern, content):
            line_num = content[:match.start()].count('\n') + 1
            link_url = match.group(1)
            link_text = match.group(2)
            links.append((line_num, link_text, link_url))
        
        return links
    
    def resolve_link(self, base_file: Path, link_url: str) -> Tuple[bool, str]:
        """Resolve a link URL to check if it exists.
        Returns: (exists, resolved_path)"""
        # Skip external URLs
        if link_url.startswith(('http://', 'https://', 'mailto:', '#')):
            return (True, link_url)  # Assume external links are valid
        
        # Remove anchor fragments
        if '#' in link_url:
            link_url = link_url.split('#')[0]
        
        # Handle relative paths
        if link_url.startswith('/'):
            # Absolute path from root
            target = self.root_dir / link_url.lstrip('/')
        else:
            # Relative path
            target = (base_file.parent / link_url).resolve()
        
        # Normalize path
        try:
            target = target.resolve()
        except (OSError, ValueError):
            return (False, str(target))
        
        # Check if file exists
        if target.exists():
            return (True, str(target))
        
        # Check if it's a directory (might be missing trailing slash or index)
        if target.is_dir():
            # Try common index files
            for index_file in ['README.md', 'index.md', 'INDEX.md']:
                index_path = target / index_file
                if index_path.exists():
                    return (True, str(index_path))
        
        # Check if it's a file without extension (try .md)
        if not target.suffix and not target.exists():
            md_target = target.with_suffix('.md')
            if md_target.exists():
                return (True, str(md_target))
        
        return (False, str(target))
    
    def check_file(self, file_path: Path):
        """Check all links in a markdown file."""
        if str(file_path) in self.checked_files:
            return
        
        self.checked_files.add(str(file_path))
        links = self.extract_links(file_path)
        
        for line_num, link_text, link_url in links:
            exists, resolved = self.resolve_link(file_path, link_url)
            if not exists:
                self.broken_links.append({
                    'file': str(file_path.relative_to(self.root_dir)),
                    'line': line_num,
                    'text': link_text,
                    'url': link_url,
                    'resolved': resolved
                })
    
    def check_all(self):
        """Check all markdown files for broken links."""
        md_files = self.find_markdown_files()
        print(f"Checking {len(md_files)} markdown files...")
        
        for md_file in md_files:
            try:
                self.check_file(md_file)
            except Exception as e:
                print(f"Error checking {md_file}: {e}")
    
    def generate_report(self) -> str:
        """Generate a report of broken links."""
        if not self.broken_links:
            return "No broken links found!"
        
        report = f"Found {len(self.broken_links)} broken links:\n\n"
        for link in self.broken_links:
            report += f"File: {link['file']}\n"
            report += f"  Line {link['line']}: [{link['text']}]({link['url']})\n"
            report += f"  Resolved to: {link['resolved']}\n"
            report += f"  Status: NOT FOUND\n\n"
        
        return report

def main():
    checker = LinkChecker()
    checker.check_all()
    
    report = checker.generate_report()
    print(report)
    
    # Save report to file
    report_path = Path("/workspace/broken-links-report.txt")
    report_path.write_text(report)
    print(f"\nReport saved to: {report_path}")
    
    # Save JSON for programmatic access
    json_path = Path("/workspace/broken-links.json")
    json_path.write_text(json.dumps(checker.broken_links, indent=2))
    print(f"JSON report saved to: {json_path}")
    
    return len(checker.broken_links)

if __name__ == "__main__":
    exit(main())
