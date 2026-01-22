function calcBMI(weightKg, heightCm) {
  const m = heightCm / 100;
  if (m <= 0) return NaN;
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

function aspenSeverityFromDrop(dropPct) {
  if (!isFinite(dropPct)) return null;
  if (dropPct >= THRESH.phosDropSeverePct) return "Severe";
  if (dropPct >= THRESH.phosDropModeratePct) return "Moderate";
  if (dropPct >= THRESH.phosDropMildPct) return "Mild";
  return "None";
}

function niceHighRiskAdult({ bmi, wtLossPct, daysNoIntake, lowElectrolytes, alcoholOrRiskMeds }) {
  // NICE: high risk if ANY one major OR any two minor.
  const majorFlags = [];
  const minorFlags = [];

  if (isFinite(bmi) && bmi < NICE.major.bmi) majorFlags.push("BMI < 16");
  if (isFinite(wtLossPct) && wtLossPct > NICE.major.wtLossPct) majorFlags.push("Wt loss > 15% (3–6 mo)");
  if (isFinite(daysNoIntake) && daysNoIntake > NICE.major.daysNoIntake) majorFlags.push(">10 d little/no intake");
  if (lowElectrolytes) majorFlags.push("Low baseline K/P/Mg");

  if (isFinite(bmi) && bmi < NICE.minor.bmi) minorFlags.push("BMI < 18.5");
  if (isFinite(wtLossPct) && wtLossPct > NICE.minor.wtLossPct) minorFlags.push("Wt loss > 10% (3–6 mo)");
  if (isFinite(daysNoIntake) && daysNoIntake > NICE.minor.daysNoIntake) minorFlags.push(">5 d little/no intake");
  if (alcoholOrRiskMeds) minorFlags.push("Alcohol misuse or risk meds (insulin/chemo/antacids/diuretics)");

  const highRisk = majorFlags.length >= 1 || minorFlags.length >= 2;

  return { highRisk, majorFlags, minorFlags };
}

function imminentFlags({ phosNow_mmolL, phosDropPct, kDropPct, mgDropPct }) {
  const flags = [];

  if (isFinite(phosNow_mmolL) && phosNow_mmolL <= THRESH.phosImminent_mmolL) {
    flags.push(`Phosphate ≤ ${THRESH.phosImminent_mmolL} mmol/L`);
  }
  if (isFinite(phosDropPct) && phosDropPct >= 30) flags.push("Phosphate drop ≥ 30%");

  // Optional: if K/Mg drops are available
  if (isFinite(kDropPct) && kDropPct >= 30) flags.push("Potassium drop ≥ 30%");
  if (isFinite(mgDropPct) && mgDropPct >= 30) flags.push("Magnesium drop ≥ 30%");

  return flags;
}

function qualitativeRiskFactors(inputs, bmi, wtLossPct) {
  const r = [];

  if (inputs.rfStarvation) r.push("Starvation / eating disorder");
  if (isFinite(bmi) && bmi < 16) r.push("Very low BMI");
  if (isFinite(wtLossPct) && wtLossPct > 10) r.push("Significant weight loss");
  if (inputs.daysNoIntake >= 5) r.push("Prolonged minimal intake");
  if (inputs.rfAlcohol) r.push("Alcohol misuse");
  if (inputs.rfDiuretics) r.push("Diuretic use");
  if (inputs.rfInsulin) r.push("Insulin use");
  if (inputs.rfChemo) r.push("Recent chemotherapy");
  if (inputs.rfAntacids) r.push("Antacid use");
  if (inputs.rfVomiting) r.push("Vomiting");
  if (inputs.rfEdema) r.push("Edema / fluid overload");
  if (inputs.rfSystemic) r.push("Life-threatening systemic disease");
  if (isFinite(inputs.apache) && inputs.apache >= 20) r.push("High APACHE II");
  if (isFinite(inputs.sofa) && inputs.sofa >= 8) r.push("High SOFA");
  if (isFinite(inputs.gcs) && inputs.gcs <= 8) r.push("Low GCS");

  return r;
}
