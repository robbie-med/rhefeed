function feedingStartRecommendation(patientType, riskLevel, weightKg) {
  // Non-prescriptive guidance: kcal/kg/day bands + advance window
  if (!isFinite(weightKg) || weightKg <= 0) return null;

  // Pediatrics: conservative messaging + local protocol
  if (patientType === "peds") {
    return {
      headline: "Pediatrics: use local protocol / nutrition team",
      start: "Consider conservative initiation if high risk; coordinate with peds nutrition/pharmacy.",
      advance: `Advance gradually over ~${FEEDING.advance_days_min}–${FEEDING.advance_days_max} days with close electrolyte monitoring.`,
      kcalRange: null
    };
  }

  // Adults:
  let startKcalPerKg = FEEDING.start_kcalPerKg_standardHighRisk;
  if (riskLevel === "very_high") startKcalPerKg = FEEDING.start_kcalPerKg_low;

  const startTotal = Math.round(startKcalPerKg * weightKg);
  return {
    headline: "Initial calories",
    start: `Start ~${startKcalPerKg} kcal/kg/day (≈ ${startTotal} kcal/day) and avoid rapid escalation.`,
    advance: `Advance toward goal over ~${FEEDING.advance_days_min}–${FEEDING.advance_days_max} days if electrolytes stable.`,
    kcalRange: { kcalPerKg: startKcalPerKg, kcalPerDay: startTotal }
  };
}

function monitoringRecommendation(setting, riskFlagsCount) {
  // Escalate monitoring if ICU or high-risk flags present.
  const isICU = setting === "icu";
  const high = riskFlagsCount >= 2;

  if (isICU || high) {
    return [
      "Check K/Mg/Phos at least q12–24h for first 72h (more frequent if unstable or repleting aggressively).",
      "Consider telemetry if severe electrolyte derangements, arrhythmia risk, or severe RS features.",
      "Strict I/O and daily weights; avoid fluid overload in high-risk patients."
    ];
  }
  return [
    "Check K/Mg/Phos daily for first 72h (increase frequency if falling or repletion needed).",
    "Daily weights and I/O; reassess volume status frequently."
  ];
}

function thiamineRecommendation(patientType, highRisk) {
  if (!highRisk) {
    return "Consider thiamine supplementation in at-risk patients; follow local protocol.";
  }
  if (patientType === "peds") {
    return "High risk: ensure thiamine supplementation per pediatric protocol (dose varies by age/weight).";
  }
  return "High risk: give thiamine before/with calories (commonly 100–300 mg/day) per local protocol; consider multivitamin.";
}

function electrolyteFramework(severity, imminent) {
  // Purposefully non-prescriptive: prompts + consult triggers, avoids dosing tables.
  const lines = [];

  if (imminent) {
    lines.push("Urgent: treat electrolyte abnormalities promptly; consider ICU/telemetry depending on context.");
  }

  lines.push("Replete phosphate/potassium/magnesium proactively if low or trending down; recheck after repletion.");
  lines.push("If repeated/rapidly falling electrolytes, slow calorie advancement and reassess insulin/glucose load.");
  lines.push("Consider nutrition support team + pharmacy involvement for aggressive repletion strategies.");

  if (severity === "Severe") {
    lines.push("Severe ASPEN-category electrolyte shift: strong consideration for higher-acuity monitoring and slower advancement.");
  }

  return lines;
}

function overallRiskLabel(niceHighRisk, aspenWorstSeverity, imminentFlagsArr) {
  // Very high: imminent flags OR severe ASPEN shift
  if (imminentFlagsArr.length > 0 || aspenWorstSeverity === "Severe") return "very_high";
  if (niceHighRisk || aspenWorstSeverity === "Moderate") return "high";
  if (aspenWorstSeverity === "Mild") return "moderate";
  return "lower";
}

function labelToBadge(label) {
  if (label === "very_high") return { text: "Very high risk", cls: "bad" };
  if (label === "high") return { text: "High risk", cls: "warn" };
  if (label === "moderate") return { text: "Moderate risk", cls: "warn" };
  return { text: "Lower risk", cls: "ok" };
}

function buildPlan({ patientType, setting, weightKg, riskLabel, nice, aspenWorst, imminentFlagsArr }) {
  const highRisk = (riskLabel === "very_high" || riskLabel === "high" || riskLabel === "moderate");

  const feed = feedingStartRecommendation(patientType, riskLabel === "very_high" ? "very_high" : "high", weightKg);
  const monitor = monitoringRecommendation(setting, (nice.majorFlags.length + nice.minorFlags.length) + imminentFlagsArr.length);
  const thiamine = thiamineRecommendation(patientType, highRisk);
  const electrolytes = electrolyteFramework(aspenWorst, imminentFlagsArr.length > 0);

  // Add consult triggers
  const consults = [];
  if (riskLabel !== "lower") consults.push("Consider nutrition support / dietitian consult at initiation.");
  if (riskLabel === "very_high") consults.push("Consider ICU/telemetry assessment depending on hemodynamics and electrolyte severity.");
  consults.push("Consider pharmacy support for repletion strategy and drug interactions (e.g., diuretics/insulin).");

  return { feed, monitor, thiamine, electrolytes, consults };
}
