// ─────────────────────────────────────────────────────────────────────────
// AND/ASPEN 2014 pediatric malnutrition (undernutrition) grading.
// Becker 2014/2015. Distinct from refeeding-syndrome RISK: this characterizes
// existing under-nutrition severity from anthropometric z-scores and trends.
// Returns the worst indicator (the consensus grades by single most severe).
// ─────────────────────────────────────────────────────────────────────────

const SEV_ORDER = { "None": 0, "Mild": 1, "Moderate": 2, "Severe": 3 };

function gradeZScore(z) {
  if (!isFinite(z)) return null;
  if (z <= PEDS_MALN.z.severe)   return "Severe";
  if (z <= PEDS_MALN.z.moderate) return "Moderate";
  if (z <= PEDS_MALN.z.mild)     return "Mild";
  return "None";
}

// Length/height-for-age: stunting is only a SEVERE indicator at ≤ -3.
function gradeStunting(z) {
  if (!isFinite(z)) return null;
  return z <= PEDS_MALN.stuntSevereZ ? "Severe" : "None";
}

// Weight loss as % of usual body weight (ages 2–20).
function gradeWtLossUBW(pct) {
  if (!isFinite(pct)) return null;
  if (pct >= PEDS_MALN.wtLossUBW.severe)   return "Severe";
  if (pct >= PEDS_MALN.wtLossUBW.moderate) return "Moderate";
  if (pct >= PEDS_MALN.wtLossUBW.mild)     return "Mild";
  return "None";
}

// Weight gain velocity (<2 yr), as % of expected. Lower = worse.
function gradeVelocity(pctOfExpected) {
  if (!isFinite(pctOfExpected)) return null;
  if (pctOfExpected < PEDS_MALN.velocity.severe)   return "Severe";
  if (pctOfExpected < PEDS_MALN.velocity.moderate) return "Moderate";
  if (pctOfExpected < PEDS_MALN.velocity.mild)     return "Mild";
  return "None";
}

// Deceleration: number of z-scores dropped (deceleration in WFL/H z).
function gradeZDecline(zDrop) {
  if (!isFinite(zDrop)) return null;
  if (zDrop >= PEDS_MALN.zDecline.severe)   return "Severe";
  if (zDrop >= PEDS_MALN.zDecline.moderate) return "Moderate";
  if (zDrop >= PEDS_MALN.zDecline.mild)     return "Mild";
  return "None";
}

// Inadequate nutrient intake, as % of estimated need. Lower = worse.
function gradeIntakePct(pctOfNeed) {
  if (!isFinite(pctOfNeed)) return null;
  if (pctOfNeed <= PEDS_MALN.intake.severe)   return "Severe";    // ≤25%
  if (pctOfNeed <= PEDS_MALN.intake.moderate) return "Moderate";  // 26–50%
  if (pctOfNeed <= PEDS_MALN.intake.mild)     return "Mild";      // 51–75%
  return "None";
}

function worst(grades) {
  return grades
    .filter(Boolean)
    .reduce((a, g) => (SEV_ORDER[g] > SEV_ORDER[a] ? g : a), "None");
}

// Build the full pediatric malnutrition assessment.
// `inputs` keys: whz, bmiZ, lhaZ, muacZ (single point); wtLossUBWpct, velocityPct,
// zDecline, intakePctOfNeed (multi-point). Any may be NaN/absent.
function pediatricMalnutrition(inputs) {
  const single = [
    { name: "Weight-for-height z", grade: gradeZScore(inputs.whz), value: inputs.whz },
    { name: "BMI-for-age z", grade: gradeZScore(inputs.bmiZ), value: inputs.bmiZ },
    { name: "MUAC z", grade: gradeZScore(inputs.muacZ), value: inputs.muacZ },
    { name: "Length/height-for-age z (stunting)", grade: gradeStunting(inputs.lhaZ), value: inputs.lhaZ }
  ];
  const multi = [
    { name: "Weight loss (% UBW)", grade: gradeWtLossUBW(inputs.wtLossUBWpct), value: inputs.wtLossUBWpct },
    { name: "Weight gain velocity (% expected)", grade: gradeVelocity(inputs.velocityPct), value: inputs.velocityPct },
    { name: "Deceleration (z-scores dropped)", grade: gradeZDecline(inputs.zDecline), value: inputs.zDecline },
    { name: "Inadequate intake (% of need)", grade: gradeIntakePct(inputs.intakePctOfNeed), value: inputs.intakePctOfNeed }
  ];

  const indicators = [...single, ...multi].filter(x => x.grade !== null);
  const overall = worst(indicators.map(x => x.grade));
  const hasData = indicators.length > 0;
  const multiPoint = multi.some(x => x.grade !== null);

  return {
    indicators,
    single: single.filter(x => x.grade !== null),
    multi: multi.filter(x => x.grade !== null),
    overall: hasData ? overall : null,
    context: multiPoint ? "≥2 data points (trend)" : "single data point",
    ref: REFS.becker2014
  };
}

function malnutritionBadgeClass(grade) {
  if (grade === "Severe") return "bad";
  if (grade === "Moderate" || grade === "Mild") return "warn";
  if (grade === "None") return "ok";
  return "muted";
}
