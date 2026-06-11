// Unit conversions. Pure functions, no UI.

function lbToKg(lb) { return lb * 0.45359237; }
function inToCm(inches) { return inches * 2.54; }

function weightToKg(value, unit) {
  if (!isFinite(value)) return NaN;
  return unit === "lb" ? lbToKg(value) : value;
}
function heightToCm(value, unit) {
  if (!isFinite(value)) return NaN;
  return unit === "in" ? inToCm(value) : value;
}

// Phosphate: 1 mmol/L ≈ 3.096 mg/dL (as phosphorus). Reporting conventions vary,
// so the factor is explicit here.
const PHOS_MGDL_PER_MMOLL = 3.096;
function phosToMmolL(value, unit) {
  if (!isFinite(value)) return NaN;
  return unit === "mgdL" ? value / PHOS_MGDL_PER_MMOLL : value;
}
function phosMmolLToMgdL(mmolL) {
  return isFinite(mmolL) ? mmolL * PHOS_MGDL_PER_MMOLL : NaN;
}

// Age entered as years (decimal allowed) or months; normalize to years.
function ageToYears(value, unit) {
  if (!isFinite(value)) return NaN;
  return unit === "months" ? value / 12 : value;
}
