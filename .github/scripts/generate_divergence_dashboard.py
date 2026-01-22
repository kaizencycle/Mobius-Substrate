#!/usr/bin/env python3
"""
Mobius Divergence Dashboard Generator

Generates:
- docs/divergence/data.json (current PR data)
- docs/divergence/dashboard.md (markdown summary)
- docs/divergence/history/index.json (timeline of snapshots)
- docs/divergence/history/{timestamp}.json (individual snapshots)
- docs/divergence/history/events.json (detected divergence events)
"""

import os
import json
import urllib.request
import datetime

TOKEN = os.environ["GITHUB_TOKEN"]
REPO = os.environ["REPO"]
OUT_DIR = os.environ.get("OUT_DIR", "docs/divergence")

BOT_MARKER = "<!-- MOBIUS_PR_BOT -->"
MAX_HISTORY_POINTS = 180  # ~45 days at 6hr cadence
MAX_EVENTS = 200


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


def count_severity(items):
    """Count items by severity."""
    c = {"high": 0, "medium": 0, "low": 0, "unknown": 0}
    for it in items:
        s = it.get("severity") or "unknown"
        if s not in c:
            s = "unknown"
        c[s] += 1
    return c


def write_json(path, obj):
    """Write JSON to file."""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2)


def load_json(path):
    """Load JSON from file."""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


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
                line_lower = line.lower()
                if "**high**" in line_lower:
                    severity = "high"
                elif "**medium**" in line_lower:
                    severity = "medium"
                elif "**low**" in line_lower:
                    severity = "low"
                
                if "justification_hash" in line and "`" in line:
                    parts = line.split("`")
                    for part in parts:
                        if len(part) == 64 and all(ch in "0123456789abcdef" for ch in part):
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


def diff_events(prev, curr):
    """Generate events from differences between two snapshots."""
    events = []
    prev_sig = (prev or {}).get("pr_sig") or {}
    curr_sig = (curr or {}).get("pr_sig") or {}

    prev_prs = set(prev_sig.keys())
    curr_prs = set(curr_sig.keys())

    # New PRs
    for pr in sorted(curr_prs - prev_prs, key=int):
        c = curr_sig[pr]
        events.append({
            "ts": curr["generated_at"],
            "type": "pr_opened",
            "pr": int(pr),
            "url": c.get("url", ""),
            "severity": c.get("severity", "unknown"),
            "detail": f"PR opened (severity={c.get('severity')})"
        })

    # Closed PRs
    for pr in sorted(prev_prs - curr_prs, key=int):
        p = prev_sig[pr]
        events.append({
            "ts": curr["generated_at"],
            "type": "pr_closed",
            "pr": int(pr),
            "url": p.get("url", ""),
            "severity": p.get("severity", "unknown"),
            "detail": "PR closed/merged"
        })

    # Changes
    for pr in sorted(prev_prs & curr_prs, key=int):
        p = prev_sig[pr]
        c = curr_sig[pr]

        if p.get("severity") != c.get("severity"):
            events.append({
                "ts": curr["generated_at"],
                "type": "severity_flip",
                "pr": int(pr),
                "url": c.get("url", ""),
                "severity": c.get("severity", "unknown"),
                "prev_severity": p.get("severity", "unknown"),
                "detail": f"severity: {p.get('severity')} → {c.get('severity')}"
            })

        if p.get("epicon") != c.get("epicon"):
            events.append({
                "ts": curr["generated_at"],
                "type": "epicon_flip",
                "pr": int(pr),
                "url": c.get("url", ""),
                "severity": c.get("severity", "unknown"),
                "prev_epicon": p.get("epicon", "unknown"),
                "epicon": c.get("epicon", "unknown"),
                "detail": f"EPICON: {p.get('epicon')} → {c.get('epicon')}"
            })

        if p.get("gate") != c.get("gate"):
            events.append({
                "ts": curr["generated_at"],
                "type": "gate_flip",
                "pr": int(pr),
                "url": c.get("url", ""),
                "severity": c.get("severity", "unknown"),
                "prev_gate": p.get("gate", "unknown"),
                "gate": c.get("gate", "unknown"),
                "detail": f"Gate: {p.get('gate')} → {c.get('gate')}"
            })

    return events


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    hist_dir = f"{OUT_DIR}/history"
    os.makedirs(hist_dir, exist_ok=True)

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

        comments = gh(f"/repos/{REPO}/issues/{number}/comments?per_page=100")
        severity, jhash = extract_severity_and_hash(comments)

        check_map = get_check_conclusions(pr)
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

    # Sort by severity then PR number
    SEV_ORDER = {"high": 0, "medium": 1, "low": 2, "unknown": 3}
    rows.sort(key=lambda x: (SEV_ORDER.get(x["severity"], 3), x["pr"]))

    generated_at = now_utc()

    data = {
        "repo": REPO,
        "generated_at": generated_at,
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

    # Write main data.json
    json_path = f"{OUT_DIR}/data.json"
    write_json(json_path, data)
    print(f"Wrote {json_path}")

    # --- Timeline / History ---
    
    # Build per-PR signature for event detection
    pr_sig = {}
    for it in data["items"]:
        pr = str(it.get("pr"))
        pr_sig[pr] = {
            "severity": it.get("severity") or "unknown",
            "mode": it.get("mode") or "normal",
            "epicon": (it.get("checks") or {}).get("epicon") or "unknown",
            "gate": (it.get("checks") or {}).get("merge_gate") or "unknown",
            "url": it.get("url") or ""
        }

    counts = count_severity(data["items"])
    snapshot = {
        "repo": REPO,
        "generated_at": generated_at,
        "open_pr_count": data["open_pr_count"],
        "counts": counts,
        "emergency_count": data["emergency_count"],
        "pr_sig": pr_sig
    }

    # Snapshot filename: YYYYMMDDTHHMMSSZ.json
    ts = generated_at.replace(":", "").replace("-", "").replace("+00:00", "Z")
    ts = ts.split(".")[0]
    if not ts.endswith("Z"):
        ts += "Z"
    snap_path = f"{hist_dir}/{ts}.json"
    write_json(snap_path, snapshot)
    print(f"Wrote {snap_path}")

    # Load and update timeline index
    index_path = f"{hist_dir}/index.json"
    timeline = []
    if os.path.exists(index_path):
        try:
            timeline = load_json(index_path).get("timeline", [])
        except Exception:
            timeline = []

    timeline.append(snapshot)
    timeline = timeline[-MAX_HISTORY_POINTS:]

    write_json(index_path, {
        "repo": REPO,
        "updated_at": generated_at,
        "timeline": timeline
    })
    print(f"Wrote {index_path} ({len(timeline)} points)")

    # --- Build events from timeline deltas ---
    events_path = f"{hist_dir}/events.json"
    
    # Load existing events
    existing_events = []
    if os.path.exists(events_path):
        try:
            existing_events = load_json(events_path).get("events", [])
        except Exception:
            existing_events = []

    # Generate events from last two snapshots
    if len(timeline) >= 2:
        new_events = diff_events(timeline[-2], timeline[-1])
        existing_events.extend(new_events)
        if new_events:
            print(f"  Generated {len(new_events)} new events")

    # Keep only last N events
    existing_events = existing_events[-MAX_EVENTS:]

    write_json(events_path, {
        "repo": REPO,
        "updated_at": generated_at,
        "events": existing_events
    })
    print(f"Wrote {events_path} ({len(existing_events)} events)")

    # --- Write Markdown dashboard ---
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
            gate_status = "✓" if it["checks"]["merge_gate"] == "success" else "✗" if it["checks"]["merge_gate"] == "failure" else "?"
            mode_icon = "🚨" if it["mode"] == "emergency" else "—"
            upd = it["updated_at"][:10]
            
            md.append(f"| {sev_icon} {sev} | {pr_link} | {title} | @{author} | {ep} | {gate_status} | {mode_icon} | {upd} |")
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
