#!/usr/bin/env python3
"""
AUREA — Integrity Sentinel Analysis Module
Analyzes ECHO exports for constitutional compliance and integrity violations

Part of MCP (Mobius Core Protocol) - C-156

While ATLAS focuses on structure and completeness,
AUREA focuses on integrity, consistency, and constitutional alignment.

Usage:
    python aurea_analyzer.py <repo_state.json>
    python aurea_analyzer.py --format json <repo_state.json>
    python aurea_analyzer.py --consensus <repo_state.json>  # Include in multi-sentinel consensus
"""

import json
from typing import Dict, Any, List
from datetime import datetime, timezone
import argparse
import hashlib
import re


class AUREAIntegrityAnalyzer:
    """Constitutional compliance and integrity auditing sentinel"""
    
    VERSION = "1.0.0"
    
    # Integrity score weights
    WEIGHTS = {
        "cryptographic": 0.20,
        "constitutional": 0.25,
        "immutability": 0.20,
        "transparency": 0.15,
        "anti_capture": 0.20,
    }
    
    def __init__(self, state_payload: Dict[str, Any]):
        self.state = state_payload
        self.violations: List[str] = []
        self.warnings: List[str] = []
        self.recommendations: List[str] = []
        self.scores: Dict[str, float] = {}
        self.integrity_score = 1.0
        
    def verify_cryptographic_integrity(self) -> Dict[str, Any]:
        """Verify the payload hasn't been tampered with"""
        meta = self.state.get("meta", {})
        
        result = {
            "check": "Cryptographic Integrity",
            "status": "unknown",
            "score": 0.0,
            "details": []
        }
        
        if "integrity_hash" not in meta:
            self.violations.append("CRITICAL: Missing integrity signature")
            result["status"] = "❌ FAILED"
            result["details"].append("No cryptographic signature present")
            result["score"] = 0.0
        else:
            # Verify the hash matches
            stored_hash = meta["integrity_hash"]
            
            # Recompute hash (without the integrity_hash field)
            payload_copy = json.loads(json.dumps(self.state))
            del payload_copy["meta"]["integrity_hash"]
            payload_str = json.dumps(payload_copy, sort_keys=True, ensure_ascii=True)
            computed_hash = hashlib.sha256(payload_str.encode()).hexdigest()
            
            if stored_hash == computed_hash:
                result["status"] = "✅ VERIFIED"
                result["details"].append(f"Hash: {stored_hash[:16]}...")
                result["details"].append(f"Timestamp: {meta.get('timestamp', 'unknown')}")
                result["score"] = 1.0
            else:
                self.violations.append("CRITICAL: Integrity hash mismatch - payload may be tampered")
                result["status"] = "❌ TAMPERED"
                result["details"].append(f"Stored: {stored_hash[:16]}...")
                result["details"].append(f"Computed: {computed_hash[:16]}...")
                result["score"] = 0.0
        
        self.scores["cryptographic"] = result["score"]
        return result
    
    def audit_constitutional_alignment(self) -> Dict[str, Any]:
        """Check for files that define constitutional rules"""
        
        key_files = self.state.get("key_files", {})
        dir_health = self.state.get("directory_health", {})
        
        # Constitutional documents (critical governance files)
        constitutional_docs = {
            "FOUNDATION/CHARTER.md": "Core constitutional document",
            "FOUNDATION/GOVERNANCE.md": "Governance framework",
            ".civic/virtue_accords.yaml": "Virtue accords configuration",
            "configs/mic_config.yaml": "MIC economic constitution",
            "configs/kaizen_shards.yaml": "Shard taxonomy (integrity proof)",
            ".cursorrules": "Development governance rules",
        }
        
        result = {
            "check": "Constitutional Alignment",
            "status": "unknown",
            "score": 1.0,
            "present": [],
            "missing": [],
            "details": []
        }
        
        for doc_path, description in constitutional_docs.items():
            if doc_path in key_files:
                if key_files[doc_path].get("exists"):
                    result["present"].append(f"✅ {doc_path}")
                else:
                    result["missing"].append(f"❌ {doc_path} — {description}")
                    self.warnings.append(f"Missing constitutional doc: {doc_path}")
                    result["score"] -= 0.15
            else:
                # Check if it might exist but wasn't in key_files list
                result["missing"].append(f"⚠️  {doc_path} — {description} (not tracked)")
                result["score"] -= 0.05
        
        # Check for FOUNDATION directory
        if "FOUNDATION" in dir_health:
            if dir_health["FOUNDATION"].get("exists"):
                result["details"].append("✅ FOUNDATION directory present")
            else:
                result["missing"].append("❌ FOUNDATION directory missing")
                self.violations.append("CRITICAL: FOUNDATION directory missing")
                result["score"] -= 0.3
        
        result["score"] = max(0, result["score"])
        result["status"] = "✅ ALIGNED" if result["score"] >= 0.8 else "⚠️  GAPS DETECTED" if result["score"] >= 0.5 else "❌ MISALIGNED"
        
        self.scores["constitutional"] = result["score"]
        return result
    
    def detect_integrity_drift(self) -> Dict[str, Any]:
        """Detect signs of drift from canonical integrity standards"""
        
        git_info = self.state.get("git", {})
        recent_commits = git_info.get("recent_commits", [])
        
        result = {
            "check": "Integrity Drift Detection",
            "status": "unknown",
            "score": 1.0,
            "drift_signals": [],
            "details": []
        }
        
        # Red flag patterns in commit messages
        red_flags = [
            (r'\bbypass\b', "Bypass language detected", 0.1),
            (r'\bskip\b', "Skip language detected", 0.05),
            (r'\bignore\b', "Ignore language detected", 0.05),
            (r'\bhack\b', "Hack language detected", 0.1),
            (r'\btemp\b', "Temporary fix language", 0.03),
            (r'\bquick fix\b', "Quick fix language", 0.03),
            (r'\bhotfix\b', "Hotfix language", 0.02),
            (r'\bwip\b', "Work in progress", 0.01),
            (r'\bfixme\b', "FIXME marker", 0.02),
            (r'\btodo\b', "TODO marker", 0.01),
            (r'\bdisable\b', "Disable language", 0.08),
            (r'\bremove.*check\b', "Check removal", 0.15),
            (r'\bforce\b', "Force language", 0.05),
        ]
        
        for commit in recent_commits:
            msg = commit.get("message", "").lower()
            
            for pattern, concern, penalty in red_flags:
                if re.search(pattern, msg, re.IGNORECASE):
                    result["drift_signals"].append({
                        "commit": commit["hash"],
                        "message": commit["message"][:60],
                        "concern": concern,
                        "severity": "high" if penalty >= 0.1 else "medium" if penalty >= 0.05 else "low"
                    })
                    self.warnings.append(f"Drift signal in {commit['hash']}: {concern}")
                    result["score"] -= penalty
        
        # Check for uncommitted changes
        if not git_info.get("is_clean", True):
            changes = git_info.get("uncommitted_changes", 0)
            if changes > 10:
                result["drift_signals"].append({
                    "type": "uncommitted_changes",
                    "count": changes,
                    "concern": "Large number of uncommitted changes",
                    "severity": "medium"
                })
                result["score"] -= 0.1
                self.warnings.append(f"Large uncommitted change set: {changes} files")
        
        result["score"] = max(0, result["score"])
        result["status"] = "✅ No drift detected" if not result["drift_signals"] else \
                          "⚠️  Minor drift signals" if result["score"] >= 0.8 else \
                          "❌ Significant drift detected"
        
        self.scores["drift"] = result["score"]
        return result
    
    def verify_immutability_constraints(self) -> Dict[str, Any]:
        """Check that immutable files are present and tracked"""
        
        # Files that should NEVER change once established (eternal files)
        immutable_files = {
            "LICENSE": "Public domain protection",
            "FOUNDATION/CHARTER.md": "Core constitutional charter",
        }
        
        # Files that should exist but can be updated carefully
        protected_files = {
            ".civic/virtue_accords.yaml": "Virtue accords",
            "FOUNDATION/GOVERNANCE.md": "Governance framework",
        }
        
        key_files = self.state.get("key_files", {})
        
        result = {
            "check": "Immutability Constraints",
            "status": "unknown",
            "score": 1.0,
            "immutable_present": [],
            "immutable_missing": [],
            "protected_present": [],
            "protected_missing": [],
            "details": []
        }
        
        # Check immutable files
        for file_path, description in immutable_files.items():
            if file_path in key_files:
                if key_files[file_path].get("exists"):
                    result["immutable_present"].append(f"✅ {file_path}")
                else:
                    result["immutable_missing"].append(f"❌ {file_path} — {description}")
                    self.violations.append(f"CRITICAL: Immutable file missing: {file_path}")
                    result["score"] -= 0.3
            else:
                result["immutable_missing"].append(f"⚠️  {file_path} — {description} (not tracked)")
                result["score"] -= 0.1
        
        # Check protected files
        for file_path, description in protected_files.items():
            if file_path in key_files:
                if key_files[file_path].get("exists"):
                    result["protected_present"].append(f"✅ {file_path}")
                else:
                    result["protected_missing"].append(f"⚠️  {file_path} — {description}")
                    self.warnings.append(f"Protected file missing: {file_path}")
                    result["score"] -= 0.1
        
        result["score"] = max(0, result["score"])
        result["status"] = "✅ Immutability preserved" if result["score"] >= 0.9 else \
                          "⚠️  Some gaps" if result["score"] >= 0.6 else \
                          "❌ Violations detected"
        
        self.scores["immutability"] = result["score"]
        return result
    
    def audit_transparency_compliance(self) -> Dict[str, Any]:
        """Verify that transparency requirements are met"""
        
        required_public_docs = {
            "README.md": "Project overview",
            "LICENSE": "License declaration",
            "CONTRIBUTING.md": "Contribution guidelines",
        }
        
        recommended_docs = {
            "SECURITY.md": "Security policy",
            "docs/whitepapers/MIC-Whitepaper-v2.x.md": "Economic whitepaper",
        }
        
        key_files = self.state.get("key_files", {})
        dir_health = self.state.get("directory_health", {})
        
        result = {
            "check": "Transparency Compliance",
            "status": "unknown",
            "score": 1.0,
            "required_present": [],
            "required_missing": [],
            "recommended_present": [],
            "recommended_missing": [],
            "details": []
        }
        
        # Check required docs
        for doc, description in required_public_docs.items():
            if doc in key_files and key_files[doc].get("exists"):
                result["required_present"].append(f"✅ {doc}")
            else:
                result["required_missing"].append(f"❌ {doc} — {description}")
                self.warnings.append(f"Transparency gap: {doc} missing")
                result["score"] -= 0.2
        
        # Check recommended docs
        for doc, description in recommended_docs.items():
            if doc in key_files and key_files[doc].get("exists"):
                result["recommended_present"].append(f"✅ {doc}")
            else:
                result["recommended_missing"].append(f"◌ {doc} — {description}")
                result["score"] -= 0.05
        
        # Check docs directory exists
        if "docs" in dir_health and dir_health["docs"].get("exists"):
            result["details"].append("✅ Documentation directory present")
        else:
            result["details"].append("⚠️  No docs directory")
            result["score"] -= 0.1
        
        result["score"] = max(0, result["score"])
        result["status"] = "✅ Transparent" if result["score"] >= 0.9 else \
                          "⚠️  Gaps in transparency" if result["score"] >= 0.6 else \
                          "❌ Transparency violations"
        
        self.scores["transparency"] = result["score"]
        return result
    
    def check_anti_capture_safeguards(self) -> Dict[str, Any]:
        """Verify anti-capture mechanisms are present"""
        
        key_files = self.state.get("key_files", {})
        dir_health = self.state.get("directory_health", {})
        
        result = {
            "check": "Anti-Capture Safeguards",
            "status": "unknown",
            "score": 1.0,
            "safeguards_present": [],
            "safeguards_missing": [],
            "details": []
        }
        
        # Check for public domain license
        if "LICENSE" in key_files:
            if key_files["LICENSE"].get("exists"):
                result["safeguards_present"].append("✅ Public domain protection active")
                # Check if it mentions public domain in preview
                preview = key_files["LICENSE"].get("preview", "").lower()
                if "public domain" in preview or "cc0" in preview or "unlicense" in preview:
                    result["details"].append("✅ License explicitly public domain")
                else:
                    result["details"].append("⚠️  License type unclear from preview")
            else:
                result["safeguards_missing"].append("❌ No license = no capture protection")
                self.violations.append("CRITICAL: Public domain license missing")
                result["score"] -= 0.3
        
        # Check for governance documentation
        if "FOUNDATION" in dir_health and dir_health["FOUNDATION"].get("exists"):
            result["safeguards_present"].append("✅ Governance framework documented")
        else:
            result["safeguards_missing"].append("⚠️  Governance framework incomplete")
            self.warnings.append("Anti-capture: Governance needs documentation")
            result["score"] -= 0.15
        
        # Check for MIC config (economic safeguards)
        if "configs/mic_config.yaml" in key_files:
            if key_files["configs/mic_config.yaml"].get("exists"):
                result["safeguards_present"].append("✅ MIC economic safeguards present")
            else:
                result["safeguards_missing"].append("❌ MIC config missing")
                self.violations.append("CRITICAL: MIC safeguards not configured")
                result["score"] -= 0.25
        
        # Check for sentinels (multi-agent oversight)
        if "sentinels" in dir_health and dir_health["sentinels"].get("exists"):
            sentinel_count = dir_health["sentinels"].get("dir_count", 0)
            if sentinel_count >= 3:
                result["safeguards_present"].append(f"✅ Multi-sentinel oversight ({sentinel_count} sentinels)")
            else:
                result["details"].append(f"⚠️  Limited sentinel coverage ({sentinel_count} sentinels)")
                result["score"] -= 0.05
        
        # Check for virtue accords
        if ".civic/virtue_accords.yaml" in key_files:
            if key_files[".civic/virtue_accords.yaml"].get("exists"):
                result["safeguards_present"].append("✅ Virtue Accords active")
            else:
                result["safeguards_missing"].append("⚠️  Virtue Accords not configured")
                result["score"] -= 0.1
        
        result["score"] = max(0, result["score"])
        result["status"] = "✅ Safeguards active" if result["score"] >= 0.8 else \
                          "⚠️  Safeguards incomplete" if result["score"] >= 0.5 else \
                          "❌ Critical safeguards missing"
        
        self.scores["anti_capture"] = result["score"]
        return result
    
    def analyze_fork_legitimacy_preparedness(self) -> Dict[str, Any]:
        """Check if repo is ready for fork legitimacy comparisons"""
        
        required_for_fork_eval = [
            "configs/mic_config.yaml",
            ".civic/virtue_accords.yaml",
            "FOUNDATION/CHARTER.md",
        ]
        
        key_files = self.state.get("key_files", {})
        
        result = {
            "check": "Fork Legitimacy Preparedness",
            "status": "unknown",
            "ready": True,
            "present": [],
            "missing": [],
            "details": []
        }
        
        for file_path in required_for_fork_eval:
            if file_path in key_files and key_files[file_path].get("exists"):
                result["present"].append(f"✅ {file_path}")
            else:
                result["ready"] = False
                result["missing"].append(f"❌ {file_path}")
                self.warnings.append(f"Fork eval not ready: {file_path} missing")
        
        result["status"] = "✅ Fork evaluation ready" if result["ready"] else "⚠️  Missing fork evaluation files"
        
        return result
    
    def calculate_integrity_score(self) -> float:
        """Calculate weighted integrity score"""
        
        weighted_score = 0.0
        
        for component, weight in self.WEIGHTS.items():
            score = self.scores.get(component, 0.5)
            weighted_score += score * weight
        
        # Add drift score if calculated
        if "drift" in self.scores:
            drift_weight = 0.15
            # Adjust other weights proportionally
            adjusted_weights = {k: v * (1 - drift_weight) for k, v in self.WEIGHTS.items()}
            weighted_score = sum(self.scores.get(k, 0.5) * w for k, w in adjusted_weights.items())
            weighted_score += self.scores["drift"] * drift_weight
        
        self.integrity_score = round(weighted_score, 4)
        return self.integrity_score
    
    def assess_covenant_alignment(self) -> Dict[str, Any]:
        """Assess alignment with Three Covenants"""
        
        assessments = {
            "integrity": {"status": "unknown", "score": 0.0, "details": ""},
            "ecology": {"status": "unknown", "score": 0.0, "details": ""},
            "custodianship": {"status": "unknown", "score": 0.0, "details": ""},
        }
        
        # Integrity Covenant
        integrity_score = self.calculate_integrity_score()
        if integrity_score >= 0.90:
            assessments["integrity"] = {
                "status": "✅",
                "score": integrity_score,
                "details": "Strong — No major compromises detected"
            }
        elif integrity_score >= 0.70:
            assessments["integrity"] = {
                "status": "⚠️",
                "score": integrity_score,
                "details": "Acceptable — Some drift present"
            }
        else:
            assessments["integrity"] = {
                "status": "❌",
                "score": integrity_score,
                "details": "Compromised — Immediate restoration required"
            }
        
        # Ecology Covenant (sustainable patterns)
        dir_health = self.state.get("directory_health", {})
        docs_exist = dir_health.get("docs", {}).get("exists", False)
        if docs_exist:
            assessments["ecology"] = {
                "status": "✅",
                "score": 1.0,
                "details": "Documentation sustains knowledge transfer"
            }
        else:
            assessments["ecology"] = {
                "status": "⚠️",
                "score": 0.5,
                "details": "Incomplete documentation threatens continuity"
            }
        
        # Custodianship Covenant
        key_files = self.state.get("key_files", {})
        license_exists = key_files.get("LICENSE", {}).get("exists", False)
        if license_exists:
            assessments["custodianship"] = {
                "status": "✅",
                "score": 1.0,
                "details": "Public domain ensures long-term access"
            }
        else:
            assessments["custodianship"] = {
                "status": "❌",
                "score": 0.0,
                "details": "No license = no long-term protection"
            }
        
        return assessments
    
    def generate_recommendations(self) -> List[str]:
        """Generate actionable recommendations"""
        recs = []
        
        if self.integrity_score < 0.95:
            recs.append("Address all violations before next cycle closure")
        
        if any("constitutional" in w.lower() for w in self.warnings):
            recs.append("Document constitutional framework in FOUNDATION/")
        
        if any("immutab" in v.lower() for v in self.violations):
            recs.append("URGENT: Restore immutable files immediately")
        
        if any("license" in v.lower() for v in self.violations):
            recs.append("URGENT: Add public domain license to prevent capture")
        
        if any("mic" in v.lower() for v in self.violations):
            recs.append("Configure MIC economic safeguards in configs/mic_config.yaml")
        
        if any("drift" in w.lower() for w in self.warnings):
            recs.append("Review flagged commits for potential integrity issues")
        
        if not recs:
            recs.append("Maintain current integrity standards")
            recs.append("Continue regular audits at cycle boundaries")
        
        self.recommendations = recs
        return recs
    
    def generate_integrity_verdict(self) -> str:
        """Generate final integrity assessment"""
        score = self.calculate_integrity_score()
        
        if score >= 0.95:
            return "✅ EXCELLENT — Canonical integrity maintained"
        elif score >= 0.85:
            return "✅ GOOD — Minor improvements recommended"
        elif score >= 0.70:
            return "⚠️  ACCEPTABLE — Attention required"
        elif score >= 0.50:
            return "⚠️  DEGRADED — Immediate action needed"
        else:
            return "❌ COMPROMISED — Critical integrity violations"
    
    def generate_markdown_report(self) -> str:
        """Generate AUREA's integrity audit report"""
        
        # Run all audits
        crypto_result = self.verify_cryptographic_integrity()
        const_result = self.audit_constitutional_alignment()
        drift_result = self.detect_integrity_drift()
        immut_result = self.verify_immutability_constraints()
        transp_result = self.audit_transparency_compliance()
        capture_result = self.check_anti_capture_safeguards()
        fork_result = self.analyze_fork_legitimacy_preparedness()
        covenants = self.assess_covenant_alignment()
        recommendations = self.generate_recommendations()
        
        integrity_score = self.calculate_integrity_score()
        verdict = self.generate_integrity_verdict()
        
        meta = self.state.get("meta", {})
        
        report = f"""# 🛡️ AUREA Integrity Audit Report

**Sentinel:** AUREA — Integrity Guardian  
**Protocol:** MCP (Mobius Core Protocol)  
**Cycle:** {meta.get('cycle', 'unknown')}  
**Timestamp:** {meta.get('timestamp', 'unknown')}  
**Repository:** {meta.get('repo_path', 'unknown')}  

---

## 🎯 Executive Summary

**Integrity Score:** {integrity_score:.2%}  
**Verdict:** {verdict}

| Metric | Value |
|--------|-------|
| Critical Violations | {len(self.violations)} |
| Warnings | {len(self.warnings)} |
| Recommendations | {len(recommendations)} |

---

## 1. Cryptographic Integrity

**Status:** {crypto_result['status']}  
**Score:** {crypto_result['score']:.0%}

{self._format_list(crypto_result['details'])}

---

## 2. Constitutional Alignment

**Status:** {const_result['status']}  
**Score:** {const_result['score']:.0%}

### Present
{self._format_list(const_result['present']) or "_None tracked_"}

### Missing
{self._format_list(const_result['missing']) or "_None_"}

---

## 3. Integrity Drift Detection

**Status:** {drift_result['status']}  
**Score:** {drift_result['score']:.0%}

{self._format_drift_signals(drift_result['drift_signals'])}

---

## 4. Immutability Constraints

**Status:** {immut_result['status']}  
**Score:** {immut_result['score']:.0%}

### Immutable Files
{self._format_list(immut_result['immutable_present']) or "_None_"}
{self._format_list(immut_result['immutable_missing']) or ""}

### Protected Files
{self._format_list(immut_result['protected_present']) or "_None_"}
{self._format_list(immut_result['protected_missing']) or ""}

---

## 5. Transparency Compliance

**Status:** {transp_result['status']}  
**Score:** {transp_result['score']:.0%}

### Required Documents
{self._format_list(transp_result['required_present'])}
{self._format_list(transp_result['required_missing'])}

### Recommended Documents
{self._format_list(transp_result['recommended_present'])}
{self._format_list(transp_result['recommended_missing'])}

---

## 6. Anti-Capture Safeguards

**Status:** {capture_result['status']}  
**Score:** {capture_result['score']:.0%}

### Active Safeguards
{self._format_list(capture_result['safeguards_present']) or "_None_"}

### Missing Safeguards
{self._format_list(capture_result['safeguards_missing']) or "_None_"}

---

## 7. Fork Legitimacy Preparedness

**Status:** {fork_result['status']}  
**Ready:** {"✅ Yes" if fork_result['ready'] else "❌ No"}

{self._format_list(fork_result['present'])}
{self._format_list(fork_result['missing'])}

---

## 8. Violations & Warnings

### Critical Violations
{self._format_list(self.violations) or "_None detected_"}

### Warnings
{self._format_list(self.warnings) or "_None detected_"}

---

## 9. Recommendations

{self._format_numbered_list(recommendations)}

---

## 10. Covenant Alignment

| Covenant | Status | Details |
|----------|--------|---------|
| Integrity | {covenants['integrity']['status']} | {covenants['integrity']['details']} |
| Ecology | {covenants['ecology']['status']} | {covenants['ecology']['details']} |
| Custodianship | {covenants['custodianship']['status']} | {covenants['custodianship']['details']} |

---

## 11. Score Breakdown

| Component | Score | Weight |
|-----------|-------|--------|
| Cryptographic | {self.scores.get('cryptographic', 0):.0%} | {self.WEIGHTS['cryptographic']:.0%} |
| Constitutional | {self.scores.get('constitutional', 0):.0%} | {self.WEIGHTS['constitutional']:.0%} |
| Immutability | {self.scores.get('immutability', 0):.0%} | {self.WEIGHTS['immutability']:.0%} |
| Transparency | {self.scores.get('transparency', 0):.0%} | {self.WEIGHTS['transparency']:.0%} |
| Anti-Capture | {self.scores.get('anti_capture', 0):.0%} | {self.WEIGHTS['anti_capture']:.0%} |

**Weighted Total:** {integrity_score:.2%}

---

**Integrity Signature:** {meta.get('integrity_hash', 'unknown')[:16]}...  
**Audit Complete:** {datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')}  

---

*"We walk the path. We do not compromise."*  
— AUREA, Integrity Sentinel
"""
        return report
    
    def generate_json_report(self) -> Dict[str, Any]:
        """Generate JSON integrity report"""
        
        crypto_result = self.verify_cryptographic_integrity()
        const_result = self.audit_constitutional_alignment()
        drift_result = self.detect_integrity_drift()
        immut_result = self.verify_immutability_constraints()
        transp_result = self.audit_transparency_compliance()
        capture_result = self.check_anti_capture_safeguards()
        fork_result = self.analyze_fork_legitimacy_preparedness()
        covenants = self.assess_covenant_alignment()
        recommendations = self.generate_recommendations()
        
        integrity_score = self.calculate_integrity_score()
        
        return {
            "meta": {
                "sentinel": "AUREA",
                "version": self.VERSION,
                "protocol": "MCP",
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "source_timestamp": self.state.get("meta", {}).get("timestamp"),
                "source_hash": self.state.get("meta", {}).get("integrity_hash"),
            },
            "integrity_score": integrity_score,
            "integrity_threshold": 0.95,
            "integrity_passed": integrity_score >= 0.95,
            "verdict": self.generate_integrity_verdict(),
            "scores": self.scores,
            "audits": {
                "cryptographic": crypto_result,
                "constitutional": const_result,
                "drift": drift_result,
                "immutability": immut_result,
                "transparency": transp_result,
                "anti_capture": capture_result,
                "fork_readiness": fork_result,
            },
            "covenants": covenants,
            "violations": self.violations,
            "warnings": self.warnings,
            "recommendations": recommendations,
        }
    
    def generate_consensus_vote(self) -> Dict[str, Any]:
        """Generate a consensus vote for multi-sentinel coordination"""
        
        integrity_score = self.calculate_integrity_score()
        
        return {
            "sentinel": "AUREA",
            "vote": "APPROVE" if integrity_score >= 0.95 else "CONDITIONAL" if integrity_score >= 0.80 else "REJECT",
            "score": integrity_score,
            "threshold": 0.95,
            "violations": len(self.violations),
            "warnings": len(self.warnings),
            "conditions": self.violations + self.warnings[:3] if integrity_score < 0.95 else [],
            "verdict": self.generate_integrity_verdict(),
        }
    
    def _format_list(self, items: List[str]) -> str:
        if not items:
            return ""
        return "\n".join(f"- {item}" for item in items)
    
    def _format_numbered_list(self, items: List[str]) -> str:
        if not items:
            return "_None_"
        return "\n".join(f"{i+1}. {item}" for i, item in enumerate(items))
    
    def _format_drift_signals(self, signals: List[Dict]) -> str:
        if not signals:
            return "_No drift signals detected_"
        
        lines = []
        for sig in signals[:10]:  # Limit to 10
            if "commit" in sig:
                lines.append(f"- `{sig['commit']}`: {sig['concern']} ({sig.get('severity', 'unknown')})")
            else:
                lines.append(f"- {sig.get('type', 'unknown')}: {sig.get('concern', '')}")
        
        return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="AUREA Sentinel - Integrity Audit & Constitutional Compliance",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  Report:    python aurea_analyzer.py repo_state.json
  JSON:      python aurea_analyzer.py --format json repo_state.json
  Consensus: python aurea_analyzer.py --consensus repo_state.json

Part of MCP (Mobius Core Protocol) - C-156
        """
    )
    
    parser.add_argument(
        "file",
        type=str,
        help="Path to the ECHO state JSON file"
    )
    
    parser.add_argument(
        "--format", "-f",
        choices=["markdown", "json"],
        default="markdown",
        help="Output format (default: markdown)"
    )
    
    parser.add_argument(
        "--consensus", "-c",
        action="store_true",
        help="Output consensus vote for multi-sentinel coordination"
    )
    
    args = parser.parse_args()
    
    with open(args.file, 'r') as f:
        state = json.load(f)
    
    aurea = AUREAIntegrityAnalyzer(state)
    
    if args.consensus:
        # Run audits first
        aurea.verify_cryptographic_integrity()
        aurea.audit_constitutional_alignment()
        aurea.detect_integrity_drift()
        aurea.verify_immutability_constraints()
        aurea.audit_transparency_compliance()
        aurea.check_anti_capture_safeguards()
        
        vote = aurea.generate_consensus_vote()
        print(json.dumps(vote, indent=2))
    elif args.format == "json":
        report = aurea.generate_json_report()
        print(json.dumps(report, indent=2))
    else:
        report = aurea.generate_markdown_report()
        print(report)


if __name__ == "__main__":
    main()
