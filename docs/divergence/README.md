# Divergence Dashboard

This dashboard is the public legibility layer for Mobius PR integrity.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Interactive HTML dashboard with filters |
| `ui.js` | JavaScript for filtering and sorting |
| `data.json` | Machine-readable PR data (auto-generated) |
| `dashboard.md` | Markdown summary (auto-generated) |

## How It Works

1. **Generator runs** every 6 hours (or on push to main)
2. **Fetches open PRs** from the repository
3. **Extracts** severity, EPICON status, merge gate status from bot comments and check runs
4. **Writes** `data.json` and `dashboard.md`
5. **Static UI** reads `data.json` and renders filterable table

## Filters

- **Severity**: high / medium / low / unknown
- **Mode**: normal / emergency
- **Scope**: docs / ci / core / infra / sentinels / labs / specs
- **EPICON**: success / failure / unknown
- **Merge Gate**: success / failure / unknown
- **Search**: free-text across title, author, labels

## GitHub Pages

To serve this dashboard:

1. Go to **Settings → Pages**
2. Set **Source**: Deploy from branch
3. Set **Branch**: main, folder: `/docs`
4. Dashboard URL: `https://<org>.github.io/<repo>/divergence/`

## Philosophy

> **Divergence is not moral judgment.**  
> **It is structural visibility: does behavior match published intent?**

The dashboard doesn't punish divergence — it makes it observable. This allows the community to:

- Triage PRs by severity
- Identify emergency mode usage
- Track transparency debt
- Verify scope containment

---

*Reference: [EPICON-02 Specification](../epicon/EPICON-02.md)*
