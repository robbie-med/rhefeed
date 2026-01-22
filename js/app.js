// Grab elements
const $ = (id) => document.getElementById(id);

const el = {
  patientType: $("patientType"),
  setting: $("setting"),

  weight: $("weight"),
  weightUnit: $("weightUnit"),
  height: $("height"),
  heightUnit: $("heightUnit"),
  usualWeight: $("usualWeight"),
  usualWeightUnit: $("usualWeightUnit"),

  daysNoIntake: $("daysNoIntake"),
  intakeBand: $("intakeBand"),
  wtLossWindow: $("wtLossWindow"),

  phosBase: $("phosBase"),
  phosUnit: $("phosUnit"),
  phosNow: $("phosNow"),
  phosUnitNow: $("phosUnitNow"),
  kBase: $("kBase"),
  mgBase: $("mgBase"),
  kNow: $("kNow"),
  mgNow: $("mgNow"),

  albumin: $("albumin"),
  prealbumin: $("prealbumin"),
  lactate: $("lactate"),

  rfAlcohol: $("rfAlcohol"),
  rfDiuretics: $("rfDiuretics"),
  rfInsulin: $("rfInsulin"),
  rfChemo: $("rfChemo"),
  rfAntacids: $("rfAntacids"),
  rfStarvation: $("rfStarvation"),
  rfVomiting: $("rfVomiting"),
  rfEdema: $("rfEdema"),
  rfSystemic: $("rfSystemic"),

  apache: $("apache"),
  sofa: $("sofa"),
  gcs: $("gcs"),

  btnCalc: $("btnCalc"),
  btnCopy: $("btnCopy"),
  btnPrint: $("btnPrint"),
  btnExport: $("btnExport"),
  btnNew: $("btnNew"),

  results: $("results"),
  plan: $("plan"),
  emrBlock: $("emrBlock"),
  status: $("status"),
  refs: $("refs")
};

function getInputs() {
  const weightKg = weightToKg(parseFloat(el.weight.value), el.weightUnit.value);
  const heightCm = heightToCm(parseFloat(el.height.value), el.heightUnit.value);

  const usualKg = el.usualWeight.value
    ? weightToKg(parseFloat(el.usualWeight.value), el.usualWeightUnit.value)
    : NaN;

  const phosBase_mmolL = phosToMmolL(parseFloat(el.phosBase.value), el.phosUnit.value);
  const phosNow_mmolL  = phosToMmolL(parseFloat(el.phosNow.value), el.phosUnitNow.value);

  const kBase = parseFloat(el.kBase.value);
  const mgBase = parseFloat(el.mgBase.value);
  const kNow = el.kNow.value ? parseFloat(el.kNow.value) : NaN;
  const mgNow = el.mgNow.value ? parseFloat(el.mgNow.value) : NaN;

  return {
    patientType: el.patientType.value,
    setting: el.setting.value,
    weightKg, heightCm, usualKg,
    daysNoIntake: parseInt(el.daysNoIntake.value, 10),

    intakeBand: el.intakeBand.value,
    wtLossWindow: el.wtLossWindow.value,

    phosBase_mmolL, phosNow_mmolL,
    kBase, mgBase, kNow, mgNow,

    albumin: el.albumin.value ? parseFloat(el.albumin.value) : NaN,
    prealbumin: el.prealbumin.value ? parseFloat(el.prealbumin.value) : NaN,
    lactate: el.lactate.value ? parseFloat(el.lactate.value) : NaN,

    rfAlcohol: el.rfAlcohol.checked,
    rfDiuretics: el.rfDiuretics.checked,
    rfInsulin: el.rfInsulin.checked,
    rfChemo: el.rfChemo.checked,
    rfAntacids: el.rfAntacids.checked,
    rfStarvation: el.rfStarvation.checked,
    rfVomiting: el.rfVomiting.checked,
    rfEdema: el.rfEdema.checked,
    rfSystemic: el.rfSystemic.checked,

    apache: el.apache.value ? parseInt(el.apache.value, 10) : NaN,
    sofa: el.sofa.value ? parseInt(el.sofa.value, 10) : NaN,
    gcs: el.gcs.value ? parseInt(el.gcs.value, 10) : NaN
  };
}

function validateMinimum(i) {
  const errs = [];
  if (!(isFinite(i.weightKg) && i.weightKg > 0)) errs.push("Weight required");
  if (!(isFinite(i.heightCm) && i.heightCm > 0)) errs.push("Height required");
  if (!(isFinite(i.daysNoIntake) && i.daysNoIntake >= 0)) errs.push("Days of minimal intake required");
  if (!(isFinite(i.phosBase_mmolL) && i.phosBase_mmolL > 0)) errs.push("Baseline phosphate required");
  if (!(isFinite(i.phosNow_mmolL) && i.phosNow_mmolL > 0)) errs.push("Current phosphate required");
  if (!(isFinite(i.kBase) && i.kBase > 0)) errs.push("Baseline potassium required");
  if (!(isFinite(i.mgBase) && i.mgBase > 0)) errs.push("Baseline magnesium required");

  // sanity
  if (isFinite(i.heightCm) && (i.heightCm < 30 || i.heightCm > 250)) errs.push("Height seems out of range");
  if (isFinite(i.weightKg) && (i.weightKg < 1 || i.weightKg > 400)) errs.push("Weight seems out of range");

  return errs;
}

function renderBadges(badges) {
  return badges.map(b => `<span class="badge ${b.cls}">${escapeHtml(b.text)}</span>`).join("");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;" }[m]));
}

function buildEMR(i, computed, risk, plan) {
  const lines = [];
  lines.push("REFEEDING RISK ASSESSMENT");
  lines.push("----------------------------------------");
  lines.push(`Type: ${i.patientType.toUpperCase()} | Setting: ${i.setting.toUpperCase()}`);
  lines.push(`Wt: ${i.weightKg.toFixed(1)} kg | Ht: ${i.heightCm.toFixed(1)} cm | BMI: ${computed.bmi.toFixed(1)}`);
  if (isFinite(computed.wtLossPct)) lines.push(`Wt loss: ${computed.wtLossPct.toFixed(1)}% (${i.wtLossWindow || "window unspecified"})`);
  lines.push(`Minimal intake: ${i.daysNoIntake} day(s) | Intake band: ${i.intakeBand || "n/a"}`);
  lines.push(`P: ${i.phosBase_mmolL.toFixed(2)} -> ${i.phosNow_mmolL.toFixed(2)} mmol/L (drop ${computed.phosDropPct.toFixed(1)}%)`);
  lines.push(`K baseline: ${i.kBase.toFixed(2)} mmol/L${isFinite(i.kNow) ? ` -> ${i.kNow.toFixed(2)} (drop ${computed.kDropPct.toFixed(1)}%)` : ""}`);
  lines.push(`Mg baseline: ${i.mgBase.toFixed(2)} mmol/L${isFinite(i.mgNow) ? ` -> ${i.mgNow.toFixed(2)} (drop ${computed.mgDropPct.toFixed(1)}%)` : ""}`);

  lines.push("");
  lines.push(`Risk label: ${risk.badge.text}`);
  if (risk.imminentFlags.length) lines.push(`Imminent flags: ${risk.imminentFlags.join("; ")}`);
  lines.push(`NICE high risk: ${risk.nice.highRisk ? "YES" : "NO"}`);
  if (risk.nice.majorFlags.length) lines.push(`NICE major: ${risk.nice.majorFlags.join(", ")}`);
  if (risk.nice.minorFlags.length) lines.push(`NICE minor: ${risk.nice.minorFlags.join(", ")}`);
  lines.push(`ASPEN worst electrolyte severity: ${risk.aspenWorst}`);

  if (risk.qualitative.length) {
    lines.push("");
    lines.push(`Other risk factors: ${risk.qualitative.join(", ")}`);
  }

  lines.push("");
  lines.push("PLAN (framework; follow local protocol):");
  if (plan.feed) {
    lines.push(`- Calories: ${plan.feed.start}`);
    lines.push(`- Advance: ${plan.feed.advance}`);
  }
  lines.push(`- Thiamine: ${plan.thiamine}`);
  plan.monitor.forEach(m => lines.push(`- Monitoring: ${m}`));
  plan.electrolytes.forEach(e => lines.push(`- Electrolytes: ${e}`));
  plan.consults.forEach(c => lines.push(`- Consult: ${c}`));

  return lines.join("\n");
}

function computeAll(i) {
  const bmi = calcBMI(i.weightKg, i.heightCm);
  const wtLossPct = isFinite(i.usualKg) ? percentWeightLoss(i.weightKg, i.usualKg) : NaN;

  const phosDropPct = percentDrop(i.phosBase_mmolL, i.phosNow_mmolL);
  const kDropPct = isFinite(i.kNow) ? percentDrop(i.kBase, i.kNow) : NaN;
  const mgDropPct = isFinite(i.mgNow) ? percentDrop(i.mgBase, i.mgNow) : NaN;

  const phosSev = aspenSeverityFromDrop(phosDropPct);
  const kSev = aspenSeverityFromDrop(kDropPct);
  const mgSev = aspenSeverityFromDrop(mgDropPct);

  // pick worst severity among available
  const order = { "Severe": 3, "Moderate": 2, "Mild": 1, "None": 0, null: -1 };
  const worst = [phosSev, kSev, mgSev].reduce((a, b) => (order[b] > order[a] ? b : a), "None");

  return { bmi, wtLossPct, phosDropPct, kDropPct, mgDropPct, phosSev, kSev, mgSev, aspenWorst: worst };
}

function renderReferences() {
  // Plain references; no external calls needed.
  const html = `
    <ul>
      <li><strong>ASPEN</strong>: da Silva JSV, et al. <em>ASPEN consensus recommendations for refeeding syndrome</em>. Nutr Clin Pract. 2020;35(2):178–195.</li>
      <li><strong>NICE</strong>: <em>Nutrition support for adults: oral nutrition support, enteral tube feeding and parenteral nutrition</em>. NICE guideline (original 2006; updated 2017).</li>
      <li><strong>Algorithm paper</strong>: Friedli N, et al. <em>Management and prevention of refeeding syndrome in medical inpatients</em>. Nutrition. 2018;47:13–20.</li>
      <li><strong>Critical illness nomogram</strong>: Jing C, Hou L, Li L, et al. <em>Development and validation of a risk prediction model for refeeding syndrome in adults with critical illness</em>. Clinical Nutrition. 2025;55:282–292.</li>
      <li><strong>NEJM review you cited</strong>: If you paste the NEJM review PDF/text, this tool can link to exact sections/criteria you want embedded.</li>
    </ul>
  `;
  el.refs.innerHTML = html;
}

function run() {
  el.status.textContent = "";
  const i = getInputs();

  const errs = validateMinimum(i);
  if (errs.length) {
    el.status.textContent = "Fix required fields: " + errs.join(" · ");
    el.status.style.color = "var(--bad)";
    return;
  }

  // Autosave snapshot
  saveState(collectFormState());

  const computed = computeAll(i);

  const lowElectrolytes = (i.kBase < 3.5) || (i.mgBase < 0.7) || (i.phosBase_mmolL < 0.8); // heuristic only
  const alcoholOrRiskMeds = i.rfAlcohol || i.rfDiuretics || i.rfInsulin || i.rfChemo || i.rfAntacids;

  const nice = niceHighRiskAdult({
    bmi: computed.bmi,
    wtLossPct: computed.wtLossPct,
    daysNoIntake: i.daysNoIntake,
    lowElectrolytes,
    alcoholOrRiskMeds
  });

  const imminentFlagsArr = imminentFlags({
    phosNow_mmolL: i.phosNow_mmolL,
    phosDropPct: computed.phosDropPct,
    kDropPct: computed.kDropPct,
    mgDropPct: computed.mgDropPct
  });

  const riskLabel = overallRiskLabel(nice.highRisk, computed.aspenWorst, imminentFlagsArr);
  const badge = labelToBadge(riskLabel);

  const qualitative = qualitativeRiskFactors(i, computed.bmi, computed.wtLossPct);

  const plan = buildPlan({
    patientType: i.patientType,
    setting: i.setting,
    weightKg: i.weightKg,
    riskLabel,
    nice,
    aspenWorst: computed.aspenWorst,
    imminentFlagsArr
  });

  // Results UI
  const kpis = `
    <div class="kpiRow">
      <div class="kpi"><div class="label">BMI</div><div class="value">${computed.bmi.toFixed(1)}</div></div>
      <div class="kpi"><div class="label">Phos drop</div><div class="value">${computed.phosDropPct.toFixed(1)}%</div></div>
      <div class="kpi"><div class="label">ASPEN worst severity</div><div class="value">${escapeHtml(computed.aspenWorst)}</div></div>
      <div class="kpi"><div class="label">Overall</div><div class="value">${renderBadges([badge])}</div></div>
    </div>
  `;

  const flagsHtml = `
    <div>
      ${renderBadges(imminentFlagsArr.map(x => ({ text: x, cls: "bad" })))}
      ${nice.highRisk ? `<span class="badge warn">NICE high risk</span>` : `<span class="badge ok">NICE not-high</span>`}
      ${qualitative.slice(0, 8).map(x => `<span class="badge warn">${escapeHtml(x)}</span>`).join("")}
    </div>
  `;

  const niceHtml = `
    <h3>NICE criteria (adult)</h3>
    <ul>
      <li>Major flags: ${nice.majorFlags.length ? escapeHtml(nice.majorFlags.join("; ")) : "none"}</li>
      <li>Minor flags: ${nice.minorFlags.length ? escapeHtml(nice.minorFlags.join("; ")) : "none"}</li>
    </ul>
  `;

  const aspenHtml = `
    <h3>ASPEN electrolyte shift severity</h3>
    <ul>
      <li>Phosphate: ${escapeHtml(computed.phosSev)} (${computed.phosDropPct.toFixed(1)}%)</li>
      <li>Potassium: ${isFinite(computed.kDropPct) ? `${escapeHtml(computed.kSev)} (${computed.kDropPct.toFixed(1)}%)` : "n/a (enter current K)"}</li>
      <li>Magnesium: ${isFinite(computed.mgDropPct) ? `${escapeHtml(computed.mgSev)} (${computed.mgDropPct.toFixed(1)}%)` : "n/a (enter current Mg)"}</li>
    </ul>
  `;

  el.results.innerHTML = kpis + flagsHtml + niceHtml + aspenHtml;

  // Plan UI
  const planHtml = `
    <h3>Nutrition</h3>
    <ul>
      <li>${escapeHtml(plan.feed?.start || "n/a")}</li>
      <li>${escapeHtml(plan.feed?.advance || "n/a")}</li>
    </ul>

    <h3>Thiamine / vitamins</h3>
    <p>${escapeHtml(plan.thiamine)}</p>

    <h3>Monitoring</h3>
    <ul>${plan.monitor.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>

    <h3>Electrolytes (framework)</h3>
    <ul>${plan.electrolytes.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>

    <h3>Consult triggers</h3>
    <ul>${plan.consults.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
  `;
  el.plan.innerHTML = planHtml;

  // EMR block
  const emr = buildEMR(
    i,
    computed,
    { badge, imminentFlags: imminentFlagsArr, nice, aspenWorst: computed.aspenWorst, qualitative },
    plan
  );
  el.emrBlock.textContent = emr;

  el.status.textContent = "Done.";
  el.status.style.color = "var(--ok)";
}

function collectFormState() {
  // Save raw form fields to restore later
  const ids = [
    "patientType","setting",
    "weight","weightUnit","height","heightUnit","usualWeight","usualWeightUnit",
    "daysNoIntake","intakeBand","wtLossWindow",
    "phosBase","phosUnit","phosNow","phosUnitNow","kBase","mgBase","kNow","mgNow",
    "albumin","prealbumin","lactate",
    "apache","sofa","gcs"
  ];
  const checks = [
    "rfAlcohol","rfDiuretics","rfInsulin","rfChemo","rfAntacids","rfStarvation","rfVomiting","rfEdema","rfSystemic"
  ];

  const state = {};
  ids.forEach(id => state[id] = $(id).value);
  checks.forEach(id => state[id] = $(id).checked);
  return state;
}

function restoreFormState(state) {
  if (!state) return;
  Object.keys(state).forEach(k => {
    const node = $(k);
    if (!node) return;
    if (node.type === "checkbox") node.checked = !!state[k];
    else node.value = state[k];
  });
}

function exportJSON() {
  const i = getInputs();
  const computed = computeAll(i);
  const payload = {
    timestampISO: new Date().toISOString(),
    inputs: i,
    computed
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "refeeding-risk-export.json";
  a.click();
  URL.revokeObjectURL(url);
}

function copyEMR() {
  const text = el.emrBlock.textContent || "";
  navigator.clipboard.writeText(text).then(() => {
    el.status.textContent = "Copied.";
    el.status.style.color = "var(--ok)";
  }).catch(() => {
    el.status.textContent = "Copy failed (browser restriction).";
    el.status.style.color = "var(--warn)";
  });
}

function newPatient() {
  clearState();
  location.reload();
}

// Wire up
el.btnCalc.addEventListener("click", run);
el.btnCopy.addEventListener("click", copyEMR);
el.emrBlock.addEventListener("click", copyEMR);
el.btnPrint.addEventListener("click", () => window.print());
el.btnExport.addEventListener("click", exportJSON);
el.btnNew.addEventListener("click", newPatient);

// Autosave on change (lightweight)
document.addEventListener("input", () => saveState(collectFormState()));

// Restore
restoreFormState(loadState());
renderReferences();
