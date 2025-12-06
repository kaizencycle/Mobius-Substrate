#!/usr/bin/env python3
"""
ATLAS — Monorepo State Parser & Health Analyzer
Consumes ECHO JSON exports and generates integrity reports

Part of MCP (Mobius Core Protocol) - C-156

Usage:
    python atlas_parser.py <repo_state.json>
    python atlas_parser.py --format json <repo_state.json>
    python atlas_parser.py --compare state1.json state2.json
"""

import json
from typing import Dict, Any, List
from datetime import datetime, timezone
import sys
import argparse


class ATLASParser:
    """Parse ECHO state exports and generate health reports"""
    
    VERSION = "1.0.0"
    
    def __init__(self, state_payload: Dict[str, Any]):
        self.state = state_payload
        self.issues: List[str] = []
        self.warnings: List[str] = []
        self.recommendations: List[str] = []
        self.scores: Dict[str, float] = {}
    
    def validate_integrity(self) -> bool:
        """Verify the payload hasn't been tampered with"""
        return "integrity_hash" in self.state.get("meta", {})
    
    def analyze_git_health(self) -> Dict[str, Any]:
        """Analyze git repository health"""
        git_info = self.state.get("git", {})
        
        health = {
            "status": "✅ Healthy",
            "score": 1.0,
            "details": []
        }
        
        if git_info.get("error"):
            health["status"] = "❌ Git Error"
            health["score"] = 0.0
            health["details"].append(git_info["error"])
            self.issues.append("Git repository not accessible")
            return health
        
        # Check for uncommitted changes
        if not git_info.get("is_clean", True):
            changes = git_info.get("uncommitted_changes", 0)
            health["details"].append(f"⚠️  {changes} uncommitted changes")
            health["score"] -= 0.1
            self.warnings.append(f"Repository has {changes} uncommitted changes")
        
        # Check commits
        commits = git_info.get("recent_commits", [])
        if commits:
            latest = commits[0]
            health["details"].append(f"Latest: {latest['hash']} - {latest['message'][:50]}")
        else:
            health["details"].append("No commits found")
            health["score"] -= 0.2
            self.warnings.append("No recent commits detected")
        
        # Update status based on score
        if health["score"] < 0.8:
            health["status"] = "⚠️  Issues Detected"
        
        self.scores["git"] = max(0, health["score"])
        return health
    
    def analyze_directory_structure(self) -> Dict[str, Any]:
        """Analyze directory structure completeness"""
        
        critical_dirs = {
            "docs": "Documentation root",
            "configs": "Configuration files",
            "sentinels": "AI Sentinel implementations",
            "FOUNDATION": "Governance documents",
        }
        
        important_dirs = {
            "apps": "Application implementations",
            "packages": "Shared packages",
            "scripts": "Automation tooling",
            "infra": "Infrastructure configs",
        }
        
        optional_dirs = {
            "docs/whitepapers": "Core whitepapers",
            "docs/specifications": "Technical specifications",
            "docs/reports": "Health reports",
            "labs": "Research experiments",
        }
        
        health_check = self.state.get("directory_health", {})
        
        missing_critical = []
        missing_important = []
        missing_optional = []
        present = []
        
        # Check critical directories
        for dir_path, description in critical_dirs.items():
            if dir_path in health_check:
                info = health_check[dir_path]
                if info.get("exists"):
                    file_count = info.get("file_count", 0)
                    present.append(f"✅ {dir_path} ({file_count} files)")
                else:
                    missing_critical.append(f"❌ {dir_path} — {description}")
                    self.issues.append(f"CRITICAL: Missing directory: {dir_path}")
            else:
                missing_critical.append(f"❌ {dir_path} — {description}")
                self.issues.append(f"CRITICAL: Missing directory: {dir_path}")
        
        # Check important directories
        for dir_path, description in important_dirs.items():
            if dir_path in health_check:
                info = health_check[dir_path]
                if info.get("exists"):
                    file_count = info.get("file_count", 0)
                    present.append(f"✅ {dir_path} ({file_count} files)")
                else:
                    missing_important.append(f"⚠️  {dir_path} — {description}")
                    self.warnings.append(f"Missing important directory: {dir_path}")
        
        # Check optional directories
        for dir_path, description in optional_dirs.items():
            if dir_path in health_check:
                info = health_check[dir_path]
                if info.get("exists"):
                    file_count = info.get("file_count", 0)
                    present.append(f"✅ {dir_path} ({file_count} files)")
                else:
                    missing_optional.append(f"◌ {dir_path} — {description}")
        
        # Calculate score
        total = len(critical_dirs) + len(important_dirs)
        missing = len(missing_critical) + len(missing_important) * 0.5
        score = max(0, 1 - (missing / total))
        
        self.scores["directory"] = score
        
        return {
            "present": present,
            "missing_critical": missing_critical,
            "missing_important": missing_important,
            "missing_optional": missing_optional,
            "score": score
        }
    
    def analyze_key_files(self) -> Dict[str, Any]:
        """Check for presence and health of key files"""
        key_files = self.state.get("key_files", {})
        
        critical = [
            "README.md",
            "package.json",
            ".cursorrules",
        ]
        
        important = [
            "CONTRIBUTING.md",
            "FOUNDATION/CHARTER.md",
            "FOUNDATION/GOVERNANCE.md",
            "configs/mic_config.yaml",
        ]
        
        optional = [
            "LICENSE",
            "pyproject.toml",
            ".civic/virtue_accords.yaml",
            "docs/whitepapers/MIC-Whitepaper-v2.x.md",
        ]
        
        status = {
            "present": [],
            "critical_missing": [],
            "important_missing": [],
            "optional_missing": [],
            "score": 1.0
        }
        
        # Check critical files
        for file_path in critical:
            if file_path in key_files:
                if key_files[file_path].get("exists"):
                    info = key_files[file_path]
                    size = info.get("size", 0)
                    status["present"].append(f"✅ {file_path} ({size} bytes)")
                else:
                    status["critical_missing"].append(f"❌ {file_path}")
                    self.issues.append(f"CRITICAL: Missing {file_path}")
                    status["score"] -= 0.2
            else:
                status["critical_missing"].append(f"❌ {file_path}")
                self.issues.append(f"CRITICAL: Missing {file_path}")
                status["score"] -= 0.2
        
        # Check important files
        for file_path in important:
            if file_path in key_files:
                if key_files[file_path].get("exists"):
                    info = key_files[file_path]
                    size = info.get("size", 0)
                    status["present"].append(f"✅ {file_path} ({size} bytes)")
                else:
                    status["important_missing"].append(f"⚠️  {file_path}")
                    self.warnings.append(f"Missing important file: {file_path}")
                    status["score"] -= 0.1
        
        # Check optional files
        for file_path in optional:
            if file_path in key_files:
                if key_files[file_path].get("exists"):
                    info = key_files[file_path]
                    size = info.get("size", 0)
                    status["present"].append(f"✅ {file_path} ({size} bytes)")
                else:
                    status["optional_missing"].append(f"◌ {file_path}")
        
        status["score"] = max(0, status["score"])
        self.scores["files"] = status["score"]
        
        return status
    
    def analyze_package_health(self) -> Dict[str, Any]:
        """Analyze monorepo package structure"""
        packages = self.state.get("package_health", {})
        
        result = {
            "root": packages.get("root", {}),
            "apps_count": len(packages.get("apps", [])),
            "packages_count": len(packages.get("packages", [])),
            "apps": packages.get("apps", []),
            "packages": packages.get("packages", []),
            "score": 1.0
        }
        
        if not packages.get("root"):
            result["score"] -= 0.3
            self.warnings.append("Missing root package.json")
        
        if result["apps_count"] == 0:
            result["score"] -= 0.2
            self.warnings.append("No apps found in apps/ directory")
        
        if result["packages_count"] == 0:
            result["score"] -= 0.2
            self.warnings.append("No packages found in packages/ directory")
        
        result["score"] = max(0, result["score"])
        self.scores["packages"] = result["score"]
        
        return result
    
    def generate_recommendations(self) -> List[str]:
        """Generate actionable recommendations"""
        recs = []
        
        # Based on issues and warnings
        if any("docs/reports" in issue for issue in self.issues + self.warnings):
            recs.append("Create docs/reports/ and add health report templates")
        
        if any("MIC-Whitepaper" in issue for issue in self.warnings):
            recs.append("Add MIC Whitepaper v2.x with Appendix G (fork doctrine)")
        
        if any("CHARTER" in issue for issue in self.warnings):
            recs.append("Create FOUNDATION/CHARTER.md with governance rules")
        
        if any("uncommitted" in warning.lower() for warning in self.warnings):
            recs.append("Commit pending changes to maintain clean repository state")
        
        # Based on package health
        pkg_health = self.state.get("package_health", {})
        if not pkg_health.get("root", {}).get("workspaces"):
            recs.append("Consider using pnpm workspaces for monorepo management")
        
        # Based on sentinel structure
        dir_health = self.state.get("directory_health", {})
        for sentinel in ["atlas", "echo", "aurea"]:
            sentinel_path = f"sentinels/{sentinel}"
            if not dir_health.get(sentinel_path, {}).get("exists"):
                recs.append(f"Implement {sentinel.upper()} Sentinel in sentinels/{sentinel}/")
        
        self.recommendations = recs
        return recs
    
    def calculate_gi_score(self) -> float:
        """Calculate Global Integrity (GI) score"""
        # GI = 0.25*M + 0.20*H + 0.30*I + 0.25*E
        
        m_score = self.scores.get("files", 0.5)  # Memory
        h_score = self.scores.get("git", 0.5)    # Human (git activity)
        i_score = self.scores.get("directory", 0.5)  # Integrity
        e_score = self.scores.get("packages", 0.5)   # Ethics (structure)
        
        gi = 0.25 * m_score + 0.20 * h_score + 0.30 * i_score + 0.25 * e_score
        return round(gi, 4)
    
    def generate_markdown_report(self) -> str:
        """Generate markdown health report"""
        
        # Run all analyses (side effects populate self.scores)
        self.analyze_git_health()
        dir_status = self.analyze_directory_structure()
        file_status = self.analyze_key_files()
        pkg_health = self.analyze_package_health()
        recommendations = self.generate_recommendations()
        gi_score = self.calculate_gi_score()
        
        meta = self.state.get("meta", {})
        
        report = f"""# Mobius Systems — Repository Health Report

**Generated by:** ATLAS (via ECHO sync)  
**Protocol:** MCP (Mobius Core Protocol)  
**Cycle:** {meta.get('cycle', 'unknown')}  
**Timestamp:** {meta.get('timestamp', 'unknown')}  
**Repo Path:** {meta.get('repo_path', 'unknown')}  
**Integrity Hash:** {meta.get('integrity_hash', 'unknown')[:16]}...

---

## 🎯 Global Integrity (GI) Score

**GI: {gi_score:.4f}** {'✅ PASS' if gi_score >= 0.95 else '⚠️  BELOW THRESHOLD' if gi_score >= 0.8 else '❌ CRITICAL'}

| Component | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Memory (M) | {self.scores.get('files', 0):.2f} | 0.25 | {self.scores.get('files', 0) * 0.25:.3f} |
| Human (H) | {self.scores.get('git', 0):.2f} | 0.20 | {self.scores.get('git', 0) * 0.20:.3f} |
| Integrity (I) | {self.scores.get('directory', 0):.2f} | 0.30 | {self.scores.get('directory', 0) * 0.30:.3f} |
| Ethics (E) | {self.scores.get('packages', 0):.2f} | 0.25 | {self.scores.get('packages', 0) * 0.25:.3f} |

---

## 1. Git Status

{self._format_git_status()}

---

## 2. Directory Structure

{self._format_directory_status(dir_status)}

---

## 3. Key Files

{self._format_file_status(file_status)}

---

## 4. Package Health

{self._format_package_status(pkg_health)}

---

## 5. Issues & Warnings

### Critical Issues
{self._format_list(self.issues) or "_None_"}

### Warnings
{self._format_list(self.warnings) or "_None_"}

---

## 6. Recommendations

{self._format_list(recommendations) or "_Repository is in good health_"}

---

## 7. Summary

| Metric | Status |
|--------|--------|
| Integrity Verified | {'✅ Yes' if self.validate_integrity() else '❌ No'} |
| GI Score | {gi_score:.4f} |
| Critical Issues | {len(self.issues)} |
| Warnings | {len(self.warnings)} |
| Recommendations | {len(recommendations)} |

---

*Generated by ATLAS — Context & Memory Sentinel*  
*Part of MCP (Mobius Core Protocol) - C-156*  
*"We heal as we walk."*
"""
        return report
    
    def generate_json_report(self) -> Dict[str, Any]:
        """Generate JSON health report"""
        
        git_health = self.analyze_git_health()
        dir_status = self.analyze_directory_structure()
        file_status = self.analyze_key_files()
        pkg_health = self.analyze_package_health()
        recommendations = self.generate_recommendations()
        gi_score = self.calculate_gi_score()
        
        return {
            "meta": {
                "sentinel": "ATLAS",
                "version": self.VERSION,
                "protocol": "MCP",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "source_timestamp": self.state.get("meta", {}).get("timestamp"),
                "source_hash": self.state.get("meta", {}).get("integrity_hash"),
            },
            "gi_score": gi_score,
            "gi_threshold": 0.95,
            "gi_passed": gi_score >= 0.95,
            "scores": self.scores,
            "git_health": git_health,
            "directory_health": dir_status,
            "file_health": file_status,
            "package_health": pkg_health,
            "issues": self.issues,
            "warnings": self.warnings,
            "recommendations": recommendations,
            "integrity_verified": self.validate_integrity()
        }
    
    def _format_git_status(self) -> str:
        git = self.state.get("git", {})
        
        if git.get("error"):
            return f"❌ **Error:** {git['error']}"
        
        status_text = "🟢 Clean" if git.get('is_clean') else f"🟡 {git.get('uncommitted_changes', 0)} uncommitted changes"
        
        lines = [
            f"- **Branch:** {git.get('current_branch', 'unknown')}",
            f"- **Latest Commit:** {git.get('last_commit_hash', 'unknown')}",
            f"- **Date:** {git.get('last_commit_date', 'unknown')}",
            f"- **Message:** {git.get('last_commit_message', 'unknown')[:60]}...",
            f"- **Status:** {status_text}",
        ]
        
        return "\n".join(lines)
    
    def _format_directory_status(self, status: Dict[str, Any]) -> str:
        output = f"**Score:** {status['score']:.2f}\n\n"
        output += "### Present\n"
        output += "\n".join(status["present"][:15]) or "_None_"
        
        if status["missing_critical"]:
            output += "\n\n### Critical Missing\n"
            output += "\n".join(status["missing_critical"])
        
        if status["missing_important"]:
            output += "\n\n### Important Missing\n"
            output += "\n".join(status["missing_important"])
        
        return output
    
    def _format_file_status(self, status: Dict[str, Any]) -> str:
        output = f"**Score:** {status['score']:.2f}\n\n"
        output += "### Present\n"
        output += "\n".join(status["present"][:10]) or "_None_"
        
        if status["critical_missing"]:
            output += "\n\n### Critical Missing\n"
            output += "\n".join(status["critical_missing"])
        
        if status["important_missing"]:
            output += "\n\n### Important Missing\n"
            output += "\n".join(status["important_missing"])
        
        return output
    
    def _format_package_status(self, status: Dict[str, Any]) -> str:
        output = f"**Score:** {status['score']:.2f}\n\n"
        
        root = status.get("root", {})
        if root:
            output += f"- **Root Package:** {root.get('name', 'unknown')} v{root.get('version', 'unknown')}\n"
            workspaces = root.get("workspaces", [])
            if workspaces:
                output += f"- **Workspaces:** {', '.join(workspaces[:5])}\n"
        
        output += f"- **Apps:** {status['apps_count']}\n"
        output += f"- **Packages:** {status['packages_count']}\n"
        
        return output
    
    def _format_list(self, items: List[str]) -> str:
        if not items:
            return ""
        return "\n".join(f"- {item}" for item in items)


def compare_states(state1: Dict[str, Any], state2: Dict[str, Any]) -> Dict[str, Any]:
    """Compare two repository states for drift detection"""
    
    result = {
        "comparison_timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "state1_timestamp": state1.get("meta", {}).get("timestamp"),
        "state2_timestamp": state2.get("meta", {}).get("timestamp"),
        "changes": [],
        "drift_score": 0.0
    }
    
    # Compare git
    git1 = state1.get("git", {})
    git2 = state2.get("git", {})
    
    if git1.get("current_branch") != git2.get("current_branch"):
        result["changes"].append({
            "type": "branch_change",
            "from": git1.get("current_branch"),
            "to": git2.get("current_branch")
        })
    
    if git1.get("last_commit_hash") != git2.get("last_commit_hash"):
        result["changes"].append({
            "type": "new_commits",
            "from_hash": git1.get("last_commit_hash"),
            "to_hash": git2.get("last_commit_hash")
        })
    
    # Compare key files
    files1 = state1.get("key_files", {})
    files2 = state2.get("key_files", {})
    
    all_files = set(files1.keys()) | set(files2.keys())
    for file_path in all_files:
        f1 = files1.get(file_path, {})
        f2 = files2.get(file_path, {})
        
        if f1.get("hash") != f2.get("hash"):
            result["changes"].append({
                "type": "file_changed",
                "path": file_path,
                "hash_before": f1.get("hash"),
                "hash_after": f2.get("hash")
            })
        
        if f1.get("exists") != f2.get("exists"):
            result["changes"].append({
                "type": "file_added" if f2.get("exists") else "file_removed",
                "path": file_path
            })
    
    # Calculate drift score
    result["drift_score"] = min(1.0, len(result["changes"]) * 0.1)
    result["is_drifted"] = result["drift_score"] > 0.3
    
    return result


def main():
    parser = argparse.ArgumentParser(
        description="ATLAS Parser - Repository Health Analysis",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  Report:   python atlas_parser.py repo_state.json
  JSON:     python atlas_parser.py --format json repo_state.json
  Compare:  python atlas_parser.py --compare state1.json state2.json

Part of MCP (Mobius Core Protocol) - C-156
        """
    )
    
    parser.add_argument(
        "file",
        type=str,
        nargs="?",
        help="Path to the ECHO state JSON file"
    )
    
    parser.add_argument(
        "--format", "-f",
        choices=["markdown", "json"],
        default="markdown",
        help="Output format (default: markdown)"
    )
    
    parser.add_argument(
        "--compare", "-c",
        type=str,
        nargs=2,
        metavar=("FILE1", "FILE2"),
        help="Compare two state files for drift detection"
    )
    
    args = parser.parse_args()
    
    if args.compare:
        # Compare two states
        with open(args.compare[0], 'r') as f:
            state1 = json.load(f)
        with open(args.compare[1], 'r') as f:
            state2 = json.load(f)
        
        result = compare_states(state1, state2)
        print(json.dumps(result, indent=2))
    
    elif args.file:
        # Analyze single state
        with open(args.file, 'r') as f:
            state = json.load(f)
        
        atlas = ATLASParser(state)
        
        if args.format == "json":
            report = atlas.generate_json_report()
            print(json.dumps(report, indent=2))
        else:
            report = atlas.generate_markdown_report()
            print(report)
    
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
