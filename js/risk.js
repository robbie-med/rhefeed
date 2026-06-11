// ─────────────────────────────────────────────────────────────────────────
// Refeeding-syndrome RISK stratification. Pure logic, no UI.
// Adult + pediatric ASPEN 2020 criteria, NICE CG32, electrolyte-shift severity,
// and imminent-danger flags. Each grader returns the matched criteria so the
// result can be displayed transparently.
// ─────────────────────────────────────────────────────────────────────────

function calcBMI(weightKg, heightCm) {
  const m = heightCm / 100;
  if (!(m > 0)) return NaN;
  return weightKg / (m * m);
}

function percentDrop(baseline, current) {
  if (!isFinite(baseline) || baseline <= 0 || !isFinite(current)) return NaN;
  return ((baseline - current) / baseline) * 100;
}

function percentWeightLoss(currentKg, usualKg) {
  if (!isFinite(currentKg) || !isFinite(usualKg) || usualKg <= 0) return NaN;
  return ((usualKg - currentKg) / usualKg) * 100;
}

// ── ASPEN 2020 RS severity from electrolyte decrement (any of P/K/Mg) ──────
function rsSeverityFromDrop(dropPct) {
  if (!isFinite(dropPct)) return null;
  if (dropPct > RS_SEVERITY.severePct)   return "Severe";
  if (dropPct >= RS_SEVERITY.moderatePct) return "Moderate";
  if (dropPct >= RS_SEVERITY.mildPct)     return "Mild";
  return "None";
}

// ── ASPEN 2020 ADULT risk (Table 3): moderate = 2 criteria, significant = 1 ─
function aspenAdultRisk(i) {
  const sig = [], mod = [];
  const A = ASPEN_ADULT;

  // BMI
  if (isFinite(i.bmi)) {
    if (i.bmi < A.bmi.significant) sig.push(`BMI ${i.bmi.toFixed(1)} (<16)`);
    else if (i.bmi < A.bmi.moderate) mod.push(`BMI ${i.bmi.toFixed(1)} (16–18.5)`);
  }
  // Weight loss
  if (isFinite(i.wtLossPct)) {
    if (i.wtLossPct >= A.wtLossSig6moPct) sig.push(`Weight loss ${i.wtLossPct.toFixed(1)}% (≥10%/6 mo)`);
    else if (i.wtLossPct >= A.wtLossSig3moPct) sig.push(`Weight loss ${i.wtLossPct.toFixed(1)}% (≥7.5%/3 mo)`);
    else if (i.wtLossPct >= A.wtLossModPct) mod.push(`Weight loss ${i.wtLossPct.toFixed(1)}% (≥5%/1 mo)`);
  }
  // Caloric intake — days of none/negligible intake
  if (isFinite(i.daysNoIntake)) {
    if (i.daysNoIntake > A.intakeNoneSigDays) sig.push(`Negligible intake >7 days`);
    else if (i.daysNoIntake >= A.intakeNoneModDays) mod.push(`Negligible intake 5–6 days`);
  }
  // Caloric intake — % of estimated energy requirement during acute illness
  if (isFinite(i.intakePctMet) && isFinite(i.daysNoIntake)) {
    if (i.intakePctMet < A.intakeSigPctEER && i.daysNoIntake > A.intakeSigDaysAcute)
      sig.push(`<50% of energy needs >5 days`);
    else if (i.intakePctMet < A.intakeModPctEER && i.daysNoIntake > A.intakeModDaysAcute)
      mod.push(`<75% of energy needs >7 days`);
  }
  // Prefeeding electrolytes
  if (i.lytesSignificant) sig.push("Moderately/significantly low pre-feeding K/P/Mg");
  else if (i.lytesMinimal) mod.push("Minimally low / recently low pre-feeding K/P/Mg");
  // Exam findings & comorbidity (clinician-entered)
  if (i.fatLossSevere || i.muscleLossSevere) sig.push("Severe subcutaneous fat / muscle loss");
  else if (i.fatLossMod || i.muscleLossMild) mod.push("Moderate fat / mild–moderate muscle loss");
  if (i.comorbiditySevere) sig.push("Severe higher-risk comorbidity");
  else if (i.comorbidityMod) mod.push("Moderate higher-risk comorbidity");

  let level = "none";
  if (sig.length >= 1) level = "significant";
  else if (mod.length >= 2) level = "moderate";

  return { level, significantCriteria: sig, moderateCriteria: mod, ref: REFS.aspen2020 };
}

// ── ASPEN 2020 PEDIATRIC risk (Table 5): mild=3, moderate=2, significant=1 ──
// Each "category" contributes its highest matched tier. We count categories at
// each tier and apply the threshold rules.
function aspenPedsRisk(i) {
  const P = ASPEN_PEDS;
  const cats = []; // { name, tier } tier in mild|moderate|significant

  const zChange = i.zChangeFromBaseline; // negative z that is a change from baseline
  if (isFinite(zChange)) {
    if (zChange <= P.zSig) cats.push({ name: `z-score Δ ${zChange} (≤−3)`, tier: "significant" });
    else if (zChange <= P.zMod) cats.push({ name: `z-score Δ ${zChange} (−2 to −2.9)`, tier: "moderate" });
    else if (zChange <= P.zMild) cats.push({ name: `z-score Δ ${zChange} (−1 to −1.9)`, tier: "mild" });
  }
  if (isFinite(i.velocityPct)) {
    if (i.velocityPct < P.velSigPct) cats.push({ name: `Weight gain <25% of norm`, tier: "significant" });
    else if (i.velocityPct < P.velModPct) cats.push({ name: `Weight gain <50% of norm`, tier: "moderate" });
    else if (i.velocityPct < P.velMildPct) cats.push({ name: `Weight gain <75% of norm`, tier: "mild" });
  }
  if (isFinite(i.daysLowIntake) && isFinite(i.intakePctMet) && i.intakePctMet < P.intakePctEER) {
    if (i.daysLowIntake > P.intakeSigDays) cats.push({ name: `>7 d intake <75% need`, tier: "significant" });
    else if (i.daysLowIntake >= P.intakeModDays) cats.push({ name: `5–7 d intake <75% need`, tier: "moderate" });
    else if (i.daysLowIntake >= P.intakeMildDays) cats.push({ name: `3–5 d intake <75% need`, tier: "mild" });
  }
  if (i.lytesSignificant) cats.push({ name: "Pre-feeding K/P/Mg 25–50% below LLN", tier: "moderate" });
  else if (i.lytesMinimal) cats.push({ name: "Pre-feeding K/P/Mg up to 25% below LLN", tier: "mild" });
  if (i.comorbiditySevere) cats.push({ name: "Severe comorbidity", tier: "significant" });
  else if (i.comorbidityMod) cats.push({ name: "Moderate comorbidity", tier: "moderate" });
  else if (i.comorbidityMild) cats.push({ name: "Mild comorbidity", tier: "mild" });

  const sig = cats.filter(c => c.tier === "significant");
  const mod = cats.filter(c => c.tier === "moderate");
  const mild = cats.filter(c => c.tier === "mild");

  let level = "none";
  if (sig.length >= 1) level = "significant";
  else if (mod.length >= 2) level = "moderate";
  else if ((mild.length + mod.length + sig.length) >= 3) level = "mild";

  return { level, categories: cats, counts: { sig: sig.length, mod: mod.length, mild: mild.length }, ref: REFS.aspen2020 };
}

// ── NICE CG32 adult high-risk ──────────────────────────────────────────────
function niceHighRiskAdult({ bmi, wtLossPct, daysNoIntake, lowElectrolytes, alcoholOrRiskMeds }) {
  const major = [], minor = [];
  if (isFinite(bmi) && bmi < NICE.major.bmi) major.push("BMI < 16");
  if (isFinite(wtLossPct) && wtLossPct > NICE.major.wtLossPct) major.push("Wt loss > 15% (3–6 mo)");
  if (isFinite(daysNoIntake) && daysNoIntake > NICE.major.daysNoIntake) major.push(">10 d little/no intake");
  if (lowElectrolytes) major.push("Low pre-feeding K/P/Mg");

  if (isFinite(bmi) && bmi < NICE.minor.bmi) minor.push("BMI < 18.5");
  if (isFinite(wtLossPct) && wtLossPct > NICE.minor.wtLossPct) minor.push("Wt loss > 10% (3–6 mo)");
  if (isFinite(daysNoIntake) && daysNoIntake > NICE.minor.daysNoIntake) minor.push(">5 d little/no intake");
  if (alcoholOrRiskMeds) minor.push("Alcohol misuse or risk meds (insulin/chemo/antacids/diuretics)");

  const highRisk = major.length >= 1 || minor.length >= 2;
  const extreme = (isFinite(bmi) && bmi < NICE.extremeBmi) ||
                  (isFinite(daysNoIntake) && daysNoIntake > NICE.extremeDaysNoIntake);
  return { highRisk, extreme, majorFlags: major, minorFlags: minor, ref: REFS.nice };
}

// ── Imminent danger flags ──────────────────────────────────────────────────
function imminentFlags({ phosNow_mmolL, phosDropPct, kDropPct, mgDropPct }) {
  const flags = [];
  if (isFinite(phosNow_mmolL) && phosNow_mmolL <= PHOS_CRITICAL_mmolL)
    flags.push(`Phosphate ≤ ${PHOS_CRITICAL_mmolL} mmol/L (life-threatening)`);
  else if (isFinite(phosNow_mmolL) && phosNow_mmolL <= PHOS_DANGER_mmolL)
    flags.push(`Phosphate ≤ ${PHOS_DANGER_mmolL} mmol/L`);
  if (isFinite(phosDropPct) && phosDropPct > RS_SEVERITY.severePct) flags.push("Phosphate drop > 30%");
  if (isFinite(kDropPct) && kDropPct > RS_SEVERITY.severePct) flags.push("Potassium drop > 30%");
  if (isFinite(mgDropPct) && mgDropPct > RS_SEVERITY.severePct) flags.push("Magnesium drop > 30%");
  return flags;
}

// ── Overall label ──────────────────────────────────────────────────────────
// Combines ASPEN risk tier, electrolyte-shift severity, and imminent flags.
function overallRiskLabel({ aspenLevel, rsSeverityWorst, imminentCount, niceHighRisk }) {
  if (imminentCount > 0 || rsSeverityWorst === "Severe" || aspenLevel === "significant") return "very_high";
  if (aspenLevel === "moderate" || rsSeverityWorst === "Moderate" || niceHighRisk) return "high";
  if (aspenLevel === "mild" || rsSeverityWorst === "Mild") return "moderate";
  return "lower";
}

function labelToBadge(label) {
  if (label === "very_high") return { text: "Very high risk", cls: "bad" };
  if (label === "high")      return { text: "High risk", cls: "warn" };
  if (label === "moderate")  return { text: "Moderate risk", cls: "warn" };
  return { text: "Lower risk", cls: "ok" };
}
