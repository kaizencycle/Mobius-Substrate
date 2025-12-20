/**
 * Mobius Divergence Dashboard UI
 * 
 * Reads data.json and renders a filterable, sortable table of open PRs
 * with divergence severity, EPICON status, merge gate status, and more.
 */

const SEV_ORDER = { high: 0, medium: 1, low: 2, unknown: 3 };
const SEV_ICONS = { high: "🔴", medium: "🟡", low: "🟢", unknown: "⚪" };

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function pill(text, cls) {
  return `<span class="pill ${cls || ""}">${escapeHtml(text)}</span>`;
}

function labelPill(text) {
  return `<span class="pill label-pill">${escapeHtml(text)}</span>`;
}

function checkIcon(conclusion) {
  if (conclusion === "success") return `<span class="check-ok">✓ success</span>`;
  if (conclusion === "failure") return `<span class="check-bad">✗ failure</span>`;
  return `<span class="check-unknown">? ${escapeHtml(conclusion || "unknown")}</span>`;
}

function formatDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function hasLabel(labels, target) {
  return (labels || []).includes(target);
}

function getScopeLabel(labels) {
  const scopes = ["scope:docs", "scope:ci", "scope:core", "scope:infra", "scope:sentinels", "scope:labs", "scope:specs"];
  for (const s of scopes) {
    if (hasLabel(labels, s)) return s;
  }
  return "none";
}

function matchQuery(item, q) {
  if (!q) return true;
  const hay = [
    item.title,
    item.author,
    (item.labels || []).join(" "),
    item.mode,
    item.severity,
  ].join(" ").toLowerCase();
  return hay.includes(q.toLowerCase());
}

function applyFilters(items) {
  const sev = document.getElementById("severity").value;
  const mode = document.getElementById("mode").value;
  const scope = document.getElementById("scope").value;
  const epicon = document.getElementById("epicon").value;
  const gate = document.getElementById("gate").value;
  const q = document.getElementById("q").value.trim();

  return items.filter(it => {
    if (sev !== "all" && (it.severity || "unknown") !== sev) return false;
    if (mode !== "all" && (it.mode || "normal") !== mode) return false;

    const s = getScopeLabel(it.labels);
    if (scope !== "all" && s !== scope) return false;

    const ep = it.checks?.epicon || "unknown";
    const ga = it.checks?.merge_gate || "unknown";
    if (epicon !== "all" && ep !== epicon) return false;
    if (gate !== "all" && ga !== gate) return false;

    if (!matchQuery(it, q)) return false;

    return true;
  });
}

function sortItems(items) {
  const mode = document.getElementById("sort").value;

  const byUpdated = (a, b) => {
    const ta = Date.parse(a.updated_at || 0) || 0;
    const tb = Date.parse(b.updated_at || 0) || 0;
    return ta - tb;
  };

  const byPr = (a, b) => (a.pr || 0) - (b.pr || 0);

  if (mode === "updated_desc") return [...items].sort((a, b) => byUpdated(b, a));
  if (mode === "updated_asc") return [...items].sort(byUpdated);
  if (mode === "pr_desc") return [...items].sort((a, b) => byPr(b, a));
  if (mode === "pr_asc") return [...items].sort(byPr);

  // Default: severity then PR #
  return [...items].sort((a, b) => {
    const sa = SEV_ORDER[a.severity || "unknown"] ?? 9;
    const sb = SEV_ORDER[b.severity || "unknown"] ?? 9;
    if (sa !== sb) return sa - sb;
    return byPr(a, b);
  });
}

function renderSummary(data) {
  const summary = document.getElementById("summary");
  const bySev = data.by_severity || {};
  
  summary.innerHTML = `
    <div class="summary-card">
      <div class="number">${data.open_pr_count || 0}</div>
      <div class="label">Open PRs</div>
    </div>
    <div class="summary-card">
      <div class="number" style="color: var(--bad)">${bySev.high || 0}</div>
      <div class="label">🔴 High</div>
    </div>
    <div class="summary-card">
      <div class="number" style="color: var(--warn)">${bySev.medium || 0}</div>
      <div class="label">🟡 Medium</div>
    </div>
    <div class="summary-card">
      <div class="number" style="color: var(--ok)">${bySev.low || 0}</div>
      <div class="label">🟢 Low</div>
    </div>
    <div class="summary-card">
      <div class="number">${data.emergency_count || 0}</div>
      <div class="label">🚨 Emergency</div>
    </div>
  `;
}

function render(items) {
  const tbody = document.getElementById("rows");
  const counts = document.getElementById("counts");

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty">No matching PRs</td></tr>`;
    counts.textContent = "0 results";
    return;
  }

  counts.textContent = `${items.length} result${items.length === 1 ? "" : "s"}`;

  tbody.innerHTML = items.map(it => {
    const sev = it.severity || "unknown";
    const sevIcon = SEV_ICONS[sev] || "⚪";
    const sevCls = `sev-${sev}`;
    
    const prLink = `<a href="${escapeHtml(it.url)}" target="_blank" rel="noopener">#${it.pr}</a>`;
    
    const title = `
      <div class="pr-title">${escapeHtml(it.title || "")}</div>
      <div class="pr-author">by @${escapeHtml(it.author || "")}</div>
    `;

    const ep = checkIcon(it.checks?.epicon);
    const ga = checkIcon(it.checks?.merge_gate);

    const mode = it.mode || "normal";
    const modePill = mode === "emergency" 
      ? pill("🚨 emergency", "sev-high") 
      : `<span class="small">normal</span>`;

    const labelPills = (it.labels || [])
      .slice(0, 5)
      .map(l => labelPill(l))
      .join("");
    const moreLabels = (it.labels || []).length > 5 
      ? `<span class="small"> +${it.labels.length - 5}</span>` 
      : "";

    const updated = formatDate(it.updated_at);

    return `
      <tr>
        <td class="nowrap">${pill(`${sevIcon} ${sev}`, sevCls)}</td>
        <td class="nowrap">${prLink}</td>
        <td>${title}</td>
        <td class="nowrap">${ep}</td>
        <td class="nowrap">${ga}</td>
        <td class="nowrap">${modePill}</td>
        <td><div class="labels">${labelPills}${moreLabels}</div></td>
        <td class="nowrap right"><span class="small">${updated}</span></td>
      </tr>
    `;
  }).join("");
}

async function boot() {
  const metaDiv = document.getElementById("meta");
  
  try {
    const res = await fetch("./data.json", { cache: "no-store" });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    const data = await res.json();

    // Update meta
    metaDiv.innerHTML = `
      <span class="meta-badge">repo: ${escapeHtml(data.repo || "")}</span>
      <span class="meta-badge">generated: ${formatDate(data.generated_at)}</span>
    `;

    // Render summary cards
    renderSummary(data);

    const all = data.items || [];

    const rerender = () => {
      const filtered = applyFilters(all);
      const sorted = sortItems(filtered);
      render(sorted);
    };

    // Attach event listeners
    ["severity", "mode", "scope", "epicon", "gate", "sort", "q"].forEach(id => {
      const el = document.getElementById(id);
      el.addEventListener("input", rerender);
      el.addEventListener("change", rerender);
    });

    document.getElementById("reset").addEventListener("click", () => {
      document.getElementById("severity").value = "all";
      document.getElementById("mode").value = "all";
      document.getElementById("scope").value = "all";
      document.getElementById("epicon").value = "all";
      document.getElementById("gate").value = "all";
      document.getElementById("sort").value = "sev_then_pr";
      document.getElementById("q").value = "";
      rerender();
    });

    // Initial render
    rerender();

  } catch (e) {
    console.error("Failed to load dashboard:", e);
    metaDiv.textContent = "Failed to load data.json";
    document.getElementById("rows").innerHTML = `
      <tr><td colspan="8" class="empty" style="color: var(--bad)">
        Error loading dashboard data. Run the dashboard generator workflow first.
      </td></tr>
    `;
  }
}

// Boot on load
boot();
