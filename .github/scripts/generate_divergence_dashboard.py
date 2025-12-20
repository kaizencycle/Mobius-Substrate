#!/usr/bin/env python3
"""
Mobius Divergence Dashboard Generator

Generates a JSON data file and markdown summary of open PRs with:
- Divergence severity (from PR bot comments)
- EPICON status
- Merge gate status
- Scope labels
- Emergency mode flags
- Transparency debt issues

Output:
- docs/divergence/data.json (machine-readable)
- docs/divergence/dashboard.md (human-readable)
"""

import os
import json
import urllib.request
import datetime

TOKEN = os.environ["GITHUB_TOKEN"]
REPO = os.environ["REPO"]
OUT_DIR = os.environ.get("OUT_DIR", "docs/divergence")

BOT_MARKER = "<!-- MOBIUS_PR_BOT -->"


def gh(path):
    """Make GitHub API GET request."""
    url = f"https://api.github.com{path}"
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"token {TOKEN}",
            "Accept": "application/vnd.github+json",
            "User-Agent": "mobius-divergence-dashboard",
        },
        method="GET",
    )
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"API error: {e.code} for {path}")
        return None


def now_utc():
    """Get current UTC timestamp."""
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def extract_severity_and_hash(comments):
    """Extract severity and justification hash from bot comments."""
    severity = None
    jhash = None
    
    if comments is None:
        return severity, jhash
    
    for c in comments:
        body = c.get("body") or ""
        if BOT_MARKER in body:
            lines = body.splitlines()
            for line in lines:
                # Look for severity: **HIGH**, **MEDIUM**, **LOW**
                line_lower = line.lower()
                if "**high**" in line_lower:
                    severity = "high"
                elif "**medium**" in line_lower:
                    severity = "medium"
                elif "**low**" in line_lower:
                    severity = "low"
                
                # Look for justification_hash (sha256): `...`
                if "justification_hash" in line and "`" in line:
                    parts = line.split("`")
                    for part in parts:
                        if len(part) == 64 and all(c in "0123456789abcdef" for c in part):
                            jhash = part
                            break
            break
    
    return severity, jhash


def get_check_conclusions(pr):
    """Get check run conclusions for a PR."""
    sha = pr["head"]["sha"]
    checks = gh(f"/repos/{REPO}/commits/{sha}/check-runs?per_page=100")
    
    if checks is None:
        return {}
    
    return {c["name"]: c.get("conclusion") for c in checks.get("check_runs", [])}


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    print(f"Fetching open PRs for {REPO}...")
    prs = gh(f"/repos/{REPO}/pulls?state=open&per_page=100")
    
    if prs is None:
        print("Failed to fetch PRs")
        prs = []
    
    print(f"Found {len(prs)} open PRs")
    rows = []

    for pr in prs:
        number = pr["number"]
        print(f"  Processing PR #{number}...")
        
        labels = [l["name"] for l in pr.get("labels", [])]
        mode = "emergency" if "mode:emergency" in labels else "normal"
        has_debt = "transparency-debt" in labels

        # Get bot comments
        comments = gh(f"/repos/{REPO}/issues/{number}/comments?per_page=100")
        severity, jhash = extract_severity_and_hash(comments)

        # Get check conclusions
        check_map = get_check_conclusions(pr)
        
        # Map check names (job names in workflows)
        epicon = check_map.get("epicon_pr_bot", "unknown")
        gate = check_map.get("gate", "unknown")

        rows.append({
            "pr": number,
            "title": pr["title"],
            "url": pr["html_url"],
            "author": pr["user"]["login"],
            "updated_at": pr["updated_at"],
            "created_at": pr["created_at"],
            "labels": labels,
            "mode": mode,
            "has_debt": has_debt,
            "severity": severity or "unknown",
            "justification_hash": jhash or "",
            "checks": {
                "epicon": epicon,
                "merge_gate": gate
            }
        })

    # Sort by severity (high first), then PR number
    SEV_ORDER = {"high": 0, "medium": 1, "low": 2, "unknown": 3}
    rows.sort(key=lambda x: (SEV_ORDER.get(x["severity"], 3), x["pr"]))

    data = {
        "repo": REPO,
        "generated_at": now_utc(),
        "open_pr_count": len(rows),
        "by_severity": {
            "high": len([r for r in rows if r["severity"] == "high"]),
            "medium": len([r for r in rows if r["severity"] == "medium"]),
            "low": len([r for r in rows if r["severity"] == "low"]),
            "unknown": len([r for r in rows if r["severity"] == "unknown"]),
        },
        "emergency_count": len([r for r in rows if r["mode"] == "emergency"]),
        "items": rows
    }

    # Write JSON
    json_path = f"{OUT_DIR}/data.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"Wrote {json_path}")

    # Write Markdown dashboard
    md = []
    md.append("# Divergence Dashboard")
    md.append("")
    md.append(f"**Repo:** `{REPO}`  ")
    md.append(f"**Generated:** `{data['generated_at']}`  ")
    md.append(f"**Open PRs:** `{data['open_pr_count']}`")
    md.append("")
    md.append("## Summary")
    md.append("")
    md.append("| Severity | Count |")
    md.append("|----------|-------|")
    md.append(f"| 🔴 High | {data['by_severity']['high']} |")
    md.append(f"| 🟡 Medium | {data['by_severity']['medium']} |")
    md.append(f"| 🟢 Low | {data['by_severity']['low']} |")
    md.append(f"| ⚪ Unknown | {data['by_severity']['unknown']} |")
    md.append(f"| 🚨 Emergency | {data['emergency_count']} |")
    md.append("")
    md.append("## Open PRs")
    md.append("")
    
    if rows:
        md.append("| Sev | PR | Title | Author | EPICON | Gate | Mode | Updated |")
        md.append("|-----|---:|-------|--------|--------|------|------|---------|")

        for it in rows:
            sev = it["severity"]
            sev_icon = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(sev, "⚪")
            pr_link = f"[#{it['pr']}]({it['url']})"
            title = it["title"][:50] + ("..." if len(it["title"]) > 50 else "")
            title = title.replace("|", "\\|")
            author = it["author"]
            ep = "✓" if it["checks"]["epicon"] == "success" else "✗" if it["checks"]["epicon"] == "failure" else "?"
            gate = "✓" if it["checks"]["merge_gate"] == "success" else "✗" if it["checks"]["merge_gate"] == "failure" else "?"
            mode = "🚨" if it["mode"] == "emergency" else "—"
            upd = it["updated_at"][:10]
            
            md.append(f"| {sev_icon} {sev} | {pr_link} | {title} | @{author} | {ep} | {gate} | {mode} | {upd} |")
    else:
        md.append("*No open PRs*")

    md.append("")
    md.append("---")
    md.append("")
    md.append("*Divergence is not moral judgment. It is legibility: does behavior match published intent?*")
    md.append("")

    md_path = f"{OUT_DIR}/dashboard.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md) + "\n")
    print(f"Wrote {md_path}")

    print("Done!")


if __name__ == "__main__":
    main()
