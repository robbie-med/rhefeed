// Thresholds and reference constants.
// NOTE: This tool intentionally avoids prescribing electrolyte dosing.
// It provides a monitoring/repletion *framework* and consult triggers.

const THRESH = {
  phosImminent_mmolL: 0.6,      // commonly cited "danger" threshold
  phosDropSeverePct: 30,        // ASPEN severe boundary
  phosDropModeratePct: 20,
  phosDropMildPct: 10
};

// NICE adult high-risk logic (rule-based)
const NICE = {
  major: {
    bmi: 16.0,
    wtLossPct: 15.0,
    daysNoIntake: 10
  },
  minor: {
    bmi: 18.5,
    wtLossPct: 10.0,
    daysNoIntake: 5
  }
};

// Nutrition start / advance (high-level, non-prescriptive)
const FEEDING = {
  start_kcalPerKg_low: 5,
  start_kcalPerKg_standardHighRisk: 10,
  advance_days_min: 4,
  advance_days_max: 7
};

const STORAGE_KEY = "refeedingOneStop_v1";
