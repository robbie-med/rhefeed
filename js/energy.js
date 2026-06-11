// ─────────────────────────────────────────────────────────────────────────
// Caloric-needs estimation, energy deficit, and "degree of starvation".
// Every function returns a `work` array: human-readable lines showing the
// formula and the substituted values, so the result is transparent/verifiable.
// ─────────────────────────────────────────────────────────────────────────

function schofieldBand(sex, ageYears) {
  const table = SCHOFIELD[sex === "female" ? "female" : "male"];
  return table.find(band => ageYears < band.maxAge) || table[table.length - 1];
}

// Schofield weight-only BMR (kcal/day). Preferred for pediatrics.
function bmrSchofield(sex, ageYears, weightKg) {
  if (!isFinite(ageYears) || !isFinite(weightKg) || weightKg <= 0) return null;
  const band = schofieldBand(sex, ageYears);
  const value = band.m * weightKg + band.b;
  const sign = band.b < 0 ? "−" : "+";
  return {
    method: "Schofield (weight-only)",
    value,
    ref: REFS.schofield,
    work: [
      `Schofield ${sex}, age band: BMR = ${band.m} × wt ${sign} ${Math.abs(band.b)}`,
      `= ${band.m} × ${weightKg.toFixed(1)} kg ${sign} ${Math.abs(band.b)} = ${Math.round(value)} kcal/day`
    ]
  };
}

// Mifflin–St Jeor REE (kcal/day). Needs height + age; validated in adults.
function bmrMifflin(sex, ageYears, weightKg, heightCm) {
  if (![ageYears, weightKg, heightCm].every(isFinite) || weightKg <= 0 || heightCm <= 0) return null;
  const sexTerm = sex === "female" ? -161 : 5;
  const value = 10 * weightKg + 6.25 * heightCm - 5 * ageYears + sexTerm;
  const sign = sexTerm < 0 ? "−" : "+";
  return {
    method: "Mifflin–St Jeor",
    value,
    ref: REFS.mifflin,
    work: [
      `REE = (10 × wt) + (6.25 × ht) − (5 × age) ${sign} ${Math.abs(sexTerm)} (${sex})`,
      `= (10 × ${weightKg.toFixed(1)}) + (6.25 × ${heightCm.toFixed(0)}) − (5 × ${ageYears.toFixed(0)}) ${sign} ${Math.abs(sexTerm)}`,
      `= ${Math.round(value)} kcal/day`
    ]
  };
}

// Choose the appropriate BMR estimate: Schofield for children (<18 yr),
// Mifflin–St Jeor for adults when height is available (else Schofield).
function estimateBMR({ sex, ageYears, weightKg, heightCm }) {
  const peds = isFinite(ageYears) && ageYears < 18;
  if (peds) return bmrSchofield(sex, ageYears, weightKg);
  if (isFinite(heightCm) && heightCm > 0) return bmrMifflin(sex, ageYears, weightKg, heightCm);
  return bmrSchofield(sex, ageYears, weightKg);
}

// Total energy needs = BMR × activity/stress factor.
function totalEnergyNeeds(bmr, factor) {
  if (!bmr || !isFinite(factor)) return null;
  const value = bmr.value * factor;
  return {
    value,
    work: [...bmr.work, `Needs = BMR × ${factor} = ${Math.round(bmr.value)} × ${factor} = ${Math.round(value)} kcal/day`],
    ref: bmr.ref
  };
}

function intakeAdequacy(pctMet) {
  if (!isFinite(pctMet)) return null;
  if (pctMet > INTAKE_BANDS.adequate) return { grade: "Adequate", cls: "ok" };
  if (pctMet > INTAKE_BANDS.mild)      return { grade: "Mildly inadequate (51–75%)", cls: "warn" };
  if (pctMet > INTAKE_BANDS.moderate)  return { grade: "Moderately inadequate (26–50%)", cls: "warn" };
  return { grade: "Severely inadequate (≤25%)", cls: "bad" };
}

// Energy balance from estimated needs and estimated current intake (kcal/day).
function energyBalance(needsKcal, intakeKcal, daysOfDeficit) {
  if (!isFinite(needsKcal) || needsKcal <= 0 || !isFinite(intakeKcal)) return null;
  const pctMet = (intakeKcal / needsKcal) * 100;
  const dailyDeficit = needsKcal - intakeKcal;
  const cumulative = isFinite(daysOfDeficit) && daysOfDeficit > 0 ? dailyDeficit * daysOfDeficit : NaN;
  return {
    pctMet,
    dailyDeficit,
    cumulative,
    adequacy: intakeAdequacy(pctMet),
    work: [
      `Intake vs needs = ${Math.round(intakeKcal)} ÷ ${Math.round(needsKcal)} = ${pctMet.toFixed(0)}% of needs`,
      `Daily deficit = ${Math.round(needsKcal)} − ${Math.round(intakeKcal)} = ${Math.round(dailyDeficit)} kcal/day`,
      ...(isFinite(cumulative)
        ? [`Cumulative deficit ≈ ${Math.round(dailyDeficit)} × ${daysOfDeficit} day(s) = ${Math.round(cumulative).toLocaleString()} kcal`]
        : [])
    ],
    ref: REFS.aspen2020
  };
}

// WHO adult BMI classification.
function bmiClass(bmi) {
  if (!isFinite(bmi)) return null;
  return BMI_CLASS.find(c => bmi < c.max) || BMI_CLASS[BMI_CLASS.length - 1];
}

// Composite "degree of starvation" descriptor combining BMI thinness,
// % weight loss, and intake adequacy. Qualitative, evidence-aligned summary.
function degreeOfStarvation({ bmi, wtLossPct, pctMet, isPeds }) {
  const drivers = [];
  let score = 0; // 0 none, 1 mild, 2 moderate, 3 severe

  if (!isPeds && isFinite(bmi)) {
    const c = bmiClass(bmi);
    if (c.label === "Severe thinness")  { score = Math.max(score, 3); drivers.push(`BMI ${bmi.toFixed(1)} (severe thinness)`); }
    else if (c.label === "Moderate thinness") { score = Math.max(score, 2); drivers.push(`BMI ${bmi.toFixed(1)} (moderate thinness)`); }
    else if (c.label === "Mild thinness") { score = Math.max(score, 1); drivers.push(`BMI ${bmi.toFixed(1)} (mild thinness)`); }
  }
  if (isFinite(wtLossPct)) {
    if (wtLossPct >= 10)      { score = Math.max(score, 3); drivers.push(`${wtLossPct.toFixed(1)}% weight loss`); }
    else if (wtLossPct >= 7.5){ score = Math.max(score, 2); drivers.push(`${wtLossPct.toFixed(1)}% weight loss`); }
    else if (wtLossPct >= 5)  { score = Math.max(score, 1); drivers.push(`${wtLossPct.toFixed(1)}% weight loss`); }
  }
  if (isFinite(pctMet)) {
    if (pctMet <= 25)      { score = Math.max(score, 3); drivers.push(`intake ≤25% of needs`); }
    else if (pctMet <= 50) { score = Math.max(score, 2); drivers.push(`intake 26–50% of needs`); }
    else if (pctMet <= 75) { score = Math.max(score, 1); drivers.push(`intake 51–75% of needs`); }
  }

  const labels = ["No / minimal undernutrition", "Mild", "Moderate", "Severe"];
  const classes = ["ok", "warn", "warn", "bad"];
  return drivers.length
    ? { label: labels[score], cls: classes[score], drivers }
    : { label: "Insufficient data", cls: "muted", drivers: [] };
}
