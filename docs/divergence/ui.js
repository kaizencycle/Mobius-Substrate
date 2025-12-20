/**
 * Mobius Divergence Dashboard UI
 * 
 * Features:
 * - Filterable, sortable PR table
 * - Timeline chart with trend lines
 * - Events table with PR links
 * - Event markers pinned to series heights
 */

const SEV_ORDER = { high: 0, medium: 1, low: 2, unknown: 3 };
const SEV_ICONS = { high: "🔴", medium: "🟡", low: "🟢", unknown: "⚪" };

// Chart colors
const COLORS = {
  open: "#3b82f6",    // blue
  high: "#dc2626",    // red
  medium: "#ca8a04",  // amber
  low: "#16a34a",     // green
  axis: "#999",
  marker: "#111"
};

// ============================================
// Utility Functions
// ============================================

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

function formatDateTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleString("en-US", { 
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });
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

function shortType(t) {
  return (t || "").replace(/_/g, " ");
}

// ============================================
// Chart Helpers
// ============================================

function polyline(points) {
  return points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

function scaleSeries(values, x0, y0, w, h, maxV) {
  if (maxV === 0) maxV = 1;
  return values.map((v, i) => ({
    x: x0 + (w * (values.length === 1 ? 0 : i / (values.length - 1))),
    y: y0 + (h * (1 - (v / maxV))),
    value: v
  }));
}

function getYForValue(value, y0, h, maxV) {
  if (maxV === 0) maxV = 1;
  return y0 + (h * (1 - (value / maxV)));
}

// ============================================
// PR Table Functions
// ============================================

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

function renderPRTable(items) {
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

// ============================================
// Timeline Chart
// ============================================

async function loadTimeline() {
  const meta = document.getElementById("timelineMeta");
  const tbody = document.getElementById("timelineRows");
  const svg = document.getElementById("timelineChart");
  const legendDiv = document.getElementById("legend");

  try {
    const res = await fetch("./history/index.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const hist = await res.json();
    const tl = hist.timeline || [];

    if (!tl.length) {
      meta.textContent = "No timeline data yet. Run the dashboard generator.";
      tbody.innerHTML = `<tr><td colspan="6" class="empty">No snapshots yet.</td></tr>`;
      svg.innerHTML = "";
      return { timeline: [], chartData: null };
    }

    // Use last 30 points for display
    const last = tl.slice(-30);

    meta.textContent = `Showing last ${last.length} snapshots · updated: ${formatDateTime(hist.updated_at)}`;

    // Build table (newest first)
    tbody.innerHTML = last.slice().reverse().map(s => {
      const c = s.counts || {};
      return `
        <tr>
          <td class="small">${formatDateTime(s.generated_at)}</td>
          <td class="right">${s.open_pr_count ?? ""}</td>
          <td class="right">${c.high ?? 0}</td>
          <td class="right">${c.medium ?? 0}</td>
          <td class="right">${c.low ?? 0}</td>
          <td class="right">${c.unknown ?? 0}</td>
        </tr>
      `;
    }).join("");

    // Chart dimensions
    const W = 980, H = 200;
    const pad = { l: 50, r: 20, t: 20, b: 35 };
    const plotW = W - pad.l - pad.r;
    const plotH = H - pad.t - pad.b;

    // Extract series
    const open = last.map(s => s.open_pr_count || 0);
    const high = last.map(s => (s.counts?.high || 0));
    const med = last.map(s => (s.counts?.medium || 0));
    const low = last.map(s => (s.counts?.low || 0));
    const timestamps = last.map(s => s.generated_at || "");

    // Find max for scaling
    const maxV = Math.max(1, ...open, ...high, ...med, ...low);

    // Scale series
    const openPts = scaleSeries(open, pad.l, pad.t, plotW, plotH, maxV);
    const highPts = scaleSeries(high, pad.l, pad.t, plotW, plotH, maxV);
    const medPts = scaleSeries(med, pad.l, pad.t, plotW, plotH, maxV);
    const lowPts = scaleSeries(low, pad.l, pad.t, plotW, plotH, maxV);

    // Build chart SVG
    let chartSvg = "";

    // Grid lines
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = pad.t + (plotH * i / gridLines);
      const val = Math.round(maxV * (1 - i / gridLines));
      chartSvg += `<line x1="${pad.l}" y1="${y}" x2="${pad.l + plotW}" y2="${y}" stroke="#eee" stroke-width="1"/>`;
      chartSvg += `<text x="${pad.l - 8}" y="${y + 4}" font-size="10" fill="${COLORS.axis}" text-anchor="end">${val}</text>`;
    }

    // Axes
    chartSvg += `
      <line x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${pad.t + plotH}" stroke="${COLORS.axis}" stroke-width="1"/>
      <line x1="${pad.l}" y1="${pad.t + plotH}" x2="${pad.l + plotW}" y2="${pad.t + plotH}" stroke="${COLORS.axis}" stroke-width="1"/>
    `;

    // X-axis labels (first, middle, last)
    if (timestamps.length > 0) {
      const firstDate = timestamps[0].slice(5, 10);
      const lastDate = timestamps[timestamps.length - 1].slice(5, 10);
      chartSvg += `<text x="${pad.l}" y="${H - 8}" font-size="10" fill="${COLORS.axis}">${firstDate}</text>`;
      chartSvg += `<text x="${pad.l + plotW}" y="${H - 8}" font-size="10" fill="${COLORS.axis}" text-anchor="end">${lastDate}</text>`;
      if (timestamps.length > 2) {
        const midIdx = Math.floor(timestamps.length / 2);
        const midDate = timestamps[midIdx].slice(5, 10);
        const midX = openPts[midIdx].x;
        chartSvg += `<text x="${midX}" y="${H - 8}" font-size="10" fill="${COLORS.axis}" text-anchor="middle">${midDate}</text>`;
      }
    }

    // Draw lines
    chartSvg += `<polyline points="${polyline(openPts)}" fill="none" stroke="${COLORS.open}" stroke-width="2.5"/>`;
    chartSvg += `<polyline points="${polyline(highPts)}" fill="none" stroke="${COLORS.high}" stroke-width="2"/>`;
    chartSvg += `<polyline points="${polyline(medPts)}" fill="none" stroke="${COLORS.medium}" stroke-width="2"/>`;
    chartSvg += `<polyline points="${polyline(lowPts)}" fill="none" stroke="${COLORS.low}" stroke-width="2"/>`;

    // Draw dots at data points
    openPts.forEach(p => {
      chartSvg += `<circle cx="${p.x}" cy="${p.y}" r="3" fill="${COLORS.open}"/>`;
    });

    svg.innerHTML = chartSvg;

    // Legend
    legendDiv.innerHTML = `
      <div class="legend-item">
        <div class="legend-line" style="background: ${COLORS.open}"></div>
        <span>Open PRs</span>
      </div>
      <div class="legend-item">
        <div class="legend-line" style="background: ${COLORS.high}"></div>
        <span>High severity</span>
      </div>
      <div class="legend-item">
        <div class="legend-line" style="background: ${COLORS.medium}"></div>
        <span>Medium severity</span>
      </div>
      <div class="legend-item">
        <div class="legend-line" style="background: ${COLORS.low}"></div>
        <span>Low severity</span>
      </div>
    `;

    // Return data for event markers
    return {
      timeline: last,
      chartData: {
        timestamps,
        pad,
        plotW,
        plotH,
        maxV,
        highPts,
        medPts,
        lowPts,
        openPts
      }
    };

  } catch (e) {
    console.error("Failed to load timeline:", e);
    meta.textContent = "Failed to load timeline data.";
    tbody.innerHTML = `<tr><td colspan="6" class="empty" style="color: var(--bad)">Error loading history/index.json</td></tr>`;
    svg.innerHTML = "";
    return { timeline: [], chartData: null };
  }
}

// ============================================
// Events with Pinned Markers
// ============================================

async function loadEventsAndAnnotate(timelineData) {
  const meta = document.getElementById("eventsMeta");
  const tbody = document.getElementById("eventsRows");
  const svg = document.getElementById("timelineChart");

  const { timeline, chartData } = timelineData;

  try {
    const res = await fetch("./history/events.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const data = await res.json();
    const events = data.events || [];

    if (!events.length) {
      meta.textContent = "No events recorded yet.";
      tbody.innerHTML = `<tr><td colspan="4" class="empty">Events will appear here when PR status changes.</td></tr>`;
      return;
    }

    // Show last 50 events in table
    const displayEvents = events.slice(-50);
    meta.textContent = `Showing last ${displayEvents.length} event(s) · updated: ${formatDateTime(data.updated_at)}`;

    // Table (newest first)
    tbody.innerHTML = displayEvents.slice().reverse().map(ev => {
      const pr = ev.pr != null ? `#${ev.pr}` : "";
      const prLink = ev.url 
        ? `<a href="${escapeHtml(ev.url)}" target="_blank" rel="noopener">${escapeHtml(pr)}</a>` 
        : escapeHtml(pr);
      
      const typeClass = ev.type === "severity_flip" ? "sev-high" 
        : ev.type === "epicon_flip" ? "sev-medium"
        : ev.type === "gate_flip" ? "sev-medium"
        : "";
      
      return `
        <tr>
          <td class="small nowrap">${formatDateTime(ev.ts)}</td>
          <td class="small"><span class="pill ${typeClass}">${escapeHtml(shortType(ev.type))}</span></td>
          <td class="small">${prLink}</td>
          <td class="small">${escapeHtml(ev.detail || "")}</td>
        </tr>
      `;
    }).join("");

    // Add markers to chart if we have chart data
    if (!chartData || !timeline.length) return;

    const { timestamps, pad, plotW, plotH, maxV, highPts, medPts, lowPts } = chartData;

    // Map timestamp to index
    function nearestIndex(ts) {
      const idx = timestamps.indexOf(ts);
      if (idx >= 0) return idx;
      
      // Fallback: match by date-hour prefix
      const pref = (ts || "").slice(0, 13);
      for (let i = timestamps.length - 1; i >= 0; i--) {
        if ((timestamps[i] || "").startsWith(pref)) return i;
      }
      return timestamps.length - 1;
    }

    // Get x position for index
    function xForIndex(i) {
      if (timestamps.length <= 1) return pad.l;
      return pad.l + (plotW * i / (timestamps.length - 1));
    }

    // Determine which series the event relates to and get Y position
    function getMarkerY(ev, idx) {
      // For severity flips, pin to the severity line at the new value
      if (ev.type === "severity_flip") {
        const sev = ev.severity || "unknown";
        if (sev === "high" && highPts[idx]) return highPts[idx].y;
        if (sev === "medium" && medPts[idx]) return medPts[idx].y;
        if (sev === "low" && lowPts[idx]) return lowPts[idx].y;
      }
      
      // For EPICON/gate flips, pin to high line (these are important)
      if (ev.type === "epicon_flip" || ev.type === "gate_flip") {
        if (highPts[idx]) return highPts[idx].y;
        return pad.t + plotH * 0.3; // fallback to upper area
      }
      
      // For PR opened/closed, pin based on severity
      if (ev.type === "pr_opened" || ev.type === "pr_closed") {
        const sev = ev.severity || "unknown";
        if (sev === "high" && highPts[idx]) return highPts[idx].y;
        if (sev === "medium" && medPts[idx]) return medPts[idx].y;
        if (sev === "low" && lowPts[idx]) return lowPts[idx].y;
      }
      
      // Default: middle of chart
      return pad.t + plotH * 0.5;
    }

    // Get marker color based on event type
    function getMarkerColor(ev) {
      if (ev.type === "severity_flip") {
        const sev = ev.severity || "unknown";
        if (sev === "high") return COLORS.high;
        if (sev === "medium") return COLORS.medium;
        if (sev === "low") return COLORS.low;
      }
      if (ev.type === "epicon_flip") return ev.epicon === "failure" ? COLORS.high : COLORS.low;
      if (ev.type === "gate_flip") return ev.gate === "failure" ? COLORS.high : COLORS.low;
      if (ev.type === "pr_opened") return COLORS.open;
      if (ev.type === "pr_closed") return COLORS.axis;
      return COLORS.marker;
    }

    // Get marker shape based on event type
    function getMarkerShape(ev, x, y, color) {
      const r = 5;
      
      if (ev.type === "severity_flip") {
        // Diamond
        return `<polygon points="${x},${y-r} ${x+r},${y} ${x},${y+r} ${x-r},${y}" fill="white" stroke="${color}" stroke-width="2"/>`;
      }
      if (ev.type === "epicon_flip" || ev.type === "gate_flip") {
        // Triangle
        return `<polygon points="${x},${y-r} ${x+r},${y+r} ${x-r},${y+r}" fill="white" stroke="${color}" stroke-width="2"/>`;
      }
      if (ev.type === "pr_opened") {
        // Circle with plus
        return `
          <circle cx="${x}" cy="${y}" r="${r}" fill="white" stroke="${color}" stroke-width="2"/>
          <line x1="${x-3}" y1="${y}" x2="${x+3}" y2="${y}" stroke="${color}" stroke-width="1.5"/>
          <line x1="${x}" y1="${y-3}" x2="${x}" y2="${y+3}" stroke="${color}" stroke-width="1.5"/>
        `;
      }
      if (ev.type === "pr_closed") {
        // Circle with X
        return `
          <circle cx="${x}" cy="${y}" r="${r}" fill="white" stroke="${color}" stroke-width="2"/>
          <line x1="${x-2}" y1="${y-2}" x2="${x+2}" y2="${y+2}" stroke="${color}" stroke-width="1.5"/>
          <line x1="${x-2}" y1="${y+2}" x2="${x+2}" y2="${y-2}" stroke="${color}" stroke-width="1.5"/>
        `;
      }
      // Default circle
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="white" stroke="${color}" stroke-width="2"/>`;
    }

    // Build markers (last 20 events only to avoid clutter)
    const recentEvents = events.slice(-20);
    let markersHtml = "";

    recentEvents.forEach(ev => {
      const idx = nearestIndex(ev.ts);
      const x = xForIndex(idx);
      const y = getMarkerY(ev, idx);
      const color = getMarkerColor(ev);
      
      const title = `${formatDateTime(ev.ts)}\n${shortType(ev.type)}\n#${ev.pr}: ${ev.detail}`;
      
      // Draw stem line from marker to x-axis
      markersHtml += `<line x1="${x}" y1="${y}" x2="${x}" y2="${pad.t + plotH}" stroke="${color}" stroke-width="1" stroke-dasharray="2 2" opacity="0.5"/>`;
      
      // Draw marker
      markersHtml += `
        <g class="event-marker" style="cursor: pointer;">
          ${getMarkerShape(ev, x, y, color)}
          <title>${escapeHtml(title)}</title>
        </g>
      `;
    });

    svg.insertAdjacentHTML("beforeend", markersHtml);

  } catch (e) {
    console.error("Failed to load events:", e);
    meta.textContent = "Failed to load events.";
    tbody.innerHTML = `<tr><td colspan="4" class="empty" style="color: var(--bad)">Error loading history/events.json</td></tr>`;
  }
}

// ============================================
// Main Boot
// ============================================

async function boot() {
  const metaDiv = document.getElementById("meta");
  
  try {
    // Load PR data
    const res = await fetch("./data.json", { cache: "no-store" });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    const data = await res.json();

    // Update meta
    metaDiv.innerHTML = `
      <span class="meta-badge">repo: ${escapeHtml(data.repo || "")}</span>
      <span class="meta-badge">generated: ${formatDateTime(data.generated_at)}</span>
    `;

    // Render summary cards
    renderSummary(data);

    const all = data.items || [];

    const rerender = () => {
      const filtered = applyFilters(all);
      const sorted = sortItems(filtered);
      renderPRTable(sorted);
    };

    // Attach filter event listeners
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

    // Load timeline and events
    const timelineData = await loadTimeline();
    await loadEventsAndAnnotate(timelineData);

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
