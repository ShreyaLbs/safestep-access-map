/**
 * SafeStep — app.js
 * Core application logic: map init, pin rendering, urgency scoring,
 * add-report flow, confirm, resolve, CSV export.
 */

/* ─── Constants & Config ──────────────────────────────────────────── */
const MAP_CENTER = [8.5241, 76.9366]; // Thiruvananthapuram city center
const MAP_ZOOM = 14;
const LS_KEY = "safestep_user_reports";

// Urgency formula weights
const SEV_WEIGHT = { high: 3, medium: 2, low: 1 };
const RECENCY_MAX_BOOST = 15; // max bonus for a brand-new report
const RECENCY_HALF_LIFE_DAYS = 7; // boost halves every 7 days
const RESOLVED_PENALTY = 100;

/* ─── Issue Types ─────────────────────────────────────────────────── */
const ISSUE_TYPES = [
  { value: "broken_ramp",       label: "Broken / Missing Ramp",             label_ml: "\u0D24\u0D15\u0D7C\u0D28\u0D4D\u0D28 / \u0D07\u0D32\u0D4D\u0D32\u0D3E\u0D24\u0D4D\u0D24 \u0D31\u0D3E\u0D02\u0D2A\u0D4D", label_ml_short: "\u0D24\u0D15\u0D7C\u0D28\u0D4D\u0D28 \u0D31\u0D3E\u0D02\u0D2A\u0D4D", icon: "\u267F" },
  { value: "poor_lighting",      label: "Poor or No Lighting",              label_ml: "\u0D35\u0D46\u0D33\u0D3F\u0D1A\u0D4D\u0D1A\u0D15\u0D4D\u0D15\u0D41\u0D31\u0D35\u0D4D \u0D05\u0D32\u0D4D\u0D32\u0D46\u0D19\u0D4D\u0D15\u0D3F\u0D7D \u0D35\u0D46\u0D33\u0D3F\u0D1A\u0D4D\u0D1A\u0D2E\u0D3F\u0D32\u0D4D\u0D32\u0D3E\u0D2F\u0D4D\u0D2E", label_ml_short: "\u0D35\u0D46\u0D33\u0D3F\u0D1A\u0D4D\u0D1A\u0D15\u0D4D\u0D15\u0D41\u0D31\u0D35\u0D4D", icon: "\uD83D\uDCA1" },
  { value: "unsafe_crossing",    label: "Unsafe Road Crossing",            label_ml: "\u0D38\u0D41\u0D30\u0D15\u0D4D\u0D37\u0D3F\u0D24\u0D2E\u0D32\u0D4D\u0D32\u0D3E\u0D24\u0D4D\u0D24 \u0D31\u0D4B\u0D21\u0D4D \u0D15\u0D4D\u0D30\u0D4B\u0D38\u0D3F\u0D02\u0D17\u0D4D", label_ml_short: "\u0D38\u0D41\u0D30\u0D15\u0D4D\u0D37\u0D3F\u0D24\u0D2E\u0D32\u0D4D\u0D32\u0D3E\u0D24\u0D4D\u0D24 \u0D15\u0D4D\u0D30\u0D4B\u0D38\u0D3F\u0D02\u0D17\u0D4D", icon: "\uD83D\uDEB6" },
  { value: "no_braille",         label: "Missing Braille / Tactile Signage",label_ml: "\u0D2C\u0D4D\u0D30\u0D46\u0D2F\u0D3F\u0D32\u0D3F / \u0D38\u0D4D\u0D2A\u0D7C\u0D36\u0D28 \u0D2C\u0D4B\u0D7C\u0D21\u0D4D\u0D15\u0D7E \u0D07\u0D32\u0D4D\u0D32", label_ml_short: "\u0D2C\u0D4D\u0D30\u0D46\u0D2F\u0D3F\u0D32\u0D3F \u0D07\u0D32\u0D4D\u0D32", icon: "\uD83D\uDC41" },
  { value: "missing_gnwashroom", label: "No Gender-Neutral Washroom",       label_ml: "\u0D32\u0D3F\u0D02\u0D17\u0D2D\u0D47\u0D26\u0D2E\u0D3F\u0D32\u0D4D\u0D32\u0D3E\u0D24\u0D4D\u0D24 \u0D35\u0D3E\u0D37\u0D4D\u200C\u0D31\u0D42\u0D02 \u0D07\u0D32\u0D4D\u0D32", label_ml_short: "\u0D35\u0D3E\u0D37\u0D4D\u200C\u0D31\u0D42\u0D02 \u0D07\u0D32\u0D4D\u0D32", icon: "\uD83D\uDEBB" },
  { value: "uneven_surface",     label: "Uneven / Broken Surface",          label_ml: "\u0D05\u0D38\u0D2E\u0D2E\u0D3E\u0D2F / \u0D24\u0D15\u0D7C\u0D28\u0D4D\u0D28 \u0D2A\u0D4D\u0D30\u0D24\u0D32\u0D02", label_ml_short: "\u0D24\u0D15\u0D7C\u0D28\u0D4D\u0D28 \u0D2A\u0D4D\u0D30\u0D24\u0D32\u0D02", icon: "\u26A0" },
  { value: "confusing_signage",  label: "Confusing / Inaccessible Signage", label_ml: "\u0D06\u0D36\u0D2F\u0D15\u0D4D\u0D15\u0D4D\u0D34\u0D2A\u0D4D\u0D2A\u0D2E\u0D41\u0D23\u0D4D\u0D1F\u0D3E\u0D15\u0D4D\u0D15\u0D41\u0D28\u0D4D\u0D28 / \u0D05\u0D2A\u0D4D\u0D30\u0D3E\u0D2A\u0D4D\u0D2F\u0D2E\u0D3E\u0D2F \u0D2C\u0D4B\u0D7C\u0D21\u0D4D\u0D15\u0D7E", label_ml_short: "\u0D05\u0D2A\u0D4D\u0D30\u0D3E\u0D2A\u0D4D\u0D2F\u0D2E\u0D3E\u0D2F \u0D2C\u0D4B\u0D7C\u0D21\u0D4D\u0D15\u0D7E", icon: "\uD83D\uDDFA" },
  { value: "other",              label: "Other Barrier",                    label_ml: "\u0D2E\u0D31\u0D4D\u0D31\u0D41 \u0D24\u0D1F\u0D38\u0D4D\u0D38\u0D19\u0D4D\u0D19\u0D7E", label_ml_short: "\u0D2E\u0D31\u0D4D\u0D31\u0D41 \u0D24\u0D1F\u0D38\u0D4D\u0D38\u0D19\u0D4D\u0D19\u0D7E", icon: "\uD83D\uDCCD" },
];

function getIssueType(value) {
  return ISSUE_TYPES.find((t) => t.value === value) || ISSUE_TYPES[ISSUE_TYPES.length - 1];
}

/* ─── Urgency Score ───────────────────────────────────────────────── */
function computeUrgency(report) {
  if (report.resolved) {
    return -RESOLVED_PENALTY;
  }
  const severityWeight = SEV_WEIGHT[report.severity] || 1;
  const ageMs = Date.now() - new Date(report.timestamp).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  const recencyBoost =
    RECENCY_MAX_BOOST * Math.pow(0.5, ageDays / RECENCY_HALF_LIFE_DAYS);
  return Math.round(
    severityWeight * (report.confirmations || 0) + recencyBoost
  );
}

function getScoreClass(report) {
  if (report.resolved) return "score-resolved";
  if (report.severity === "high") return "score-high";
  if (report.severity === "medium") return "score-medium";
  return "score-low";
}

/* ─── Local Storage Helpers ───────────────────────────────────────── */
function loadUserReports() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUserReports(reports) {
  const userReports = reports.filter((r) => !r.id.startsWith("seed-"));
  localStorage.setItem(LS_KEY, JSON.stringify(userReports));
}

/* ─── State ─────────────────────────────────────────────────────── */
let allReports = [];
let leafletMap = null;
let markersMap = {}; // id → Leaflet marker
let pendingCoords = null; // lat/lng for add-report form

// Heatmap state
let heatmapLayer = null;
let isHeatmapActive = false;

// Active filter state — never mutates allReports
let activeFilters = { severity: "all", type: "all" };

// Language state
let currentLang = "en";

const TRANSLATIONS = {
  en: {
    brand_sub: "Access & Safety Map",
    btn_report: "Report an issue",
    btn_report_aria: "Report a new accessibility or safety issue",
    btn_download: "Download report",
    btn_download_aria: "Download all reports as a CSV file",
    map_hint: "Click map to pin an issue",
    filter_severity: "Severity",
    filter_all: "All",
    sev_high: "High",
    sev_medium: "Medium",
    sev_low: "Low",
    sev_resolved: "Resolved",
    filter_type: "Type",
    filter_all_types: "All types",
    filter_clear: "✖ Clear filters",
    stat_total: "Total",
    stat_impact: "Community impact",
    panel_priority: "Priority Ranking",
    export_label: "Civic export",
    export_desc: "All reports, sorted by urgency — ready for a campus or city office.",
    modal_title: "Report an issue",
    modal_reporting_at: "Reporting at:",
    form_type_label: "Issue type",
    form_desc_label: "Description",
    form_desc_placeholder: "Describe what you observed — be as specific as possible (e.g. 'ramp is cracked and rises 8 cm above the footpath').",
    form_sev_label: "Severity",
    sev_low_opt: "Low — an inconvenience, but manageable",
    sev_medium_opt: "Medium — significantly limits access",
    sev_high_opt: "High — blocks access or poses safety risk",
    btn_cancel: "Cancel",
    btn_add_report: "Add report",
    empty_filter: "No issues match these filters — try clearing them",
    empty_initial: "No reports yet — be the first to flag an issue."
  },
  ml: {
    brand_sub: "പ്രവേശന-സുരക്ഷാ മാപ്പ്",
    btn_report: "പ്രശ്നം റിപ്പോർട്ട് ചെയ്യുക",
    btn_report_aria: "ഒരു പുതിയ സുരക്ഷാ പ്രശ്നം റിപ്പോർട്ട് ചെയ്യുക",
    btn_download: "റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യുക",
    btn_download_aria: "എല്ലാ റിപ്പോർട്ടുകളും CSV ആയി ഡൗൺലോഡ് ചെയ്യുക",
    map_hint: "പ്രശ്നം പിൻ ചെയ്യാൻ മാപ്പിൽ ക്ലിക്ക് ചെയ്യുക",
    filter_severity: "തീവ്രത",
    filter_all: "എല്ലാം",
    sev_high: "ഉയർന്നത്",
    sev_medium: "ഇടത്തരം",
    sev_low: "കുറഞ്ഞത്",
    sev_resolved: "പരിഹരിച്ചത്",
    filter_type: "തരം",
    filter_all_types: "എല്ലാ തരങ്ങളും",
    filter_clear: "✖ ഫിൽറ്ററുകൾ മായ്ക്കുക",
    stat_total: "ആകെ",
    stat_impact: "കമ്മ്യൂണിറ്റി സ്വാധീനം",
    panel_priority: "മുൻഗണനാ റാങ്കിംഗ്",
    export_label: "സിവിക് എക്സ്പോർട്ട്",
    export_desc: "എല്ലാ റിപ്പോർട്ടുകളും അടിയന്തര പ്രാധാന്യമനുസരിച്ച് തരംതിരിച്ചിരിക്കുന്നു — ക്യാമ്പസ് അല്ലെങ്കിൽ സിറ്റി ഓഫീസിനായി തയ്യാറാണ്.",
    modal_title: "പ്രശ്നം റിപ്പോർട്ട് ചെയ്യുക",
    modal_reporting_at: "റിപ്പോർട്ട് ചെയ്യുന്ന സ്ഥലം:",
    form_type_label: "പ്രശ്നത്തിന്റെ തരം",
    form_desc_label: "വിവരണം",
    form_desc_placeholder: "നിങ്ങൾ കണ്ടത് വിവരിക്കുക — കഴിയുന്നത്ര വ്യക്തമായിരിക്കുക.",
    form_sev_label: "തീവ്രത",
    sev_low_opt: "കുറഞ്ഞത് — അസൗകര്യം, എന്നാൽ കൈകാര്യം ചെയ്യാവുന്നത",
    sev_medium_opt: "ഇടത്തരം — പ്രവേശനത്തെ ഗണ്യമായി പരിമിതപ്പെടുത്തുന്നു",
    sev_high_opt: "ഉയർന്നത് — പ്രവേശനം തടയുന്നു അല്ലെങ്കിൽ സുരക്ഷാ അപകടമുണ്ടാക്കുന്നു",
    btn_cancel: "റദ്ദാക്കുക",
    btn_add_report: "റിപ്പോർട്ട് ചേർക്കുക",
    empty_filter: "ഈ ഫിൽറ്ററുകളുമായി പൊരുത്തപ്പെടുന്ന പ്രശ്നങ്ങളൊന്നുമില്ല — അവ മായ്ക്കാൻ ശ്രമിക്കുക",
    empty_initial: "ഇതുവരെ റിപ്പോർട്ടുകളൊന്നുമില്ല — ഒരു പ്രശ്നം ആദ്യം ഫ്ലാഗ് ചെയ്യുക."
  }
};

function applyTranslations() {
  const dict = TRANSLATIONS[currentLang];
  
  // Scope layout adjustments for Malayalam text
  document.body.classList.toggle("lang-ml", currentLang === "ml");

  // Text content
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });

  // ARIA labels
  document.querySelectorAll("[data-i18n-aria]").forEach(el => {
    const key = el.getAttribute("data-i18n-aria");
    if (dict[key]) el.setAttribute("aria-label", dict[key]);
  });

  // Placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key]) el.setAttribute("placeholder", dict[key]);
  });

  // Update language toggle button text
  const langBtn = document.getElementById("btn-lang");
  if (langBtn) {
    langBtn.textContent = currentLang === "en" ? "EN / മ" : "മ / EN";
  }

  // Re-render dynamic lists with translated issue types
  buildReportFormTypes();
  buildTypeFilterPills();
  
  // Force active filter pills to maintain active visual state
  document.querySelectorAll(".filter-pill").forEach(p => {
    const dim = p.dataset.filter;
    const val = p.dataset.value;
    if (dim && val) {
      const isActive = activeFilters[dim] === val;
      p.classList.toggle("active", isActive);
      p.setAttribute("aria-pressed", String(isActive));
    }
  });

  renderUrgencyList(false, getFilteredReports());
}

function toggleLanguage() {
  currentLang = currentLang === "en" ? "ml" : "en";
  applyTranslations();
}

/* ─── Initialize App ──────────────────────────────────────────────── */
function init() {
  // Merge seed + user-added
  const userReports = loadUserReports();
  allReports = [...SEED_REPORTS, ...userReports];

  // Compute initial urgency scores
  allReports.forEach((r) => {
    r._urgency = computeUrgency(r);
  });

  initMap();
  renderUrgencyList();
  updateStats();
  buildReportFormTypes();
  buildTypeFilterPills(); // inject type pills from ISSUE_TYPES

  // UI events
  document
    .getElementById("btn-add-report-header")
    .addEventListener("click", () => openAddReportModal(MAP_CENTER));

  document
    .getElementById("btn-lang")
    .addEventListener("click", toggleLanguage);

  document
    .getElementById("btn-download")
    .addEventListener("click", exportCSV);

  document
    .getElementById("btn-download-header")
    .addEventListener("click", exportCSV);

  document
    .getElementById("heatmap-toggle")
    .addEventListener("click", toggleHeatmap);

  document
    .getElementById("modal-close")
    .addEventListener("click", closeModal);

  document
    .getElementById("modal-overlay")
    .addEventListener("click", (e) => {
      if (e.target === document.getElementById("modal-overlay")) closeModal();
    });

  document
    .getElementById("report-form")
    .addEventListener("submit", handleAddReport);

  // Filter bar: delegate all pill clicks via the bar container
  document.getElementById("filter-bar").addEventListener("click", (e) => {
    const pill = e.target.closest(".filter-pill");
    if (!pill) return;
    const dim = pill.dataset.filter;   // "severity" | "type"
    const val = pill.dataset.value;
    if (!dim || !val) return;

    // Update state
    activeFilters[dim] = val;

    // Update pill active classes within this group only
    pill.closest(".filter-pills")
      .querySelectorAll(".filter-pill")
      .forEach((p) => {
        const isActive = p.dataset.value === val;
        p.classList.toggle("active", isActive);
        p.setAttribute("aria-pressed", String(isActive));
      });

    // Show/hide clear button
    const isFiltered =
      activeFilters.severity !== "all" || activeFilters.type !== "all";
    document.getElementById("filter-clear").hidden = !isFiltered;

    applyFilters();
  });

  // Clear all filters
  document.getElementById("filter-clear").addEventListener("click", () => {
    activeFilters = { severity: "all", type: "all" };
    document.querySelectorAll(".filter-pill").forEach((p) => {
      const isAll = p.dataset.value === "all";
      p.classList.toggle("active", isAll);
      p.setAttribute("aria-pressed", String(isAll));
    });
    document.getElementById("filter-clear").hidden = true;
    applyFilters();
  });

  // Formula info tooltip
  const infoBtn = document.getElementById("formula-info-btn");
  const formulaTooltip = document.getElementById("formula-tooltip");

  infoBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const rect = infoBtn.getBoundingClientRect();
    formulaTooltip.style.top = rect.bottom + 8 + "px";
    formulaTooltip.style.left = Math.max(8, rect.left - 260) + "px";
    formulaTooltip.classList.toggle("visible");
  });

  document.addEventListener("click", () => {
    formulaTooltip.classList.remove("visible");
  });

  formulaTooltip.addEventListener("click", (e) => e.stopPropagation());

  // Keyboard escape closes modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      formulaTooltip.classList.remove("visible");
    }
  });
}

/* ─── Filter Helpers ──────────────────────────────────────────────── */

/** Injects one pill per ISSUE_TYPE into #type-filter-pills */
function buildTypeFilterPills() {
  const container = document.getElementById("type-filter-pills");
  
  // Keep the first child ("All types" button) and remove the rest
  while (container.children.length > 1) {
    container.removeChild(container.lastChild);
  }

  ISSUE_TYPES.forEach((t) => {
    const btn = document.createElement("button");
    btn.className = "filter-pill";
    btn.dataset.filter = "type";
    btn.dataset.value = t.value;
    btn.setAttribute("aria-pressed", "false");
    
    // Short label logic depending on language
    const textLabel = currentLang === "ml" 
      ? (t.label_ml_short || t.label_ml) 
      : t.label.split(" / ")[0].split(" ").slice(0, 2).join(" ");
      
    btn.textContent = `${t.icon} ${textLabel}`;
    container.appendChild(btn);
  });
}

/**
 * Returns allReports filtered by activeFilters.
 * Never mutates allReports.
 */
function getFilteredReports() {
  return allReports.filter((r) => {
    // Severity dimension
    if (activeFilters.severity !== "all") {
      if (activeFilters.severity === "resolved") {
        if (!r.resolved) return false;
      } else {
        // Exclude resolved reports when a specific non-resolved severity is selected
        if (r.resolved) return false;
        if (r.severity !== activeFilters.severity) return false;
      }
    }
    // Type dimension
    if (activeFilters.type !== "all" && r.type !== activeFilters.type) {
      return false;
    }
    return true;
  });
}

/**
 * Applies current filters: updates map marker visibility + urgency list.
 * Data is never deleted — non-matching markers are just removed from the map layer.
 */
function applyFilters() {
  const filtered = getFilteredReports();
  const filteredIds = new Set(filtered.map((r) => r.id));

  if (isHeatmapActive) {
    // Hide all normal pins
    Object.values(markersMap).forEach(marker => {
      if (leafletMap.hasLayer(marker)) marker.remove();
    });
    // Update heatmap
    renderHeatmap(filtered);
  } else {
    // Show/hide markers normally
    Object.entries(markersMap).forEach(([id, marker]) => {
      if (filteredIds.has(id)) {
        if (!leafletMap.hasLayer(marker)) marker.addTo(leafletMap);
      } else {
        if (leafletMap.hasLayer(marker)) marker.remove();
      }
    });
    // Ensure heatmap is removed
    if (heatmapLayer && leafletMap.hasLayer(heatmapLayer)) {
      heatmapLayer.remove();
    }
  }

  // Re-render urgency list with only filtered items
  renderUrgencyList(true, filtered);
}

/* ─── Heatmap ─────────────────────────────────────────────────────── */
function toggleHeatmap() {
  isHeatmapActive = !isHeatmapActive;
  
  const btn = document.getElementById("heatmap-toggle");
  if (btn) {
    btn.setAttribute("aria-pressed", String(isHeatmapActive));
    btn.classList.toggle("active", isHeatmapActive);
  }

  applyFilters();
}

function renderHeatmap(reports) {
  if (heatmapLayer && leafletMap.hasLayer(heatmapLayer)) {
    leafletMap.removeLayer(heatmapLayer);
  }
  
  const heatPoints = reports.map(r => {
    let intensity = 1;
    if (r.severity === "high") intensity = 3;
    else if (r.severity === "medium") intensity = 2;
    if (r.resolved) intensity = 0.5; 
    return [r.lat, r.lng, intensity];
  });
  
  // Create and add the heat layer (radius and blur tuned for city-level view)
  heatmapLayer = L.heatLayer(heatPoints, { 
    radius: 25, 
    blur: 15, 
    maxZoom: 17 
  }).addTo(leafletMap);
}

/* ─── Map ─────────────────────────────────────────────────────────── */
function initMap() {
  const loader = document.getElementById("map-loader");

  leafletMap = L.map("map", {
    center: MAP_CENTER,
    zoom: MAP_ZOOM,
    zoomControl: false,
  });

  // Zoom control placement — top-right, away from our panel
  L.control.zoom({ position: "topright" }).addTo(leafletMap);

  // OpenStreetMap tiles — no API key
  const tileLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }
  );

  tileLayer.addTo(leafletMap);

  tileLayer.on("load", () => {
    loader.classList.add("hidden");
  });

  // Fallback: hide loader after 4s regardless
  setTimeout(() => loader.classList.add("hidden"), 4000);

  // Click-to-add hint
  const hint = document.getElementById("map-hint");
  leafletMap.on("click", (e) => {
    pendingCoords = [e.latlng.lat, e.latlng.lng];
    openAddReportModal(pendingCoords);
    hint.classList.remove("visible");
  });

  leafletMap.on("mousemove", () => hint.classList.add("visible"));
  leafletMap.on("mouseout", () => hint.classList.remove("visible"));

  // Render all markers with staggered drop animation
  allReports.forEach((r, i) => {
    setTimeout(() => addMarker(r, true), i * 45);
  });
}

/* ─── Markers ─────────────────────────────────────────────────────── */
function severityForMarker(report) {
  if (report.resolved) return "resolved";
  return report.severity;
}

function createMarkerIcon(report, animate) {
  const sev = severityForMarker(report);
  const typeInfo = getIssueType(report.type);
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="marker-pin ${sev}${animate ? " animate" : ""}"></div>
      <div class="marker-icon">${typeInfo.icon}</div>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -44],
  });
}

function addMarker(report, animate = false) {
  const marker = L.marker([report.lat, report.lng], {
    icon: createMarkerIcon(report, animate),
    alt: `${report.typeName} — ${report.severity} severity`,
    riseOnHover: true,
  });

  marker.addTo(leafletMap);
  marker.on("click", () => openPopup(report, marker));
  marker.bindPopup(buildPopupHTML(report), {
    maxWidth: 280,
    className: "safestep-popup",
  });

  marker.on("popupopen", () => attachPopupEvents(report));

  markersMap[report.id] = marker;
}

function updateMarkerIcon(report) {
  const marker = markersMap[report.id];
  if (marker) {
    marker.setIcon(createMarkerIcon(report, false));
  }
}

function openPopup(report, marker) {
  marker.openPopup();
}

/* ─── Popup HTML ──────────────────────────────────────────────────── */
function buildPopupHTML(report) {
  const typeInfo = getIssueType(report.type);
  const score = computeUrgency(report);
  const dateStr = formatDate(report.timestamp);
  const coords = `${report.lat.toFixed(4)}°N, ${report.lng.toFixed(4)}°E`;
  const resolvedRibbon = report.resolved
    ? `<div class="resolved-ribbon">✓ Marked as resolved</div>`
    : "";

  return `
    <div class="popup-inner">
      <div class="popup-header">
        <div class="popup-type">${typeInfo.icon} ${report.typeName}</div>
        <span class="sev-tag sev-tag-${report.resolved ? "resolved" : report.severity}">
          ${report.resolved ? "✓ Resolved" : report.severity.toUpperCase()}
        </span>
      </div>
      <div class="popup-desc">${escHtml(report.description)}</div>
      <div class="popup-meta">
        📍 ${coords}<br>
        🕒 ${dateStr}
      </div>
      <div class="popup-confirmations">
        <span>Community confirmations:</span>
        <span class="confirm-count" id="conf-count-${report.id}">${report.confirmations}</span>
      </div>
      <div class="popup-score-row">
        Urgency score: <span class="popup-score-val urgency-score-badge ${getScoreClass(report)}" id="popup-score-${report.id}" style="padding:0.15rem 0.4rem; clip-path: polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%);">${score}</span>
      </div>
      <hr class="popup-divider">
      <div class="popup-actions">
        ${
          !report.resolved
            ? `<button class="btn btn-confirm" id="btn-confirm-${report.id}" onclick="confirmReport('${report.id}')">
                ✓ Confirm this issue
              </button>`
            : ""
        }
        <button class="btn ${report.resolved ? "btn-unresolve" : "btn-resolve"}" id="btn-resolve-${report.id}" onclick="toggleResolve('${report.id}')">
          ${report.resolved ? "↩ Reopen issue" : "✓ Mark as resolved"}
        </button>
      </div>
      <div class="popup-note">
        ${
          !report.resolved
            ? "Confirmations are a simplified stand-in for community verification — a future version will require verified login."
            : ""
        }
      </div>
    </div>
    ${resolvedRibbon}
  `;
}

function attachPopupEvents(report) {
  // Events are handled via onclick attributes in the popup HTML
  // for compatibility with Leaflet's popup DOM injection
}

/* ─── Report Actions ──────────────────────────────────────────────── */
function confirmReport(id) {
  const report = allReports.find((r) => r.id === id);
  if (!report || report.resolved) return;

  report.confirmations += 1;
  report._urgency = computeUrgency(report);
  saveUserReports(allReports);

  // Update popup live
  const confEl = document.getElementById(`conf-count-${id}`);
  if (confEl) confEl.textContent = report.confirmations;
  const scoreEl = document.getElementById(`popup-score-${id}`);
  if (scoreEl) scoreEl.textContent = report._urgency;

  // Re-render urgency list respecting current filters
  renderUrgencyList(true, getFilteredReports());
  updateStats();
  showToast(`Confirmation recorded — urgency score updated.`);
}

function toggleResolve(id) {
  const report = allReports.find((r) => r.id === id);
  if (!report) return;

  report.resolved = !report.resolved;
  report._urgency = computeUrgency(report);
  saveUserReports(allReports);

  // Update marker icon (respects filter visibility)
  updateMarkerIcon(report);
  // If the resolved state changed, re-apply filter so marker visibility is correct
  applyFilters();
  showToast(
    report.resolved ? "Issue marked as resolved." : "Issue reopened."
  );
}

/* ─── Add Report Form ─────────────────────────────────────────────── */
function buildReportFormTypes() {
  const sel = document.getElementById("form-type");
  sel.innerHTML = ""; // clear before rebuilding
  ISSUE_TYPES.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.value;
    const textLabel = currentLang === "ml" ? t.label_ml : t.label;
    opt.textContent = `${t.icon} ${textLabel}`;
    sel.appendChild(opt);
  });
}

function openAddReportModal(coords) {
  pendingCoords = coords;
  const lat = Array.isArray(coords) ? coords[0] : coords.lat;
  const lng = Array.isArray(coords) ? coords[1] : coords.lng;

  document.getElementById("form-lat").textContent = lat.toFixed(5);
  document.getElementById("form-lng").textContent = lng.toFixed(5);
  document.getElementById("report-form").reset();

  const overlay = document.getElementById("modal-overlay");
  overlay.classList.add("open");
  document.getElementById("form-type").focus();
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
  pendingCoords = null;
}

function handleAddReport(e) {
  e.preventDefault();

  if (!pendingCoords) return;

  const lat = Array.isArray(pendingCoords) ? pendingCoords[0] : pendingCoords.lat;
  const lng = Array.isArray(pendingCoords) ? pendingCoords[1] : pendingCoords.lng;

  const type = document.getElementById("form-type").value;
  const description = document.getElementById("form-desc").value.trim();
  const severity = document.getElementById("form-severity").value;

  if (!description) {
    document.getElementById("form-desc").focus();
    return;
  }

  const typeInfo = getIssueType(type);
  const newReport = {
    id: `user-${Date.now()}`,
    lat,
    lng,
    type,
    typeName: typeInfo.label,
    description,
    severity,
    confirmations: 0,
    timestamp: new Date().toISOString(),
    resolved: false,
  };

  newReport._urgency = computeUrgency(newReport);
  allReports.push(newReport);
  saveUserReports(allReports);

  addMarker(newReport, true);
  renderUrgencyList(true, getFilteredReports()); // respect active filters
  updateStats();

  closeModal();
  showToast("Report added — thank you for flagging this.");

  // Simulated push notification for high-severity issues
  if (severity === "high") {
    setTimeout(() => {
      const banner = document.getElementById("notification-banner");
      if (banner) {
        banner.classList.add("show");
        // Auto-dismiss after 4 seconds
        setTimeout(() => banner.classList.remove("show"), 4000);
      }
    }, 600); // Slight delay for realistic 'system processing' feel
  }

  // Pan to new pin
  leafletMap.panTo([lat, lng]);
}

/* ─── Urgency List ───────────────────────────────────────────────────── */
function renderUrgencyList(animate = false, reports = null) {
  // Use provided reports (filtered) or fall back to all
  const source = reports !== null ? reports : allReports;
  const container = document.getElementById("urgency-items");

  // Sort by urgency desc
  const sorted = [...source].sort((a, b) => b._urgency - a._urgency);
  const topItems = sorted.slice(0, 10);

  if (animate) container.classList.add("urgency-list-updating");

  container.innerHTML = "";

  if (topItems.length === 0) {
    const isFiltered = activeFilters.severity !== "all" || activeFilters.type !== "all";
    const dict = TRANSLATIONS[currentLang];
    const key = isFiltered ? "empty_filter" : "empty_initial";
    container.innerHTML = `<div class="urgency-empty" data-i18n="${key}">${dict[key]}</div>`;
    return;
  }

  topItems.forEach((report, i) => {
    const typeInfo = getIssueType(report.type);
    const scoreClass = getScoreClass(report);
    const score = report._urgency;

    const item = document.createElement("div");
    item.className = `urgency-item${report.resolved ? " resolved" : ""}`;
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.setAttribute(
      "aria-label",
      `Rank ${i + 1}: ${report.typeName}, urgency score ${score}`
    );
    
    const displayTypeName = currentLang === 'ml' && typeInfo.label_ml ? typeInfo.label_ml : report.typeName;

    item.innerHTML = `
      <div class="rank-badge ${i === 0 ? "rank-1" : ""}">${i + 1}</div>
      <div class="urgency-item-content">
        <div class="urgency-item-type">
          ${typeInfo.icon} ${displayTypeName}
          <span class="sev-tag sev-tag-${report.resolved ? "resolved" : report.severity}">
            ${report.resolved ? "✓" : ""} ${report.severity.toUpperCase()}
          </span>
        </div>
        <div class="urgency-item-desc">${escHtml(report.description)}</div>
        <div class="urgency-item-meta">
          <span>&#x2B06; ${report.confirmations} confirmations</span>
          <span>&middot;</span>
          <span>${formatDateShort(report.timestamp)}</span>
        </div>
      </div>
      <div class="urgency-score-badge ${scoreClass}">${report.resolved ? "\u2713" : score}</div>
    `;

    // Click â†’ fly to pin and open popup
    item.addEventListener("click", () => {
      const marker = markersMap[report.id];
      if (marker) {
        leafletMap.flyTo([report.lat, report.lng], 16, { duration: 0.8 });
        setTimeout(() => marker.openPopup(), 850);
      }
    });

    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        item.click();
      }
    });

    container.appendChild(item);
  });

  if (animate) {
    setTimeout(() => container.classList.remove("urgency-list-updating"), 400);
  }
}

/* ─── Stats ───────────────────────────────────────────────────────── */
function updateStats() {
  const active = allReports.filter((r) => !r.resolved);
  const high = active.filter((r) => r.severity === "high").length;
  const medium = active.filter((r) => r.severity === "medium").length;
  const low = active.filter((r) => r.severity === "low").length;
  const resolved = allReports.filter((r) => r.resolved).length;

  document.getElementById("stat-total").textContent = allReports.length;
  document.getElementById("stat-high").textContent = high;
  document.getElementById("stat-medium").textContent = medium;
  document.getElementById("stat-resolved").textContent = resolved;
  document.getElementById("stat-impact").textContent = resolved;
}

/* ─── CSV Export ──────────────────────────────────────────────────── */
function exportCSV() {
  const sorted = [...allReports].sort((a, b) => b._urgency - a._urgency);

  const headers = [
    "ID",
    "Type",
    "Description",
    "Severity",
    "Latitude",
    "Longitude",
    "Confirmations",
    "Urgency Score",
    "Resolved",
    "Timestamp",
  ];

  const rows = sorted.map((r) =>
    [
      r.id,
      r.typeName,
      `"${r.description.replace(/"/g, '""')}"`,
      r.severity,
      r.lat.toFixed(6),
      r.lng.toFixed(6),
      r.confirmations,
      r._urgency,
      r.resolved ? "Yes" : "No",
      r.timestamp,
    ].join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  // Use a data: URI instead of a blob: URL.
  // Blob URLs cause some browsers to ignore the `download` attribute and
  // save the file as a UUID with no extension. Data URIs always respect it.
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const filename = `safestep-report-${date}.csv`;
  const dataUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);

  const a = document.createElement("a");
  a.href = dataUri;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  showToast(`Report exported — ${sorted.length} entries saved as CSV.`);
}

/* ─── Utilities ───────────────────────────────────────────────────── */
function escHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(isoStr) {
  const d = new Date(isoStr);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3200);
}

/* ─── Boot ────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", init);

/* ─── Global Exports ──────────────────────────────────────────────── */
// These functions are called via inline onclick attributes in Leaflet popup HTML,
// which executes in the global (window) scope — they must be exposed here.
window.confirmReport = confirmReport;
window.toggleResolve = toggleResolve;
window.closeModal = closeModal;


/* ─── Login Preview Modal ─────────────────────────────────────────── */
// Demo credential — no backend, no token, resets on page reload.
const DEMO_EMAIL    = "demo@safestep.app";
const DEMO_PASSWORD = "safestep2026";
let   isLoggedIn    = false;

(function initLoginPreview() {
  const overlay     = document.getElementById("login-modal-overlay");
  const formArea    = document.getElementById("login-form-area");
  const successArea = document.getElementById("login-success-area");
  const noteArea    = document.getElementById("login-note-area");
  const errorEl     = document.getElementById("login-error");
  const btnOpen     = document.getElementById("btn-signin");
  const btnClose    = document.getElementById("btn-login-close");
  const btnSubmit   = document.getElementById("btn-login-submit");
  const btnOk       = document.getElementById("btn-login-ok");
  const signinLabel = document.getElementById("btn-signin-label");
  const signinIcon  = document.getElementById("btn-signin-icon");

  /* ─ Panel switcher ──────────────────────────────────────────────── */
  function showPanel(which) {
    formArea.hidden    = which !== "form";
    successArea.hidden = which !== "success";
    noteArea.hidden    = which !== "note";
  }

  /* ─ Error helpers ───────────────────────────────────────────────── */
  function clearError() {
    errorEl.hidden = true;
    errorEl.textContent = "";
    document.getElementById("login-email").classList.remove("login-input-error");
    document.getElementById("login-password").classList.remove("login-input-error");
  }

  function setError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
    document.getElementById("login-email").classList.add("login-input-error");
    document.getElementById("login-password").classList.add("login-input-error");
  }

  /* ─ Header button â†’ signed-in state ────────────────────────────── */
  function setSignedInButton() {
    if (signinIcon)  signinIcon.style.display = "none";
    if (signinLabel) signinLabel.textContent = "Demo User";
    // Insert avatar initial if not already present
    if (!document.getElementById("btn-signin-avatar")) {
      const avatar = document.createElement("span");
      avatar.id = "btn-signin-avatar";
      avatar.className = "login-avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = "D";
      btnOpen.insertBefore(avatar, signinIcon || btnOpen.firstChild);
    }
    btnOpen.classList.add("btn-signed-in");
    btnOpen.setAttribute("aria-label", "Signed in as Demo User");
    btnOpen.title = "Signed in as Demo User";
  }

  /* ─ App Visibility (The Gate) ───────────────────────────────────── */
  const appHeader    = document.getElementById("header");
  const appFilterBar = document.getElementById("filter-bar");
  const appBody      = document.getElementById("app-body");

  function hideApp() {
    if (appHeader)    appHeader.style.display    = "none";
    if (appFilterBar) appFilterBar.style.display = "none";
    if (appBody)      appBody.style.display      = "none";
  }

  function showApp() {
    if (appHeader)    appHeader.style.display    = "";
    if (appFilterBar) appFilterBar.style.display = "";
    if (appBody)      appBody.style.display      = "";
    // Re-trigger Leaflet layout now that the map container is visible
    if (typeof leafletMap !== "undefined" && leafletMap) {
      setTimeout(() => leafletMap.invalidateSize(), 80);
    }
  }

  /* ─ Open / close ────────────────────────────────────────────────── */
  function openLogin() {
    if (isLoggedIn) return; 
    showPanel("form");
    clearError();
    document.getElementById("login-email").value    = "";
    document.getElementById("login-password").value = "";
    overlay.hidden = false;
    setTimeout(() => document.getElementById("login-email").focus(), 50);
  }

  function closeLogin() {
    if (!isLoggedIn) return; // Enforce gate: cannot close until logged in
    overlay.hidden = true;
    showApp();
  }

  /* ─ Submit handler ──────────────────────────────────────────────── */
  function handleSubmit() {
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const pass  = document.getElementById("login-password").value;

    if (email === DEMO_EMAIL && pass === DEMO_PASSWORD) {
      // Correct — show success, auto-close, update header
      clearError();
      isLoggedIn = true;
      showPanel("success");
      setTimeout(() => {
        closeLogin();
        setSignedInButton();
      }, 1500);
    } else {
      // Wrong — inline error, stay on form
      setError("Invalid credentials — try demo@safestep.app / safestep2026");
      document.getElementById("login-password").focus();
    }
  }

  /* ─ Event wiring ────────────────────────────────────────────────── */
  btnOpen.addEventListener("click", openLogin);
  btnClose.addEventListener("click", closeLogin);
  btnSubmit.addEventListener("click", handleSubmit);
  btnOk.addEventListener("click", closeLogin);

  // Enter key shortcuts
  document.getElementById("login-password").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSubmit();
  });
  document.getElementById("login-email").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("login-password").focus();
  });

  // Clear error when user retypes
  ["login-email", "login-password"].forEach(id => {
    document.getElementById(id).addEventListener("input", clearError);
  });

  // Dismiss on backdrop click (only if logged in)
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay && isLoggedIn) closeLogin();
  });

  // Dismiss on Escape (only if logged in)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden && isLoggedIn) closeLogin();
  });

  /* ─ Initialize Gate ─────────────────────────────────────────────── */
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("skiplogin") === "true") {
    isLoggedIn = true;
    setSignedInButton();
    showApp();
  } else {
    // Hide app and force login modal open on boot
    hideApp();
    if (btnClose) btnClose.style.display = "none"; // Hide the X button
    openLogin();
  }
})();
