// ─────────────────────────────────────────────────────────────────────────
// Chart-ready plaintext Assessment & Plan generator (ASCII, copy-to-EMR).
// Mirrors the structure of a clinician malnutrition smartphrase and adds the
// refeeding-syndrome risk assessment, energy needs, and management framework.
// ─────────────────────────────────────────────────────────────────────────

function fmt(n, d = 1) { return isFinite(n) ? Number(n).toFixed(d) : "—"; }
function pct(n) { return isFinite(n) ? `${n.toFixed(1)}%` : "—"; }

function ruleLine() { return "----------------------------------------"; }

function severityWord(level) {
  return { significant: "Significant", moderate: "Moderate", mild: "Mild", none: "Not at increased" }[level] || level;
}

// Shared management / plan block.
function planBlock(plan) {
  const L = [];
  L.push("PLAN (framework — individualize to local protocol):");
  if (plan.feed) {
    L.push(`  Nutrition — ${plan.feed.headline}:`);
    plan.feed.lines.forEach(x => L.push(`    - ${x}`));
  }
  L.push(`  Thiamine/vitamins:`);
  L.push(`    - ${plan.thiamine.text}`);
  L.push(`  Monitoring:`);
  plan.monitor.lines.forEach(x => L.push(`    - ${x}`));
  L.push(`  Electrolytes:`);
  plan.electrolytes.lines.forEach(x => L.push(`    - ${x}`));
  L.push(`  Consults:`);
  plan.consults.forEach(x => L.push(`    - ${x}`));
  return L;
}

function energyBlock(energy) {
  const L = [];
  if (!energy || !energy.bmr) return L;
  L.push("ENERGY ASSESSMENT:");
  L.push(`  Estimated BMR (${energy.bmr.method}): ${Math.round(energy.bmr.value)} kcal/day`);
  if (energy.needs) L.push(`  Estimated total needs (×${energy.factor}): ${Math.round(energy.needs.value)} kcal/day`);
  if (energy.balance) {
    L.push(`  Current intake: ${Math.round(energy.intakeKcal)} kcal/day (${energy.balance.pctMet.toFixed(0)}% of needs — ${energy.balance.adequacy.grade})`);
    L.push(`  Daily energy deficit: ${Math.round(energy.balance.dailyDeficit)} kcal/day`);
    if (isFinite(energy.balance.cumulative))
      L.push(`  Estimated cumulative deficit: ${Math.round(energy.balance.cumulative).toLocaleString()} kcal`);
  }
  if (energy.starvation && energy.starvation.drivers.length)
    L.push(`  Degree of undernutrition/starvation: ${energy.starvation.label} (${energy.starvation.drivers.join("; ")})`);
  return L;
}

// ── Adult note ─────────────────────────────────────────────────────────────
function buildAdultNote(d) {
  const L = [];
  L.push("REFEEDING SYNDROME RISK ASSESSMENT (ADULT)");
  L.push(ruleLine());
  L.push(`Setting: ${d.setting.toUpperCase()}`);
  L.push(`Wt: ${fmt(d.weightKg)} kg | Ht: ${fmt(d.heightCm)} cm | BMI: ${fmt(d.bmi)}` +
         (d.bmiClass ? ` (${d.bmiClass.label})` : ""));
  if (isFinite(d.wtLossPct)) L.push(`Weight change: ${pct(d.wtLossPct)} loss from usual weight`);
  L.push(`Days little/no intake: ${isFinite(d.daysNoIntake) ? d.daysNoIntake : "—"}`);
  L.push("");
  L.push(`Phosphate: ${fmt(d.phosBase, 2)} -> ${fmt(d.phosNow, 2)} mmol/L (${d.phosDropLabel})`);
  if (d.kLine) L.push(`Potassium: ${d.kLine}`);
  if (d.mgLine) L.push(`Magnesium: ${d.mgLine}`);
  L.push("");
  L.push(`ASPEN 2020 risk: ${severityWord(d.aspen.level).toUpperCase()} risk`);
  if (d.aspen.significantCriteria.length) L.push(`  Significant criteria: ${d.aspen.significantCriteria.join("; ")}`);
  if (d.aspen.moderateCriteria.length) L.push(`  Moderate criteria: ${d.aspen.moderateCriteria.join("; ")}`);
  L.push(`NICE CG32 high risk: ${d.nice.highRisk ? "YES" : "NO"}${d.nice.extreme ? " (extreme)" : ""}`);
  if (d.nice.majorFlags.length) L.push(`  NICE major: ${d.nice.majorFlags.join(", ")}`);
  if (d.nice.minorFlags.length) L.push(`  NICE minor: ${d.nice.minorFlags.join(", ")}`);
  L.push(`Electrolyte-shift severity (ASPEN): ${d.rsSeverityWorst}`);
  if (d.imminentFlags.length) L.push(`** IMMINENT FLAGS: ${d.imminentFlags.join("; ")} **`);
  L.push("");
  L.push(`OVERALL: ${d.overallBadge.text}`);
  L.push("");
  energyBlock(d.energy).forEach(x => L.push(x));
  L.push("");
  planBlock(d.plan).forEach(x => L.push(x));
  L.push("");
  L.push("Refs: ASPEN 2020 (doi:10.1002/ncp.10474); NICE CG32.");
  L.push("Educational decision support only — individualize to local protocol.");
  return L.join("\n");
}

// ── Pediatric note (malnutrition + refeeding) ──────────────────────────────
function buildPedsNote(d) {
  const L = [];
  L.push("PEDIATRIC NUTRITION ASSESSMENT");
  L.push(ruleLine());
  L.push(`Age: ${fmt(d.ageYears, 1)} yr | Sex: ${d.sex}`);
  L.push(`Wt: ${fmt(d.weightKg)} kg` + (isFinite(d.heightCm) ? ` | Ht/Len: ${fmt(d.heightCm)} cm` : "") +
         (isFinite(d.bmi) ? ` | BMI: ${fmt(d.bmi)}` : ""));
  if (isFinite(d.wtLossPct)) L.push(`Weight change: ${pct(d.wtLossPct)} from usual body weight`);
  L.push("");

  // Malnutrition (AND/ASPEN)
  if (d.maln && d.maln.overall) {
    L.push(`MALNUTRITION (AND/ASPEN, ${d.maln.context}):`);
    d.maln.indicators.forEach(ind =>
      L.push(`  - ${ind.name}: ${ind.grade}${isFinite(ind.value) ? ` (${ind.value})` : ""}`));
    L.push(`  Diagnostic impression: meets criteria for ${d.maln.overall.toUpperCase()} pediatric malnutrition.`);
    L.push("");
  }

  // Refeeding risk (ASPEN peds)
  L.push(`REFEEDING RISK (ASPEN 2020 pediatric): ${severityWord(d.pedsRisk.level).toUpperCase()} risk`);
  if (d.pedsRisk.categories.length)
    d.pedsRisk.categories.forEach(c => L.push(`  - ${c.name} [${c.tier}]`));
  L.push(`Electrolyte-shift severity (ASPEN): ${d.rsSeverityWorst}`);
  if (d.phosBase && d.phosNow)
    L.push(`  Phosphate: ${fmt(d.phosBase, 2)} -> ${fmt(d.phosNow, 2)} mmol/L (${d.phosDropLabel})`);
  if (d.imminentFlags.length) L.push(`** IMMINENT FLAGS: ${d.imminentFlags.join("; ")} **`);
  L.push("");
  L.push(`OVERALL: ${d.overallBadge.text}`);
  L.push("");
  energyBlock(d.energy).forEach(x => L.push(x));
  L.push("");
  planBlock(d.plan).forEach(x => L.push(x));
  L.push("");
  L.push("Refs: ASPEN 2020 (doi:10.1002/ncp.10474); AND/ASPEN peds malnutrition (Becker 2014); Schofield 1985.");
  L.push("Educational decision support only — individualize to local protocol.");
  return L.join("\n");
}
