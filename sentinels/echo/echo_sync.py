#!/usr/bin/env python3
"""
ECHO — GitHub Repository Sync Sentinel
Exports Mobius Systems monorepo state as JSON for ATLAS consumption

Part of MCP (Mobius Core Protocol) - C-156

Usage:
    python echo_sync.py export > repo_state.json
    python echo_sync.py validate repo_state.json
    python echo_sync.py export --depth 6 > deep_state.json
"""

import json
import hashlib
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any
import sys
import argparse


class ECHOSentinel:
    """Repository state extraction and integrity verification"""
    
    VERSION = "1.0.0"
    
    def __init__(self, repo_path: str = "."):
        self.repo_path = Path(repo_path).resolve()
        self.timestamp = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        
    def get_git_info(self) -> Dict[str, Any]:
        """Extract git metadata"""
        try:
            branch = subprocess.check_output(
                ["git", "branch", "--show-current"],
                cwd=self.repo_path,
                text=True,
                stderr=subprocess.DEVNULL
            ).strip()
            
            last_commit = subprocess.check_output(
                ["git", "log", "-1", "--format=%H|%ai|%s"],
                cwd=self.repo_path,
                text=True,
                stderr=subprocess.DEVNULL
            ).strip()
            
            commit_hash, commit_date, commit_msg = last_commit.split("|", 2)
            
            # Get recent commits
            recent_commits = subprocess.check_output(
                ["git", "log", "-10", "--format=%H|%ai|%s"],
                cwd=self.repo_path,
                text=True,
                stderr=subprocess.DEVNULL
            ).strip().split("\n")
            
            commits = []
            for line in recent_commits:
                parts = line.split("|", 2)
                if len(parts) == 3:
                    commits.append({
                        "hash": parts[0][:8],
                        "date": parts[1],
                        "message": parts[2][:100]  # Truncate long messages
                    })
            
            # Get branches
            branches_output = subprocess.check_output(
                ["git", "branch", "-a"],
                cwd=self.repo_path,
                text=True,
                stderr=subprocess.DEVNULL
            ).strip().split("\n")
            
            branches = [b.strip().replace("* ", "") for b in branches_output if b.strip()]
            
            # Get git status summary
            status = subprocess.check_output(
                ["git", "status", "--porcelain"],
                cwd=self.repo_path,
                text=True,
                stderr=subprocess.DEVNULL
            ).strip()
            
            modified_files = len([l for l in status.split("\n") if l.strip()])
            
            return {
                "current_branch": branch,
                "last_commit_hash": commit_hash[:8],
                "last_commit_full_hash": commit_hash,
                "last_commit_date": commit_date,
                "last_commit_message": commit_msg,
                "recent_commits": commits,
                "all_branches": branches[:20],  # Limit branches
                "uncommitted_changes": modified_files,
                "is_clean": modified_files == 0
            }
        except subprocess.CalledProcessError as e:
            return {
                "error": f"Git not available or not a git repo: {e}",
                "current_branch": "unknown",
                "last_commit_hash": "unknown",
                "last_commit_date": "unknown",
                "last_commit_message": "unknown",
                "recent_commits": [],
                "all_branches": [],
                "uncommitted_changes": 0,
                "is_clean": False
            }
    
    def scan_directory_tree(self, max_depth: int = 4) -> Dict[str, Any]:
        """Recursively scan directory structure"""
        
        # Directories to skip
        skip_dirs = {
            '.git', 'node_modules', '__pycache__', '.venv', 'venv',
            'dist', 'build', '.next', '.cache', 'coverage',
            '.pytest_cache', '.mypy_cache', '.tox', 'eggs',
            '*.egg-info', '.eggs', 'htmlcov', '.hypothesis'
        }
        
        def scan_dir(path: Path, depth: int = 0) -> Dict[str, Any]:
            if depth > max_depth:
                return {"truncated": True, "reason": "max_depth_exceeded"}
            
            result = {
                "type": "directory",
                "name": path.name or str(path),
                "path": str(path.relative_to(self.repo_path)) if path != self.repo_path else ".",
                "children": []
            }
            
            try:
                items = sorted(path.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower()))
                
                file_count = 0
                dir_count = 0
                
                for item in items:
                    # Skip hidden files/dirs and node_modules
                    if item.name.startswith('.') or item.name in skip_dirs:
                        continue
                    
                    if item.is_dir():
                        dir_count += 1
                        child = scan_dir(item, depth + 1)
                        result["children"].append(child)
                    else:
                        file_count += 1
                        try:
                            stat = item.stat()
                            result["children"].append({
                                "type": "file",
                                "name": item.name,
                                "path": str(item.relative_to(self.repo_path)),
                                "size": stat.st_size,
                                "modified": datetime.fromtimestamp(
                                    stat.st_mtime
                                ).isoformat(),
                                "extension": item.suffix.lower() if item.suffix else None
                            })
                        except (OSError, PermissionError):
                            result["children"].append({
                                "type": "file",
                                "name": item.name,
                                "error": "access_denied"
                            })
                
                result["file_count"] = file_count
                result["dir_count"] = dir_count
                
            except PermissionError:
                result["error"] = "Permission denied"
            except OSError as e:
                result["error"] = str(e)
            
            return result
        
        return scan_dir(self.repo_path)
    
    def extract_key_files(self) -> Dict[str, Any]:
        """Extract content of key configuration and documentation files"""
        
        key_files = [
            # Root files
            "README.md",
            "CONTRIBUTING.md",
            "LICENSE",
            "package.json",
            "pyproject.toml",
            "Cargo.toml",
            "pnpm-workspace.yaml",
            ".cursorrules",
            # Configs
            "configs/mic_config.yaml",
            "configs/kaizen_shards.yaml",
            "configs/gi_config.yaml",
            # Docs
            "docs/whitepapers/MIC-Whitepaper-v2.x.md",
            # Foundation
            "FOUNDATION/CHARTER.md",
            "FOUNDATION/GOVERNANCE.md",
            # Civic
            ".civic/virtue_accords.yaml",
            ".civic/biodna.json",
        ]
        
        extracted = {}
        
        for file_path in key_files:
            full_path = self.repo_path / file_path
            if full_path.exists() and full_path.is_file():
                try:
                    # Only read text files under 1MB
                    size = full_path.stat().st_size
                    if size < 1_000_000:
                        content = full_path.read_text(encoding='utf-8', errors='ignore')
                        extracted[file_path] = {
                            "exists": True,
                            "size": len(content),
                            "lines": len(content.split("\n")),
                            "hash": hashlib.sha256(content.encode()).hexdigest()[:16],
                            "preview": content[:500] + ("..." if len(content) > 500 else "")
                        }
                    else:
                        extracted[file_path] = {
                            "exists": True,
                            "size": size,
                            "too_large": True
                        }
                except Exception as e:
                    extracted[file_path] = {
                        "exists": True,
                        "error": str(e)
                    }
            else:
                extracted[file_path] = {"exists": False}
        
        return extracted
    
    def analyze_directory_health(self) -> Dict[str, Any]:
        """Check for expected directory structure"""
        
        expected_dirs = {
            # Core documentation
            "docs": "Documentation root",
            "docs/whitepapers": "Core whitepapers (MIC, DCS, MFS)",
            "docs/specifications": "Technical specifications",
            "docs/reports": "Health and integrity reports",
            # Configuration
            "configs": "Configuration files (YAML, JSON)",
            # Applications
            "apps": "Application implementations",
            # Packages
            "packages": "Shared packages and libraries",
            # Sentinels
            "sentinels": "AI Sentinel implementations",
            "sentinels/atlas": "ATLAS Sentinel",
            "sentinels/echo": "ECHO Sentinel",
            "sentinels/aurea": "AUREA Sentinel",
            # Infrastructure
            "infra": "Infrastructure configurations",
            "scripts": "Automation and tooling",
            # Labs
            "labs": "Research and experiments",
            # Foundation
            "FOUNDATION": "Governance and legal documents",
        }
        
        health = {}
        
        for dir_path, description in expected_dirs.items():
            full_path = self.repo_path / dir_path
            if full_path.exists() and full_path.is_dir():
                try:
                    file_count = len([f for f in full_path.iterdir() if f.is_file()])
                    dir_count = len([d for d in full_path.iterdir() if d.is_dir()])
                    health[dir_path] = {
                        "exists": True,
                        "file_count": file_count,
                        "dir_count": dir_count,
                        "description": description
                    }
                except PermissionError:
                    health[dir_path] = {
                        "exists": True,
                        "error": "access_denied",
                        "description": description
                    }
            else:
                health[dir_path] = {
                    "exists": False,
                    "description": description
                }
        
        return health
    
    def analyze_package_health(self) -> Dict[str, Any]:
        """Analyze package.json and monorepo structure"""
        
        packages = {}
        
        # Check root package.json
        root_pkg = self.repo_path / "package.json"
        if root_pkg.exists():
            try:
                content = json.loads(root_pkg.read_text())
                packages["root"] = {
                    "name": content.get("name", "unknown"),
                    "version": content.get("version", "unknown"),
                    "workspaces": content.get("workspaces", []),
                    "scripts": list(content.get("scripts", {}).keys())
                }
            except json.JSONDecodeError:
                packages["root"] = {"error": "invalid_json"}
        
        # Check apps
        apps_dir = self.repo_path / "apps"
        if apps_dir.exists():
            packages["apps"] = []
            for app in apps_dir.iterdir():
                if app.is_dir():
                    pkg_json = app / "package.json"
                    if pkg_json.exists():
                        try:
                            content = json.loads(pkg_json.read_text())
                            packages["apps"].append({
                                "name": content.get("name", app.name),
                                "version": content.get("version", "unknown"),
                                "path": str(app.relative_to(self.repo_path))
                            })
                        except json.JSONDecodeError:
                            packages["apps"].append({
                                "name": app.name,
                                "error": "invalid_json"
                            })
        
        # Check packages
        packages_dir = self.repo_path / "packages"
        if packages_dir.exists():
            packages["packages"] = []
            for pkg in packages_dir.iterdir():
                if pkg.is_dir():
                    pkg_json = pkg / "package.json"
                    pyproject = pkg / "pyproject.toml"
                    if pkg_json.exists():
                        try:
                            content = json.loads(pkg_json.read_text())
                            packages["packages"].append({
                                "name": content.get("name", pkg.name),
                                "version": content.get("version", "unknown"),
                                "type": "npm",
                                "path": str(pkg.relative_to(self.repo_path))
                            })
                        except json.JSONDecodeError:
                            packages["packages"].append({
                                "name": pkg.name,
                                "type": "npm",
                                "error": "invalid_json"
                            })
                    elif pyproject.exists():
                        packages["packages"].append({
                            "name": pkg.name,
                            "type": "python",
                            "path": str(pkg.relative_to(self.repo_path))
                        })
        
        return packages
    
    def generate_integrity_signature(self, payload: Dict[str, Any]) -> str:
        """Generate SHA-256 signature of the payload"""
        # Create a copy without the integrity_hash field
        payload_copy = {k: v for k, v in payload.items() if k != "meta"}
        if "meta" in payload:
            meta_copy = {k: v for k, v in payload["meta"].items() if k != "integrity_hash"}
            payload_copy["meta"] = meta_copy
        
        payload_str = json.dumps(payload_copy, sort_keys=True, ensure_ascii=True)
        return hashlib.sha256(payload_str.encode()).hexdigest()
    
    def export_state(self, max_depth: int = 4) -> Dict[str, Any]:
        """Generate complete repository state export"""
        
        payload = {
            "meta": {
                "sentinel": "ECHO",
                "version": self.VERSION,
                "protocol": "MCP",
                "cycle": "C-156",
                "timestamp": self.timestamp,
                "repo_path": str(self.repo_path),
            },
            "git": self.get_git_info(),
            "structure": self.scan_directory_tree(max_depth=max_depth),
            "key_files": self.extract_key_files(),
            "directory_health": self.analyze_directory_health(),
            "package_health": self.analyze_package_health(),
        }
        
        # Add integrity signature
        payload["meta"]["integrity_hash"] = self.generate_integrity_signature(payload)
        
        return payload
    
    def validate_state(self, payload: Dict[str, Any]) -> bool:
        """Validate integrity of a state payload"""
        
        if "meta" not in payload or "integrity_hash" not in payload["meta"]:
            print("❌ Missing integrity hash", file=sys.stderr)
            return False
        
        stored_hash = payload["meta"]["integrity_hash"]
        
        # Compute hash without the integrity_hash field
        payload_copy = json.loads(json.dumps(payload))
        del payload_copy["meta"]["integrity_hash"]
        
        payload_str = json.dumps(payload_copy, sort_keys=True, ensure_ascii=True)
        computed_hash = hashlib.sha256(payload_str.encode()).hexdigest()
        
        if stored_hash == computed_hash:
            print("✅ Integrity verified", file=sys.stderr)
            print(f"   Sentinel: {payload['meta'].get('sentinel', 'unknown')}", file=sys.stderr)
            print(f"   Version: {payload['meta'].get('version', 'unknown')}", file=sys.stderr)
            print(f"   Timestamp: {payload['meta'].get('timestamp', 'unknown')}", file=sys.stderr)
            return True
        else:
            print("❌ Integrity check failed", file=sys.stderr)
            print(f"   Stored:   {stored_hash}", file=sys.stderr)
            print(f"   Computed: {computed_hash}", file=sys.stderr)
            return False


def main():
    parser = argparse.ArgumentParser(
        description="ECHO Sentinel - Repository State Export & Validation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  Export:   python echo_sync.py export > repo_state.json
  Validate: python echo_sync.py validate repo_state.json
  Deep:     python echo_sync.py export --depth 6 > deep_state.json

Part of MCP (Mobius Core Protocol) - C-156
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Export command
    export_parser = subparsers.add_parser("export", help="Export repository state as JSON")
    export_parser.add_argument(
        "--depth", "-d",
        type=int,
        default=4,
        help="Maximum directory scan depth (default: 4)"
    )
    export_parser.add_argument(
        "--repo", "-r",
        type=str,
        default=".",
        help="Repository path (default: current directory)"
    )
    
    # Validate command
    validate_parser = subparsers.add_parser("validate", help="Validate a state JSON file")
    validate_parser.add_argument(
        "file",
        type=str,
        help="Path to the JSON state file"
    )
    
    args = parser.parse_args()
    
    if args.command == "export":
        echo = ECHOSentinel(repo_path=args.repo)
        state = echo.export_state(max_depth=args.depth)
        print(json.dumps(state, indent=2))
    
    elif args.command == "validate":
        with open(args.file, 'r') as f:
            payload = json.load(f)
        
        echo = ECHOSentinel()
        if echo.validate_state(payload):
            sys.exit(0)
        else:
            sys.exit(1)
    
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
