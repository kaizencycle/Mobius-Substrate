#!/usr/bin/env python3
"""
Mobius Weekly Governance Digest Generator

Generates weekly digest of governance health, divergence events,
and EPICON compliance for the Mobius ecosystem.

Reference: docs/epicon/EPICON-02.md, docs/epicon/EPICON-03.md
"""

import json
import os
import pathlib
from datetime import datetime, timezone, timedelta
from typing import Optional


# Configuration
DEFAULT_OUT_DIR = "docs/divergence"
DIGEST_FILENAME = "weekly_digest.json"
DIGEST_MD_FILENAME = "WEEKLY_DIGEST.md"


def load_json(path: pathlib.Path) -> dict:
    """Load JSON file, return empty dict if not found."""
    try:
        return json.loads(path.read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def load_events(root: pathlib.Path, days: int = 7) -> list[dict]:
    """Load events from the last N days."""
    events_file = root / "history" / "events.json"
    data = load_json(events_file)
    
    all_events = data.get("events", [])
    
    # Filter to last N days
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    cutoff_str = cutoff.isoformat()
    
    recent = []
    for event in all_events:
        event_time = event.get("timestamp", "")
        if event_time >= cutoff_str:
            recent.append(event)
    
    # Sort by timestamp descending
    recent.sort(key=lambda e: e.get("timestamp", ""), reverse=True)
    
    return recent


def count_by_severity(events: list[dict]) -> dict[str, int]:
    """Count events by severity."""
    counts = {"high": 0, "medium": 0, "low": 0}
    for event in events:
        severity = event.get("severity", "low").lower()
        if severity in counts:
            counts[severity] += 1
    return counts


def count_by_type(events: list[dict]) -> dict[str, int]:
    """Count events by type."""
    counts = {}
    for event in events:
        event_type = event.get("type", "unknown")
        counts[event_type] = counts.get(event_type, 0) + 1
    return counts


def get_top_contributors(events: list[dict], limit: int = 5) -> list[dict]:
    """Get top contributors by event count."""
    counts = {}
    for event in events:
        author = event.get("author", "unknown")
        counts[author] = counts.get(author, 0) + 1
    
    sorted_authors = sorted(counts.items(), key=lambda x: x[1], reverse=True)
    return [{"author": a, "events": c} for a, c in sorted_authors[:limit]]


def get_open_prs(data: dict) -> int:
    """Get count of open PRs from dashboard data."""
    return data.get("counts", {}).get("total_open", 0)


def get_severity_counts(data: dict) -> dict[str, int]:
    """Get severity counts from dashboard data."""
    return data.get("counts", {}).get("severity", {"high": 0, "medium": 0, "low": 0})


def generate_digest(
    root: pathlib.Path,
    days: int = 7,
    title: Optional[str] = None
) -> dict:
    """
    Generate weekly digest data.
    
    Args:
        root: Path to divergence data directory
        days: Number of days to include
        title: Optional title for the digest
        
    Returns:
        Digest data dictionary
    """
    # Load current data
    data = load_json(root / "data.json")
    
    # Load recent events
    events = load_events(root, days)
    
    # Calculate date range
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=days)
    
    # Build digest
    digest = {
        "title": title or f"Mobius Weekly Governance Digest",
        "period": {
            "start": start_date.strftime("%Y-%m-%d"),
            "end": end_date.strftime("%Y-%m-%d"),
            "days": days
        },
        "generated_at": end_date.isoformat() + "Z",
        "summary": {
            "open_prs": get_open_prs(data),
            "severity": get_severity_counts(data),
            "events_this_period": len(events),
            "events_by_type": count_by_type(events),
            "events_by_severity": count_by_severity(events)
        },
        "top_events": events[:10],
        "top_contributors": get_top_contributors(events),
        "action_items": generate_action_items(data, events),
        "health_score": calculate_health_score(data, events)
    }
    
    return digest


def calculate_health_score(data: dict, events: list[dict]) -> dict:
    """
    Calculate governance health score.
    
    Score based on:
    - Low divergence events (higher = better)
    - Low open PRs (moderate = best)
    - Low high-severity issues (higher = better)
    """
    severity = get_severity_counts(data)
    open_prs = get_open_prs(data)
    events_by_severity = count_by_severity(events)
    
    # Base score starts at 100
    score = 100
    
    # Penalty for high severity (current)
    score -= severity.get("high", 0) * 10
    
    # Penalty for medium severity (current)
    score -= severity.get("medium", 0) * 5
    
    # Penalty for high severity events this week
    score -= events_by_severity.get("high", 0) * 5
    
    # Penalty for too many open PRs
    if open_prs > 20:
        score -= (open_prs - 20) * 2
    
    # Ensure bounds
    score = max(0, min(100, score))
    
    # Determine status
    if score >= 80:
        status = "healthy"
        emoji = "🟢"
    elif score >= 60:
        status = "attention_needed"
        emoji = "🟡"
    else:
        status = "critical"
        emoji = "🔴"
    
    return {
        "score": score,
        "status": status,
        "emoji": emoji,
        "factors": {
            "high_severity_current": severity.get("high", 0),
            "high_severity_events": events_by_severity.get("high", 0),
            "open_prs": open_prs
        }
    }


def generate_action_items(data: dict, events: list[dict]) -> list[str]:
    """Generate action items based on current state."""
    items = []
    severity = get_severity_counts(data)
    events_by_severity = count_by_severity(events)
    
    if severity.get("high", 0) > 0:
        items.append(f"🔴 Resolve {severity['high']} HIGH severity divergences immediately")
    
    if severity.get("medium", 0) > 2:
        items.append(f"🟡 Review and address {severity['medium']} MEDIUM severity issues")
    
    if events_by_severity.get("high", 0) > 3:
        items.append("⚠️ High volume of high-severity events this week - investigate patterns")
    
    # Check for stale intents
    items.append("📋 Review and expire outdated intent publications")
    
    # Standard items
    items.append("🔄 Re-run EPICON checks on pending PRs")
    
    return items


def generate_markdown(digest: dict) -> str:
    """Generate markdown version of the digest."""
    health = digest["health_score"]
    summary = digest["summary"]
    period = digest["period"]
    
    lines = [
        f"# {digest['title']}",
        "",
        f"**Period:** {period['start']} to {period['end']} ({period['days']} days)",
        f"**Generated:** {digest['generated_at']}",
        "",
        "---",
        "",
        "## 📊 Health Score",
        "",
        f"{health['emoji']} **{health['score']}/100** ({health['status'].replace('_', ' ').title()})",
        "",
        "| Factor | Value |",
        "|--------|-------|",
        f"| High Severity (current) | {health['factors']['high_severity_current']} |",
        f"| High Severity Events | {health['factors']['high_severity_events']} |",
        f"| Open PRs | {health['factors']['open_prs']} |",
        "",
        "---",
        "",
        "## 📈 Summary",
        "",
        f"- **Open PRs:** {summary['open_prs']}",
        f"- **Events This Week:** {summary['events_this_period']}",
        "",
        "### Severity Breakdown (Current)",
        "",
        f"| Severity | Count |",
        f"|----------|-------|",
        f"| 🔴 High | {summary['severity'].get('high', 0)} |",
        f"| 🟡 Medium | {summary['severity'].get('medium', 0)} |",
        f"| 🟢 Low | {summary['severity'].get('low', 0)} |",
        "",
        "### Events by Type",
        "",
        "| Type | Count |",
        "|------|-------|",
    ]
    
    for event_type, count in summary.get("events_by_type", {}).items():
        lines.append(f"| {event_type} | {count} |")
    
    lines.extend([
        "",
        "---",
        "",
        "## ⚡ Top Events",
        "",
    ])
    
    for i, event in enumerate(digest.get("top_events", [])[:10], 1):
        event_type = event.get("type", "unknown")
        pr = event.get("pr", "N/A")
        detail = event.get("detail", "")[:60]
        lines.append(f"{i}. **{event_type}** · PR #{pr} · {detail}")
    
    lines.extend([
        "",
        "---",
        "",
        "## 👥 Top Contributors",
        "",
        "| Author | Events |",
        "|--------|--------|",
    ])
    
    for contrib in digest.get("top_contributors", []):
        lines.append(f"| @{contrib['author']} | {contrib['events']} |")
    
    lines.extend([
        "",
        "---",
        "",
        "## ✅ Action Items",
        "",
    ])
    
    for item in digest.get("action_items", []):
        lines.append(f"- [ ] {item}")
    
    lines.extend([
        "",
        "---",
        "",
        "*This digest is generated automatically by the Mobius governance system.*",
        "",
        "*\"We heal as we walk.\" — Mobius Systems*",
    ])
    
    return "\n".join(lines)


def generate_bot_comment(digest: dict) -> str:
    """Generate a shorter comment for bot posting."""
    health = digest["health_score"]
    summary = digest["summary"]
    period = digest["period"]
    
    lines = [
        f"## 📊 Weekly Mobius Digest ({period['start']} - {period['end']})",
        "",
        f"### Health: {health['emoji']} {health['score']}/100",
        "",
        f"- **Open PRs:** {summary['open_prs']}",
        f"- **Severity:** 🔴 {summary['severity'].get('high', 0)}, "
        f"🟡 {summary['severity'].get('medium', 0)}, "
        f"🟢 {summary['severity'].get('low', 0)}",
        "",
        "### Top Events",
        "",
    ]
    
    for event in digest.get("top_events", [])[:5]:
        event_type = event.get("type", "unknown")
        pr = event.get("pr", "N/A")
        lines.append(f"- {event_type} · PR #{pr}")
    
    lines.extend([
        "",
        "### Action Items",
        "",
    ])
    
    for item in digest.get("action_items", [])[:3]:
        lines.append(f"- {item}")
    
    lines.extend([
        "",
        "*This digest is generated automatically.*",
    ])
    
    return "\n".join(lines)


def main():
    """CLI entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate Mobius weekly digest")
    parser.add_argument("--out-dir", default=DEFAULT_OUT_DIR, help="Output directory")
    parser.add_argument("--days", type=int, default=7, help="Days to include")
    parser.add_argument("--json", action="store_true", help="Output JSON only")
    parser.add_argument("--markdown", action="store_true", help="Output Markdown only")
    parser.add_argument("--comment", action="store_true", help="Output bot comment only")
    
    args = parser.parse_args()
    
    root = pathlib.Path(args.out_dir)
    
    # Generate digest
    digest = generate_digest(root, args.days)
    
    if args.json:
        print(json.dumps(digest, indent=2))
        return
    
    if args.markdown:
        print(generate_markdown(digest))
        return
    
    if args.comment:
        print(generate_bot_comment(digest))
        return
    
    # Default: write all outputs
    json_path = root / DIGEST_FILENAME
    md_path = root / DIGEST_MD_FILENAME
    
    # Ensure directory exists
    root.mkdir(parents=True, exist_ok=True)
    
    # Write JSON
    json_path.write_text(json.dumps(digest, indent=2))
    print(f"Wrote: {json_path}")
    
    # Write Markdown
    md_path.write_text(generate_markdown(digest))
    print(f"Wrote: {md_path}")
    
    # Print summary
    print()
    print(f"=== Digest Summary ===")
    print(f"Health: {digest['health_score']['emoji']} {digest['health_score']['score']}/100")
    print(f"Events: {digest['summary']['events_this_period']}")
    print(f"Open PRs: {digest['summary']['open_prs']}")


if __name__ == "__main__":
    main()
