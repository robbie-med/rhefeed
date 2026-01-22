// Unit conversions
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

// Phosphate conversions:
// 1 mmol/L phosphate ≈ 3.096 mg/dL (as phosphorus).
// This conversion varies by reporting convention; we keep it explicit here.
function phosToMmolL(value, unit) {
  if (!isFinite(value)) return NaN;
  if (unit === "mgdL") return value / 3.096;
  return value;
}
