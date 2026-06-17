// ─────────────────────────────────────────────────────────────────────────
// Management PLAN — concise, directive, attending-level. ASPEN 2020 / NICE.
// ─────────────────────────────────────────────────────────────────────────

function feedingStart({ patientType, riskLevel, weightKg, niceExtreme }) {
  if (!isFinite(weightKg) || weightKg <= 0) return null;
  const F = FEEDING;

  if (patientType === "peds") {
    const p = F.peds;
    const estGoalLow = Math.round(weightKg * 80 * p.startPctGoalLow / 100);
    const estGoalHigh = Math.round(weightKg * 80 * p.startPctGoalHigh / 100);
    return {
      ref: REFS.aspen2020,
      headline: "Nutrition",
      lines: [
        "Start PO/NG " + estGoalLow + "-" + estGoalHigh + " kcal/day (" + p.startPctGoalLow + "-" + p.startPctGoalHigh + "% estimated goal).",
        "Advance 33% of goal q1-2d; halve if lytes drop >20%.",
        "If IV: GIR " + p.girStartLow + " mg/kg/min, advance " + F.peds.girAdvance + " mg/kg/min/d to max 14-" + p.girMax + "."
      ]
    };
  }

  const startLow = Math.round(F.adult.startKcalPerKgLow * weightKg);
  const startHigh = Math.round(F.adult.startKcalPerKgHigh * weightKg);
  const lines = [];
  if (niceExtreme) {
    const ex = Math.round(F.adult.niceExtremeKcalPerKg * weightKg);
    lines.push("Extreme risk: start " + F.adult.niceExtremeKcalPerKg + " kcal/kg/d (~" + ex + " kcal/d).");
  }
  lines.push("Start " + startLow + "-" + startHigh + " kcal/d (" + F.adult.startKcalPerKgLow + "-" + F.adult.startKcalPerKgHigh + " kcal/kg/d) or 100-150 g dextrose first 24h.");
  lines.push("Advance 33% of goal q1-2d over " + F.adult.advanceDaysMin + "-" + F.adult.advanceDaysMax + "d. Hold if lytes low.");
  return { ref: REFS.aspen2020, headline: "Nutrition", lines };
}

function thiamineRecommendation(patientType, weightKg) {
  if (patientType === "peds") {
    const dose = isFinite(weightKg) ? Math.min(THIAMINE.pedsMgPerKg * weightKg, THIAMINE.pedsMaxMg) : null;
    return {
      ref: REFS.aspen2020,
      text: "Thiamine " + THIAMINE.pedsMgPerKg + " mg/kg" +
            (dose ? " (" + Math.round(dose) + " mg)" : "") +
            " PO/IV before feeds, then daily × " + THIAMINE.durationDays + ". MVI 1 mL PO daily."
    };
  }
  return {
    ref: REFS.aspen2020,
    text: "Thiamine " + THIAMINE.adultMg + " mg PO/IV before feeds, then " + THIAMINE.adultMg + " mg daily × " + THIAMINE.durationDays + ". MVI daily."
  };
}

function monitoringRecommendation({ setting, riskLevel }) {
  const high = riskLevel === "very_high" || riskLevel === "high";
  const lines = [
    "Check K/Mg/Phos before starting nutrition.",
    high
      ? "Lytes q12h × 3d, then daily if stable."
      : "Lytes daily × 3d.",
    "Vitals q4h × 24h after feeding starts.",
    "Daily weight, strict I/O."
  ];
  if (setting === "icu" || riskLevel === "very_high")
    lines.push("Telemetry if severe lytes.");
  return { ref: REFS.aspen2020, lines };
}

function electrolyteFramework({ rsSeverityWorst, imminent }) {
  const lines = [];
  if (imminent) lines.push("Treat critical lytes now - escalate monitoring.");
  lines.push("Replenish K/Mg/Phos per protocol; recheck post-repletion.");
  lines.push("If lytes refractory: cut calories 50%, re-advance 33% q1-2d.");
  if (rsSeverityWorst === "Severe")
    lines.push("Hold feeding advance until lytes stabilize.");
  return { ref: REFS.aspen2020, lines };
}

function consultTriggers({ patientType, riskLevel }) {
  const consults = [];
  if (riskLevel !== "lower") consults.push("Dietitian");
  if (patientType === "peds") consults.push("Peds nutrition");
  if (riskLevel === "very_high") consults.push("ICU");
  consults.push("Pharmacy (lyte strategy)");
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