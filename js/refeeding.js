// ─────────────────────────────────────────────────────────────────────────
// Refeeding / catch-up calorie calculator (adult + pediatric).
// Pediatric catch-up formula: RDA kcal/kg × IBW / actual weight.
// Adult refeeding weight-gain target and WHO SAM protocol reference.
// Pure logic — no DOM access. Thresholds come from constants.js.
// ─────────────────────────────────────────────────────────────────────────

// ── Pediatric catch-up calorie needs ───────────────────────────────────────
// Classic formula: catch-up kcal/day = RDA_kcal_per_kg (age) × IBW_kg / actual_weight_kg
// Returns an object with breakdown, or null if inputs invalid.
function catchUpCaloriesPeds(ageYears, actualWeightKg, ibwKg) {
  if (!isFinite(ageYears) || !isFinite(actualWeightKg) || actualWeightKg <= 0 || !isFinite(ibwKg) || ibwKg <= 0) return null;

  var rdaEntry = rdaKcalPerKgForAge(ageYears);
  if (!rdaEntry) return null;

  var catchUpKcalPerKg = rdaEntry.kcalPerKg * ibwKg / actualWeightKg;
  var catchUpKcalPerDay = catchUpKcalPerKg * actualWeightKg;
  var ratio = ibwKg / actualWeightKg;
  var proteinGPerKg = RDA_PROTEIN_PER_KG;
  var catchUpProteinG = proteinGPerKg * ratio;

  return {
    rdaKcalPerKg: rdaEntry.kcalPerKg,
    rdaAgeRange: rdaEntry.ageRange,
    ibwKg: ibwKg,
    actualWeightKg: actualWeightKg,
    ratio: ratio,
    catchUpKcalPerKg: catchUpKcalPerKg,
    catchUpKcalPerDay: Math.round(catchUpKcalPerDay),
    catchUpProteinGPerKg: catchUpProteinG,
    ref: REFS.driRda
  };
}

// ── RDA kcal/kg lookup by age ──────────────────────────────────────────────
function rdaKcalPerKgForAge(ageYears) {
  if (!isFinite(ageYears) || ageYears < 0) return null;
  var bands = RDA_KCAL_PER_KG;
  for (var i = 0; i < bands.length; i++) {
    if (ageYears <= bands[i].maxAge) return bands[i];
  }
  return bands[bands.length - 1]; // oldest band
}

// ── WHO SAM protocol reference ─────────────────────────────────────────────
// Returns the phase-based feeding schedule for severe acute malnutrition.
function whoSamProtocol(weightKg) {
  if (!isFinite(weightKg) || weightKg <= 0) return null;
  return {
    phase1: {
      label: "Phase 1 — Stabilization",
      energyKcalPerKg: 100,
      energyKcalPerDay: Math.round(100 * weightKg),
      proteinGPerKg: 1.0,
      proteinGMax: 1.5,
      formula: "F-75 (75 kcal, 0.9 g protein per 100 mL)",
      frequency: "Every 2–3 hours including overnight",
      purpose: "Metabolic stabilization, correct electrolytes, treat infections"
    },
    phase2: {
      label: "Phase 2 — Rehabilitation (Catch-Up Growth)",
      energyKcalPerKgLow: 150,
      energyKcalPerKgHigh: 220,
      energyKcalPerDayLow: Math.round(150 * weightKg),
      energyKcalPerDayHigh: Math.round(220 * weightKg),
      proteinGPerKgLow: 2.0,
      proteinGPerKgHigh: 6.0,
      formula: "F-100 (100 kcal, 2.9 g protein per 100 mL) or RUTF",
      targetWeightGain: "5–10 g/kg/day",
      flagThreshold: "<5 g/kg/day triggers concern"
    },
    cmam: {
      label: "Community-based management (CMAM, uncomplicated SAM)",
      energyKcalPerKg: 175,
      energyKcalPerDay: Math.round(175 * weightKg),
      simplifiedDosing: "1,000 kcal/day (2 sachets RUTF) for MUAC 100–<115 mm; 500 kcal/day (1 sachet) for MUAC 115–<125 mm (ComPAS trial)"
    },
    ref: REFS.whoSam
  };
}

// ── Adult refeeding weight-gain target ─────────────────────────────────────
// Approx 7,700 kcal surplus needed per kg of tissue gain (~3,500 kcal/lb).
function adultWeightGainTarget(currentKg, targetKg, daysToTarget) {
  if (!isFinite(currentKg) || !isFinite(targetKg) || !isFinite(daysToTarget) ||
      currentKg <= 0 || targetKg <= currentKg || daysToTarget <= 0) return null;

  var kgToGain = targetKg - currentKg;
  var totalSurplusKcal = kgToGain * KCAL_PER_KG_GAIN;
  var dailySurplusKcal = totalSurplusKcal / daysToTarget;
  var weeklyGainKg = (kgToGain / daysToTarget) * 7;

  return {
    currentKg: currentKg,
    targetKg: targetKg,
    kgToGain: kgToGain,
    daysToTarget: daysToTarget,
    kcalPerKgGain: KCAL_PER_KG_GAIN,
    totalSurplusKcal: Math.round(totalSurplusKcal),
    dailySurplusKcal: Math.round(dailySurplusKcal),
    weeklyGainKg: weeklyGainKg,
    ref: REFS.adultWeightGain
  };
}

// ── Build a combined refeeding calculator result (for app.js rendering) ────
function buildRefeedingResult(opts) {
  // opts: { patientType:"adult"|"peds", weightKg, ageYears, ibwKg, targetKg, daysToTarget }
  var result = {};

  if (opts.patientType === "peds") {
    result.sam = whoSamProtocol(opts.weightKg);
    if (isFinite(opts.ageYears) && isFinite(opts.ibwKg)) {
      result.catchUp = catchUpCaloriesPeds(opts.ageYears, opts.weightKg, opts.ibwKg);
    }
  } else {
    // Adult: show feeding initiation reference + optional weight-gain target
    if (isFinite(opts.targetKg)) {
      result.weightGain = adultWeightGainTarget(opts.weightKg, opts.targetKg, opts.daysToTarget || 30);
    }
  }
  return result;
}
