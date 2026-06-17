// ─────────────────────────────────────────────────────────────────────────
// Non-prescriptive management FRAMEWORK (ASPEN 2020 Tables 6 & 7; NICE CG32).
// Provides initiation ranges, thiamine, monitoring intensity, electrolyte
// prompts, and consult triggers. Avoids prescriptive repletion dosing tables.
// ─────────────────────────────────────────────────────────────────────────

// Feeding initiation. Adults use kcal/kg/day bands; peds use % of goal + GIR.
function feedingStart({ patientType, riskLevel, weightKg, niceExtreme }) {
  if (!isFinite(weightKg) || weightKg <= 0) return null;
  const F = FEEDING;

  if (patientType === "peds") {
    const p = F.peds;
    // Calculate actual kcal amounts from weight for context
    const estGoalLow = Math.round(weightKg * 80 * p.startPctGoalLow / 100);
    const estGoalHigh = Math.round(weightKg * 80 * p.startPctGoalHigh / 100);
    return {
      ref: REFS.aspen2020,
      headline: "Pediatric initiation (ASPEN 2020)",
      lines: [
        "Start PO/NG nutrition at " + p.startPctGoalLow + "–" + p.startPctGoalHigh + "% of estimated goal (~" + estGoalLow + "–" + estGoalHigh + " kcal/day).",
        "Route: PO > NG > IV. Use age-appropriate standard formula or breast milk.",
        "If IV dextrose: start GIR " + p.girStartLow + "–" + p.girStartHigh + " mg/kg/min, advance " + F.peds.girAdvance + " mg/kg/min daily to max 14–" + p.girMax + " mg/kg/min.",
        "Advance by ~33% of goal every 1–2 days as tolerated. Halve rate if electrolytes drop >20%.",
        "Coordinate with pediatric nutrition support / pharmacy."
      ]
    };
  }

  // Adults
  const startLow = Math.round(F.adult.startKcalPerKgLow * weightKg);
  const startHigh = Math.round(F.adult.startKcalPerKgHigh * weightKg);
  const lines = [];
  if (niceExtreme) {
    const ex = Math.round(F.adult.niceExtremeKcalPerKg * weightKg);
    lines.push(`Extreme risk (NICE: BMI <14 or negligible intake >15 d): start ~${F.adult.niceExtremeKcalPerKg} kcal/kg/day (≈ ${ex} kcal/day).`);
  }
  lines.push(`Initiate ~${F.adult.startKcalPerKgLow}–${F.adult.startKcalPerKgHigh} kcal/kg/day (≈ ${startLow}–${startHigh} kcal/day), or 100–150 g dextrose, for the first 24 h.`);
  lines.push(`Advance by ~${F.adult.advancePctGoal}% of goal every 1–2 days toward full needs over ${F.adult.advanceDaysMin}–${F.adult.advanceDaysMax} days.`);
  lines.push(`Hold/delay escalation if pre-feeding electrolytes are low until corrected.`);
  return { ref: REFS.aspen2020, headline: "Adult initiation (ASPEN 2020 / NICE)", lines };
}

function thiamineRecommendation(patientType, weightKg) {
  if (patientType === "peds") {
    const dose = isFinite(weightKg) ? Math.min(THIAMINE.pedsMgPerKg * weightKg, THIAMINE.pedsMaxMg) : null;
    return {
      ref: REFS.aspen2020,
      text: `Thiamine ${THIAMINE.pedsMgPerKg} mg/kg` +
            (dose ? ` = ${Math.round(dose)} mg` : "") +
            ` (max ${THIAMINE.pedsMaxMg} mg) PO/IV once BEFORE feeding. Then ${THIAMINE.pedsMgPerKg} mg/kg PO/IV daily × ${THIAMINE.durationDays}. Add pediatric multivitamin 1 mL PO daily.`
    };
  }
  return {
    ref: REFS.aspen2020,
    text: `Thiamine ${THIAMINE.adultMg} mg BEFORE feeding or dextrose-containing IV fluids; continue ${THIAMINE.adultMg} mg/day for ${THIAMINE.durationDays} in severe starvation, chronic alcohol use, or signs of deficiency. Add a complete multivitamin daily.`
  };
}

function monitoringRecommendation({ setting, riskLevel }) {
  const high = riskLevel === "very_high" || riskLevel === "high";
  const lines = [
    "Check K, Mg, and phosphate BEFORE initiating nutrition.",
    high
      ? "Monitor K/Mg/phosphate every 12 h for the first 3 days (more often if unstable or dropping)."
      : "Monitor K/Mg/phosphate daily for the first 3 days; increase frequency if falling.",
    "Vital signs every 4 h for the first 24 h after starting calories.",
    "Daily weights with strict intake/output."
  ];
  if (setting === "icu" || riskLevel === "very_high")
    lines.push("Cardiorespiratory/telemetry monitoring for unstable patients or severe electrolyte derangement.");
  return { ref: REFS.aspen2020, lines };
}

function electrolyteFramework({ rsSeverityWorst, imminent }) {
  const lines = [];
  if (imminent) lines.push("URGENT: treat the abnormal electrolyte promptly; consider higher-acuity monitoring.");
  lines.push("Replenish low phosphate/potassium/magnesium per local standards; recheck after replenishment.");
  lines.push("If electrolytes are difficult to correct or drop precipitously, decrease calories/dextrose by 50% and re-advance ~33% of goal every 1–2 days.");
  if (rsSeverityWorst === "Severe")
    lines.push("Severe electrolyte decrement: consider holding advancement and escalating monitoring.");
  lines.push("Do not routinely check thiamine levels — supplement empirically.");
  return { ref: REFS.aspen2020, lines };
}

function consultTriggers({ patientType, riskLevel }) {
  const consults = [];
  if (riskLevel !== "lower") consults.push("Nutrition support / dietitian at initiation.");
  if (patientType === "peds") consults.push("Pediatric nutrition support team.");
  if (riskLevel === "very_high") consults.push("ICU/telemetry assessment based on hemodynamics and electrolyte severity.");
  consults.push("Pharmacy for repletion strategy and drug interactions (diuretics/insulin).");
  return consults;
}

function buildPlan({ patientType, setting, weightKg, riskLevel, niceExtreme, rsSeverityWorst, imminent }) {
  return {
    feed: feedingStart({ patientType, riskLevel, weightKg, niceExtreme }),
    thiamine: thiamineRecommendation(patientType, weightKg),
    monitor: monitoringRecommendation({ setting, riskLevel }),
    electrolytes: electrolyteFramework({ rsSeverityWorst, imminent }),
    consults: consultTriggers({ patientType, riskLevel })
  };
}
