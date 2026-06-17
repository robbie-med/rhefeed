// ─────────────────────────────────────────────────────────────────────────
// Growth-chart Z-score calculator using LMS reference data from
// robbie-med/ghrow (github.com/robbie-med/ghrow). Fetches CSV curves
// on-demand from GitHub raw, caches in LocalStorage for offline use.
// Supports WHO 2006, CDC 2000, China NHC 2022, Korea KNGC2017.
// ─────────────────────────────────────────────────────────────────────────

// ── Curve catalog (subset of ghrow data/catalog.json, refeeding-relevant) ─
// Each curve has an id, standard label, family/metric, and CSV path(s).
// For weight-for-length/height curves we include both sexes so we can
// compute z-scores and extract the 50th-percentile weight (IBW).
const ZCURVES = [
  // WHO 2006 — weight-for-length (0–24 months)
  { id:"who-wfl", standard:"WHO 2006", label:"Weight-for-length (0–24 mo)", family:"weight-height", metric:"weight-length", xUnit:"cm", xLabel:"Length (cm)", yLabel:"Weight (kg)", xMin:45, xMax:110,
    files:{male:{path:"data/who/WHO-Boys-Weight-for-length-Percentiles.csv"}, female:{path:"data/who/WHO-Girls-Weight-for-length-Percentiles.csv"}} },
  // WHO 2006 — BMI-for-age (0–24 months)
  { id:"who-bmi", standard:"WHO 2006", label:"BMI-for-age (0–24 mo)", family:"bmi-age", metric:"bmi-age", xUnit:"months", xLabel:"Age (months)", yLabel:"BMI (kg/m²)", xMin:0, xMax:24,
    files:{male:{path:"data/who/WHO-Boys-BMI-for-age-Percentiles.csv"}, female:{path:"data/who/WHO-Girls-BMI-for-age-Percentiles.csv"}} },
  // WHO 2006 — length-for-age (0–24 months)
  { id:"who-len", standard:"WHO 2006", label:"Length-for-age (0–24 mo)", family:"height-age", metric:"length-age", xUnit:"months", xLabel:"Age (months)", yLabel:"Length (cm)", xMin:0, xMax:24,
    files:{male:{path:"data/who/WHO-Boys-Length-for-age-Percentiles.csv"}, female:{path:"data/who/WHO-Girls-Length-for-age-Percentiles.csv"}} },
  // CDC 2000 infant — weight-for-length (0–36 months)
  { id:"cdc-infant-wfl", standard:"CDC 2000", label:"CDC infant weight-for-length (0–36 mo)", family:"weight-height", metric:"weight-length", xUnit:"cm", xLabel:"Length (cm)", yLabel:"Weight (kg)", xMin:45, xMax:103,
    files:{male:{path:"data/cdc/CDC-2000-Infant-Boys-Weight-for-length.csv"}, female:{path:"data/cdc/CDC-2000-Infant-Girls-Weight-for-length.csv"}} },
  // CDC 2000 — BMI-for-age (2–20 years)
  { id:"cdc-bmi", standard:"CDC 2000", label:"CDC BMI-for-age (2–20 yr)", family:"bmi-age", metric:"bmi-age", xUnit:"months", xLabel:"Age (months)", yLabel:"BMI (kg/m²)", xMin:24, xMax:240,
    files:{male:{path:"data/cdc/CDC-2000-Boys-BMI-for-age.csv"}, female:{path:"data/cdc/CDC-2000-Girls-BMI-for-age.csv"}} },
  // CDC 2000 — stature-for-age (2–20 years)
  { id:"cdc-stature", standard:"CDC 2000", label:"CDC stature-for-age (2–20 yr)", family:"height-age", metric:"stature-age", xUnit:"months", xLabel:"Age (months)", yLabel:"Stature (cm)", xMin:24, xMax:240,
    files:{male:{path:"data/cdc/CDC-2000-Boys-Stature-for-age.csv"}, female:{path:"data/cdc/CDC-2000-Girls-Stature-for-age.csv"}} },
  // China NHC 2022 — weight-for-length (birth–7 years)
  { id:"china-wfl", standard:"China NHC 2022", label:"China weight-for-length/height (0–7 yr)", family:"weight-height", metric:"weight-length", xUnit:"cm", xLabel:"Length/Height (cm)", yLabel:"Weight (kg)",
    files:{male:{path:"data/china/nhc2022-weight-length-male.csv"}, female:{path:"data/china/nhc2022-weight-length-female.csv"}} },
  // China NHC 2022 — BMI-for-age (birth–7 years)
  { id:"china-bmi", standard:"China NHC 2022", label:"China BMI-for-age (0–7 yr)", family:"bmi-age", metric:"bmi-age", xUnit:"months", xLabel:"Age (months)", yLabel:"BMI (kg/m²)",
    files:{male:{path:"data/china/nhc2022-bmi-age-male.csv"}, female:{path:"data/china/nhc2022-bmi-age-female.csv"}} },
  // China NHC 2022 — height-for-age
  { id:"china-height", standard:"China NHC 2022", label:"China height-for-age (0–7 yr)", family:"height-age", metric:"stature-age", xUnit:"months", xLabel:"Age (months)", yLabel:"Height (cm)",
    files:{male:{path:"data/china/nhc2022-height-age-male.csv"}, female:{path:"data/china/nhc2022-height-age-female.csv"}} },
  // Korea KNGC2017 — weight-for-length (0–2 yr)
  { id:"korea-wfl", standard:"Korea KNGC2017", label:"Korea weight-for-length (0–2 yr)", family:"weight-height", metric:"weight-length", xUnit:"cm", xLabel:"Length (cm)", yLabel:"Weight (kg)",
    sexColumn:"Sex", maleValue:1, femaleValue:2, path:"data/korea/kngc2017-weight-length-u2.csv" },
  // Korea KNGC2017 — BMI-for-age (2–18 yr)
  { id:"korea-bmi", standard:"Korea KNGC2017", label:"Korea BMI-for-age (2–18 yr)", family:"bmi-age", metric:"bmi-age", xUnit:"months", xLabel:"Age (months)", yLabel:"BMI (kg/m²)",
    sexColumn:"Sex", maleValue:1, femaleValue:2, path:"data/korea/kngc2017-bmi-age.csv" }
];

// ── CSV parsing (adapted from ghrow js/data.js) ────────────────────────────
function zParseCSV(text) {
  var rows = [];
  var row = [], value = "", inQuotes = false;
  for (var i = 0; i < text.length; i++) {
    var ch = text[i], nx = text[i + 1];
    if (ch === '"') {
      if (inQuotes && nx === '"') { value += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) { row.push(value); value = ""; }
    else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && nx === '\n') i++;
      row.push(value);
      if (row.some(function(c) { return c.trim() !== ""; })) rows.push(row);
      row = []; value = "";
    } else { value += ch; }
  }
  row.push(value);
  if (row.some(function(c) { return c.trim() !== ""; })) rows.push(row);
  if (!rows.length) return [];
  var headers = rows[0].map(function(h) { return h.trim().replace(/^\uFEFF/, ""); }); // strip BOM
  return rows.slice(1).map(function(cells) {
    var obj = {};
    headers.forEach(function(h, idx) {
      var raw = (cells[idx] || "").trim();
      var num = Number(raw);
      obj[h] = (raw !== "" && isFinite(num)) ? num : raw;
    });
    return obj;
  });
}

// ── LocalStorage cache (7-day TTL) ─────────────────────────────────────────
var ZCACHE_PREFIX = "rhefeed_zcache_";
function zCacheKey(path) { return ZCACHE_PREFIX + path.replace(/[^a-zA-Z0-9]/g, "_"); }
function zCached(path) {
  try {
    var raw = localStorage.getItem(zCacheKey(path));
    if (!raw) return null;
    var entry = JSON.parse(raw);
    if (Date.now() - entry.ts > 7 * 86400000) { localStorage.removeItem(zCacheKey(path)); return null; }
    return entry.rows;
  } catch (_) { return null; }
}
function zCacheStore(path, rows) {
  try { localStorage.setItem(zCacheKey(path), JSON.stringify({ ts: Date.now(), rows: rows })); } catch (_) {}
}

// ── Fetch CSV from ghrow GitHub raw, with caching ──────────────────────────
// Returns a Promise that resolves to an array of row objects.
function zFetchCurve(curveMeta, sex) {
  var path, sexFilter = null;
  if (curveMeta.files && curveMeta.files[sex]) {
    path = curveMeta.files[sex].path;
  } else if (curveMeta.path) {
    path = curveMeta.path;
    if (curveMeta.sexColumn) {
      sexFilter = { col: curveMeta.sexColumn, val: sex === "male" ? curveMeta.maleValue : curveMeta.femaleValue };
    }
  } else {
    return Promise.resolve(null);
  }

  var cached = zCached(path);
  if (cached) {
    if (sexFilter) cached = cached.filter(function(r) { return String(r[sexFilter.col]) === String(sexFilter.val); });
    return Promise.resolve(cached);
  }

  return fetch(GHHROW_BASE + path, { cache: "no-store" })
    .then(function(resp) {
      if (!resp.ok) throw new Error("Fetch failed: " + resp.status);
      return resp.text();
    })
    .then(function(text) {
      var rows = zParseCSV(text);
      // Cache all rows before sex filter so the other sex benefits too
      zCacheStore(path, rows);
      if (sexFilter) rows = rows.filter(function(r) { return String(r[sexFilter.col]) === String(sexFilter.val); });
      return rows;
    })
    .catch(function() { return null; });
}

// ── Find the first column name that holds the x-axis value ─────────────────
// CSVs from different sources use different column names (Length, Month, Age, X, etc.)
function zFindXCol(rows) {
  if (!rows || !rows.length) return null;
  var row0 = rows[0];
  // Try common names in priority order
  var candidates = ["Length", "Month", "Age", "X", "Agemos", "Day", "Days"];
  for (var i = 0; i < candidates.length; i++) {
    if (row0.hasOwnProperty(candidates[i]) && isFinite(row0[candidates[i]])) return candidates[i];
  }
  // Fallback: first numeric key that looks like an x-axis
  var keys = Object.keys(row0);
  for (var j = 0; j < keys.length; j++) {
    if (keys[j] !== "L" && keys[j] !== "M" && keys[j] !== "S" && isFinite(row0[keys[j]])) return keys[j];
  }
  return null;
}

// ── LMS interpolation ──────────────────────────────────────────────────────
// rows sorted by xKey ascending. Returns {L, M, S} interpolated at xValue.
function zInterpolateLMS(rows, xValue, xKey) {
  if (!rows || !rows.length || !isFinite(xValue)) return null;
  var lo = null, hi = null;
  for (var i = 0; i < rows.length; i++) {
    var x = rows[i][xKey];
    if (!isFinite(x)) continue;
    if (x <= xValue) lo = rows[i];
    if (x >= xValue && !hi) { hi = rows[i]; break; }
  }
  if (!lo && !hi) return null;
  if (!lo) lo = hi;
  if (!hi) hi = lo;
  if (lo === hi) return { L: lo.L, M: lo.M, S: lo.S };
  var xLo = lo[xKey], xHi = hi[xKey];
  var frac = (xValue - xLo) / (xHi - xLo);
  return {
    L: lo.L + (hi.L - lo.L) * frac,
    M: lo.M + (hi.M - lo.M) * frac,
    S: lo.S + (hi.S - lo.S) * frac
  };
}

// ── LMS z-score formula ────────────────────────────────────────────────────
// X = measurement, lms = {L, M, S}
function zScoreFromLMS(value, lms) {
  if (!lms || !isFinite(value) || value <= 0 || !isFinite(lms.M) || !isFinite(lms.S)) return null;
  if (Math.abs(lms.L) < 1e-7) return Math.log(value / lms.M) / lms.S;
  return (Math.pow(value / lms.M, lms.L) - 1) / (lms.L * lms.S);
}

// ── Get weight at a given percentile for a given x (used for IBW) ──────────
// Interpolates the P50 column between surrounding rows.
function zWeightAtPercentile(rows, xValue, xKey) {
  if (!rows || !rows.length || !isFinite(xValue)) return null;
  var lo = null, hi = null;
  for (var i = 0; i < rows.length; i++) {
    var x = rows[i][xKey];
    if (!isFinite(x)) continue;
    if (x <= xValue) lo = rows[i];
    if (x >= xValue && !hi) { hi = rows[i]; break; }
  }
  if (!lo && !hi) return null;
  if (!lo) lo = hi;
  if (!hi) hi = lo;

  // Try P50 column first, then "50th", then the 6th column as fallback
  function p50val(r) {
    if (isFinite(r.P50)) return r.P50;
    if (isFinite(r["50th"])) return r["50th"];
    // Some CSVs use ordinal percentile column names
    var keys = Object.keys(r);
    for (var j = 0; j < keys.length; j++) {
      if (keys[j] === "50th" || keys[j] === "P50") return r[keys[j]];
    }
    return null;
  }
  if (lo === hi) return p50val(lo);
  var vLo = p50val(lo), vHi = p50val(hi);
  if (!isFinite(vLo) || !isFinite(vHi)) return null;
  var frac = (xValue - lo[xKey]) / (hi[xKey] - lo[xKey]);
  return vLo + (vHi - vLo) * frac;
}

// ── Percentile from z-score (normal CDF approximation) ─────────────────────
function zToPercentile(z) {
  if (!isFinite(z)) return null;
  var sign = z >= 0 ? 1 : -1;
  var abs = Math.abs(z);
  var a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429;
  var p = 0.3275911;
  var t = 1 / (1 + p * abs);
  var y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-abs * abs);
  return sign > 0 ? 0.5 + 0.5 * y : 0.5 - 0.5 * y;
}

// ── Lookup helpers ─────────────────────────────────────────────────────────
function zCurveById(id) { return ZCURVES.filter(function(c) { return c.id === id; })[0] || null; }
function zCurvesByStandard(standard) { return ZCURVES.filter(function(c) { return c.standard === standard; }); }
function zCurvesByFamily(family) { return ZCURVES.filter(function(c) { return c.family === family; }); }

// Return unique standards for the dropdown
function zStandards() {
  var seen = {};
  return ZCURVES.filter(function(c) {
    if (seen[c.standard]) return false;
    seen[c.standard] = true;
    return true;
  }).map(function(c) { return c.standard; });
}
