// ─────────────────────────────────────────────────────────────────────────
// UI wiring. Owns rendering and interaction only — all clinical thresholds and
// computation live in constants/energy/malnutrition/risk/plan/note.
// ─────────────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;" }[m]));
}
function num(id) { const v = parseFloat($(id).value); return isFinite(v) ? v : NaN; }
function intVal(id) { const v = parseInt($(id).value, 10); return isFinite(v) ? v : NaN; }
function checked(id) { const n = $(id); return n ? n.checked : false; }
function dropLabel(pct) {
  if (!isFinite(pct)) return "n/a";
  const sign = pct >= 0 ? "−" : "+";
  return `${sign}${Math.abs(pct).toFixed(1)}%`;
}

// ── Pane navigation ────────────────────────────────────────
$$(".pane-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    const pane = tab.dataset.pane;
    $$(".pane-tab").forEach(t => {
      const on = t === tab;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    $$("[data-pane-body]").forEach(b =>
      b.classList.toggle("hidden", b.dataset.paneBody !== pane));
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// ── Populate factor selects ────────────────────────────────
function fillFactors(id) {
  $(id).innerHTML = ENERGY_FACTORS.map((f, idx) =>
    `<option value="${f.value}" ${idx === 1 ? "selected" : ""}>${f.label}</option>`).join("");
}
fillFactors("a_factor");
fillFactors("p_factor");

// ── Toast ──────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const t = $("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

// ── Transparency helpers ───────────────────────────────────
function refLink(ref) {
  if (!ref) return "";
  return `<a href="${ref.url}" target="_blank" rel="noopener">${escapeHtml(ref.label)} ↗</a>`;
}
function calcDetails(summary, workLines, ref) {
  const body = (workLines || []).map(l => `<div class="work-line">${escapeHtml(l)}</div>`).join("");
  return `<details class="calc">
    <summary>${escapeHtml(summary)}</summary>
    <div class="calc-body">${body}${ref ? `<div class="work-ref">Source: ${refLink(ref)}</div>` : ""}</div>
  </details>`;
}

// ── Shared energy computation ──────────────────────────────
function computeEnergy({ sex, ageYears, weightKg, heightCm, factor, intakeKcal, daysOfDeficit, bmi, wtLossPct, isPeds }) {
  const bmr = estimateBMR({ sex, ageYears, weightKg, heightCm });
  if (!bmr) return null;
  const needs = totalEnergyNeeds(bmr, factor);
  const balance = isFinite(intakeKcal) ? energyBalance(needs.value, intakeKcal, daysOfDeficit) : null;
  const pctMet = balance ? balance.pctMet : NaN;
  const starvation = degreeOfStarvation({ bmi, wtLossPct, pctMet, isPeds });
  return { bmr, needs, balance, factor, intakeKcal, starvation };
}

function renderEnergy(energy) {
  if (!energy) return "";
  let html = `<h3>Caloric needs &amp; energy balance</h3><div class="kpiRow">`;
  html += `<div class="kpi"><div class="label">BMR</div><div class="value">${Math.round(energy.bmr.value)}</div><div class="label">${escapeHtml(energy.bmr.method)}</div></div>`;
  html += `<div class="kpi"><div class="label">Est. needs</div><div class="value">${Math.round(energy.needs.value)}</div><div class="label">kcal/day ×${energy.factor}</div></div>`;
  if (energy.balance)
    html += `<div class="kpi"><div class="label">Intake</div><div class="value">${energy.balance.pctMet.toFixed(0)}%</div><div class="label">of needs</div></div>`;
  html += `</div>`;
  html += calcDetails("Show calculation — BMR & needs", energy.needs.work, energy.needs.ref);
  if (energy.balance) {
    html += `<ul><li>Intake adequacy: <span class="badge ${energy.balance.adequacy.cls}">${escapeHtml(energy.balance.adequacy.grade)}</span></li>`;
    html += `<li>Daily deficit: <strong>${Math.round(energy.balance.dailyDeficit)}</strong> kcal/day</li>`;
    if (isFinite(energy.balance.cumulative))
      html += `<li>Estimated cumulative deficit: <strong>${Math.round(energy.balance.cumulative).toLocaleString()}</strong> kcal</li>`;
    html += `</ul>`;
    html += calcDetails("Show calculation — energy deficit", energy.balance.work, energy.balance.ref);
  }
  if (energy.starvation.drivers.length) {
    html += `<h3>Degree of undernutrition / starvation</h3>`;
    html += `<p><span class="badge ${energy.starvation.cls}">${escapeHtml(energy.starvation.label)}</span></p>`;
    html += `<ul>${energy.starvation.drivers.map(d => `<li>${escapeHtml(d)}</li>`).join("")}</ul>`;
  }
  return html;
}

function renderPlan(plan) {
  let html = `<h3>Nutrition — ${escapeHtml(plan.feed.headline)}</h3><ul>`;
  html += plan.feed.lines.map(x => `<li>${escapeHtml(x)}</li>`).join("");
  html += `</ul><div class="work-ref">Source: ${refLink(plan.feed.ref)}</div>`;
  html += `<h3>Thiamine / vitamins</h3><p>${escapeHtml(plan.thiamine.text)}</p>`;
  html += `<h3>Monitoring</h3><ul>${plan.monitor.lines.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;
  html += `<h3>Electrolytes (framework)</h3><ul>${plan.electrolytes.lines.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;
  html += `<h3>Consult triggers</h3><ul>${plan.consults.map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;
  return html;
}

function renderResults(container, { heroBadge, heroSub, sections, plan, noteText }) {
  let html = `<section class="card"><p class="card-title">Risk assessment</p>`;
  html += `<div class="hero-verdict ${heroBadge.cls}"><div><div class="verdict-label">Overall</div><div class="verdict-text">${escapeHtml(heroBadge.text)}</div></div><div>${heroSub}</div></div>`;
  html += `<div class="result-section">${sections}</div></section>`;
  html += `<section class="card"><p class="card-title">Management guidance</p><div class="result-section">${renderPlan(plan)}</div></section>`;
  html += `<section class="card"><p class="card-title">Assessment &amp; Plan — copy to chart</p>`;
  html += `<p class="disclaimer" style="margin-bottom:.5rem">ASCII-only. Click to copy.</p>`;
  html += `<pre class="copybox" data-copy tabindex="0" role="button">${escapeHtml(noteText)}</pre>`;
  html += `<div style="margin-top:.6rem"><button class="btn outline" data-copybtn>Copy block</button></div></section>`;
  container.innerHTML = html;

  const pre = container.querySelector("[data-copy]");
  const copy = () => {
    navigator.clipboard.writeText(noteText)
      .then(() => showToast("Copied to clipboard"))
      .catch(() => showToast("Copy failed — long-press to select"));
  };
  pre.addEventListener("click", copy);
  container.querySelector("[data-copybtn]").addEventListener("click", copy);
  container.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── ADULT calculate ────────────────────────────────────────
function runAdult() {
  const status = document.querySelector('[data-status="adult"]');
  const weightKg = weightToKg(num("a_weight"), $("a_weightUnit").value);
  const heightCm = heightToCm(num("a_height"), $("a_heightUnit").value);
  const usualKg  = $("a_usualWeight").value ? weightToKg(num("a_usualWeight"), $("a_usualWeightUnit").value) : NaN;
  const phosBase = phosToMmolL(num("a_phosBase"), $("a_phosUnit").value);
  const phosNow  = phosToMmolL(num("a_phosNow"), $("a_phosUnitNow").value);
  const kBase = num("a_kBase"), mgBase = num("a_mgBase");
  const kNow = $("a_kNow").value ? num("a_kNow") : NaN;
  const mgNow = $("a_mgNow").value ? num("a_mgNow") : NaN;
  const daysNoIntake = intVal("a_daysNoIntake");
  const intakeKcal = $("a_intakeKcal").value ? num("a_intakeKcal") : NaN;
  const ageYears = $("a_age").value ? num("a_age") : 40;
  const sex = $("a_sex").value;
  const factor = parseFloat($("a_factor").value);

  const errs = [];
  if (!(weightKg > 0)) errs.push("weight");
  if (!(heightCm > 0)) errs.push("height");
  if (!(daysNoIntake >= 0)) errs.push("days of intake");
  if (!(phosBase > 0)) errs.push("baseline P");
  if (!(phosNow > 0)) errs.push("current P");
  if (!(kBase > 0)) errs.push("baseline K");
  if (!(mgBase > 0)) errs.push("baseline Mg");
  if (errs.length) { status.textContent = "Required: " + errs.join(", "); status.style.color = "var(--bad)"; return; }

  const bmi = calcBMI(weightKg, heightCm);
  const wtLossPct = isFinite(usualKg) ? percentWeightLoss(weightKg, usualKg) : NaN;
  const phosDropPct = percentDrop(phosBase, phosNow);
  const kDropPct = percentDrop(kBase, kNow);
  const mgDropPct = percentDrop(mgBase, mgNow);
  const rsSeverityWorst = ["Severe","Moderate","Mild","None"].find(s =>
    [rsSeverityFromDrop(phosDropPct), rsSeverityFromDrop(kDropPct), rsSeverityFromDrop(mgDropPct)].includes(s)) || "None";

  const energy = computeEnergy({ sex, ageYears, weightKg, heightCm, factor, intakeKcal, daysOfDeficit: daysNoIntake, bmi, wtLossPct, isPeds: false });
  const pctMet = energy && energy.balance ? energy.balance.pctMet : NaN;

  const lytesMinimal = (kBase < 3.5) || (mgBase < 0.7) || (phosBase < 0.8);
  const lytesSignificant = (kBase < 3.0) || (mgBase < 0.5) || (phosBase < 0.6);
  const aspen = aspenAdultRisk({
    bmi, wtLossPct, daysNoIntake, intakePctMet: pctMet,
    lytesMinimal, lytesSignificant,
    fatLossMod: checked("a_fatLossMod"), fatLossSevere: checked("a_fatLossSevere"),
    muscleLossMild: checked("a_muscleLossMild"), muscleLossSevere: checked("a_muscleLossSevere"),
    comorbidityMod: checked("a_comorbidityMod"), comorbiditySevere: checked("a_comorbiditySevere")
  });
  const nice = niceHighRiskAdult({
    bmi, wtLossPct, daysNoIntake,
    lowElectrolytes: lytesMinimal,
    alcoholOrRiskMeds: checked("a_rfAlcohol") || checked("a_rfDiuretics") || checked("a_rfInsulin") || checked("a_rfChemo") || checked("a_rfAntacids")
  });
  const imminent = imminentFlags({ phosNow_mmolL: phosNow, phosDropPct, kDropPct, mgDropPct });
  const riskLabel = overallRiskLabel({ aspenLevel: aspen.level, rsSeverityWorst, imminentCount: imminent.length, niceHighRisk: nice.highRisk });
  const badge = labelToBadge(riskLabel);
  const bmiC = bmiClass(bmi);

  const plan = buildPlan({ patientType: "adult", setting: $("a_setting").value, weightKg, riskLevel: riskLabel, niceExtreme: nice.extreme, rsSeverityWorst, imminent: imminent.length > 0 });

  // Sections HTML
  let sections = `<div class="kpiRow">
    <div class="kpi"><div class="label">BMI</div><div class="value">${bmi.toFixed(1)}</div><div class="label">${escapeHtml(bmiC.label)}</div></div>
    <div class="kpi"><div class="label">Phos shift</div><div class="value">${dropLabel(phosDropPct)}</div><div class="label">${escapeHtml(rsSeverityFromDrop(phosDropPct) || "n/a")}</div></div>
    <div class="kpi"><div class="label">Wt loss</div><div class="value">${isFinite(wtLossPct) ? dropLabel(wtLossPct) : "—"}</div></div>
  </div>`;
  sections += calcDetails("Show calculation — BMI", [`BMI = wt ÷ height² = ${weightKg.toFixed(1)} ÷ (${(heightCm/100).toFixed(2)})² = ${bmi.toFixed(1)} kg/m²`, `WHO band: ${bmiC.label}`], REFS.whoBmi);
  sections += `<h3>ASPEN 2020 adult risk</h3><p><span class="badge ${badge.cls}">${escapeHtml(aspen.level === "none" ? "Not at increased risk" : aspen.level + " risk")}</span></p><ul>`;
  sections += aspen.significantCriteria.map(c => `<li>Significant: ${escapeHtml(c)}</li>`).join("");
  sections += aspen.moderateCriteria.map(c => `<li>Moderate: ${escapeHtml(c)}</li>`).join("");
  if (!aspen.significantCriteria.length && !aspen.moderateCriteria.length) sections += `<li>No ASPEN criteria met</li>`;
  sections += `</ul><div class="work-ref">Source: ${refLink(aspen.ref)} — Significant = any 1 criterion; Moderate = any 2.</div>`;
  sections += `<h3>NICE CG32 (adult)</h3><ul><li>High risk: <strong>${nice.highRisk ? "YES" : "NO"}</strong>${nice.extreme ? " (extreme — start 5 kcal/kg/day)" : ""}</li>`;
  sections += `<li>Major: ${nice.majorFlags.length ? escapeHtml(nice.majorFlags.join("; ")) : "none"}</li>`;
  sections += `<li>Minor: ${nice.minorFlags.length ? escapeHtml(nice.minorFlags.join("; ")) : "none"}</li></ul>`;
  sections += `<h3>Electrolyte-shift severity (ASPEN)</h3><ul>
    <li>Phosphate: ${escapeHtml(rsSeverityFromDrop(phosDropPct) || "n/a")} (${dropLabel(phosDropPct)})</li>
    <li>Potassium: ${isFinite(kDropPct) ? `${escapeHtml(rsSeverityFromDrop(kDropPct))} (${dropLabel(kDropPct)})` : "enter current K"}</li>
    <li>Magnesium: ${isFinite(mgDropPct) ? `${escapeHtml(rsSeverityFromDrop(mgDropPct))} (${dropLabel(mgDropPct)})` : "enter current Mg"}</li></ul>`;
  sections += calcDetails("Show calculation — electrolyte % drop", [`% drop = (baseline − current) ÷ baseline × 100`, `Phosphate: (${phosBase.toFixed(2)} − ${phosNow.toFixed(2)}) ÷ ${phosBase.toFixed(2)} × 100 = ${dropLabel(phosDropPct)}`, `Severity bands: mild 10–20%, moderate 20–30%, severe >30% (within 5 days)`], REFS.aspen2020);
  sections += renderEnergy(energy);

  const heroSub = `${imminent.map(x => `<span class="badge bad">${escapeHtml(x)}</span>`).join("")}
    ${nice.highRisk ? `<span class="badge warn">NICE high risk</span>` : ""}
    <span class="badge ${badge.cls}">ASPEN: ${escapeHtml(aspen.level)}</span>
    <span class="badge ${badge.cls}">Shift: ${escapeHtml(rsSeverityWorst)}</span>`;

  const noteText = buildAdultNote({
    setting: $("a_setting").value, weightKg, heightCm, bmi, bmiClass: bmiC, wtLossPct, daysNoIntake,
    phosBase, phosNow, phosDropLabel: dropLabel(phosDropPct),
    kLine: isFinite(kNow) ? `${kBase.toFixed(2)} -> ${kNow.toFixed(2)} (${dropLabel(kDropPct)})` : null,
    mgLine: isFinite(mgNow) ? `${mgBase.toFixed(2)} -> ${mgNow.toFixed(2)} (${dropLabel(mgDropPct)})` : null,
    aspen, nice, rsSeverityWorst, imminentFlags: imminent, overallBadge: badge,
    energy: energy ? { bmr: energy.bmr, needs: energy.needs, factor: energy.factor, intakeKcal: energy.intakeKcal, balance: energy.balance, starvation: energy.starvation } : null,
    plan
  });

  renderResults(document.querySelector('[data-results="adult"]'), { heroBadge: badge, heroSub, sections, plan, noteText });
  status.textContent = "Done."; status.style.color = "var(--ok)";
  saveAll();
}

// ── PEDIATRIC calculate ────────────────────────────────────
function runPeds() {
  const status = document.querySelector('[data-status="peds"]');
  const sex = $("p_sex").value;
  const ageYears = ageToYears(num("p_age"), $("p_ageUnit").value);
  const weightKg = weightToKg(num("p_weight"), $("p_weightUnit").value);
  const heightCm = $("p_height").value ? heightToCm(num("p_height"), $("p_heightUnit").value) : NaN;
  const usualKg  = $("p_usualWeight").value ? weightToKg(num("p_usualWeight"), $("p_usualWeightUnit").value) : NaN;
  const factor = parseFloat($("p_factor").value);
  const intakeKcal = $("p_intakeKcal").value ? num("p_intakeKcal") : NaN;
  const daysLowIntake = $("p_daysLowIntake").value ? intVal("p_daysLowIntake") : NaN;

  const errs = [];
  if (!(ageYears > 0)) errs.push("age");
  if (!(weightKg > 0)) errs.push("weight");
  if (errs.length) { status.textContent = "Required: " + errs.join(", "); status.style.color = "var(--bad)"; return; }

  const bmi = isFinite(heightCm) ? calcBMI(weightKg, heightCm) : NaN;
  const wtLossPct = isFinite(usualKg) ? percentWeightLoss(weightKg, usualKg) : NaN;

  // z-scores
  const whz = $("p_whz").value ? num("p_whz") : NaN;
  const bmiZ = $("p_bmiZ").value ? num("p_bmiZ") : NaN;
  const muacZ = $("p_muacZ").value ? num("p_muacZ") : NaN;
  const lhaZ = $("p_lhaZ").value ? num("p_lhaZ") : NaN;
  const zDecline = $("p_zDecline").value ? num("p_zDecline") : NaN;
  const velocityPct = $("p_velocityPct").value ? num("p_velocityPct") : NaN;

  // labs
  const phosBase = $("p_phosBase").value ? phosToMmolL(num("p_phosBase"), $("p_phosUnit").value) : NaN;
  const phosNow  = $("p_phosNow").value ? phosToMmolL(num("p_phosNow"), $("p_phosUnitNow").value) : NaN;
  const kBase = $("p_kBase").value ? num("p_kBase") : NaN;
  const kNow = $("p_kNow").value ? num("p_kNow") : NaN;
  const phosDropPct = percentDrop(phosBase, phosNow);
  const kDropPct = percentDrop(kBase, kNow);
  const rsSeverityWorst = ["Severe","Moderate","Mild","None"].find(s =>
    [rsSeverityFromDrop(phosDropPct), rsSeverityFromDrop(kDropPct)].includes(s)) || "None";

  const energy = computeEnergy({ sex, ageYears, weightKg, heightCm, factor, intakeKcal, daysOfDeficit: daysLowIntake, bmi, wtLossPct, isPeds: true });
  const pctMet = energy && energy.balance ? energy.balance.pctMet : NaN;

  // Pediatric malnutrition (AND/ASPEN). Intake adequacy uses the computed
  // % of needs when a current intake was entered.
  const maln = pediatricMalnutrition({
    whz, bmiZ, lhaZ, muacZ,
    wtLossUBWpct: wtLossPct, velocityPct, zDecline,
    intakePctOfNeed: pctMet
  });

  // ASPEN peds refeeding risk
  const lytesSel = $("p_lytes").value;
  const zChange = [whz, bmiZ].find(isFinite); // change-from-baseline z (best available)
  const pedsRisk = aspenPedsRisk({
    zChangeFromBaseline: zChange,
    velocityPct,
    daysLowIntake, intakePctMet: pctMet,
    lytesMinimal: lytesSel === "minimal", lytesSignificant: lytesSel === "significant",
    comorbidityMild: $("p_comorbidity").value === "mild",
    comorbidityMod: $("p_comorbidity").value === "mod",
    comorbiditySevere: $("p_comorbidity").value === "severe"
  });
  const imminent = imminentFlags({ phosNow_mmolL: phosNow, phosDropPct, kDropPct, mgDropPct: NaN });
  const riskLabel = overallRiskLabel({ aspenLevel: pedsRisk.level, rsSeverityWorst, imminentCount: imminent.length, niceHighRisk: false });
  const badge = labelToBadge(riskLabel);

  const plan = buildPlan({ patientType: "peds", setting: $("p_setting").value, weightKg, riskLevel: riskLabel, niceExtreme: false, rsSeverityWorst, imminent: imminent.length > 0 });

  // Sections
  let sections = `<div class="kpiRow">
    <div class="kpi"><div class="label">Weight</div><div class="value">${weightKg.toFixed(1)}</div><div class="label">kg</div></div>
    ${isFinite(bmi) ? `<div class="kpi"><div class="label">BMI</div><div class="value">${bmi.toFixed(1)}</div></div>` : ""}
    ${isFinite(wtLossPct) ? `<div class="kpi"><div class="label">Wt loss (UBW)</div><div class="value">${dropLabel(wtLossPct)}</div></div>` : ""}
  </div>`;

  if (maln.overall) {
    sections += `<h3>Malnutrition grade (AND/ASPEN 2014)</h3><p><span class="badge ${malnutritionBadgeClass(maln.overall)}">${escapeHtml(maln.overall)} malnutrition</span> <span class="badge muted">${escapeHtml(maln.context)}</span></p><ul>`;
    sections += maln.indicators.map(ind => `<li>${escapeHtml(ind.name)}: <strong>${escapeHtml(ind.grade)}</strong>${isFinite(ind.value) ? ` (${ind.value})` : ""}</li>`).join("");
    sections += `</ul><div class="work-ref">Graded by the single most severe indicator. Source: ${refLink(maln.ref)}</div>`;
  } else {
    sections += `<h3>Malnutrition grade (AND/ASPEN 2014)</h3><p class="disclaimer">Enter z-scores or growth-trend data to grade malnutrition.</p>`;
  }

  sections += `<h3>ASPEN 2020 pediatric refeeding risk</h3><p><span class="badge ${badge.cls}">${escapeHtml(pedsRisk.level === "none" ? "Not at increased risk" : pedsRisk.level + " risk")}</span></p><ul>`;
  sections += pedsRisk.categories.length ? pedsRisk.categories.map(c => `<li>${escapeHtml(c.name)} <span class="badge muted">${escapeHtml(c.tier)}</span></li>`).join("") : `<li>No criteria met from entered data</li>`;
  sections += `</ul><div class="work-ref">Significant = any 1; Moderate = any 2; Mild = any 3 categories. Source: ${refLink(pedsRisk.ref)}</div>`;

  if (isFinite(phosDropPct)) {
    sections += `<h3>Electrolyte-shift severity (ASPEN)</h3><ul><li>Phosphate: ${escapeHtml(rsSeverityFromDrop(phosDropPct) || "n/a")} (${dropLabel(phosDropPct)})</li>${isFinite(kDropPct) ? `<li>Potassium: ${escapeHtml(rsSeverityFromDrop(kDropPct))} (${dropLabel(kDropPct)})</li>` : ""}</ul>`;
    sections += calcDetails("Show calculation — phosphate % drop", [`(${phosBase.toFixed(2)} − ${phosNow.toFixed(2)}) ÷ ${phosBase.toFixed(2)} × 100 = ${dropLabel(phosDropPct)}`], REFS.aspen2020);
  }
  sections += renderEnergy(energy);

  const heroSub = `${imminent.map(x => `<span class="badge bad">${escapeHtml(x)}</span>`).join("")}
    ${maln.overall ? `<span class="badge ${malnutritionBadgeClass(maln.overall)}">Malnutrition: ${escapeHtml(maln.overall)}</span>` : ""}
    <span class="badge ${badge.cls}">RS: ${escapeHtml(pedsRisk.level)}</span>`;

  const noteText = buildPedsNote({
    ageYears, sex, weightKg, heightCm, bmi, wtLossPct,
    maln, pedsRisk, rsSeverityWorst, imminentFlags: imminent, overallBadge: badge,
    phosBase: isFinite(phosBase) ? phosBase : null, phosNow: isFinite(phosNow) ? phosNow : null,
    phosDropLabel: dropLabel(phosDropPct),
    energy: energy ? { bmr: energy.bmr, needs: energy.needs, factor: energy.factor, intakeKcal: energy.intakeKcal, balance: energy.balance, starvation: energy.starvation } : null,
    plan
  });

  renderResults(document.querySelector('[data-results="peds"]'), { heroBadge: badge, heroSub, sections, plan, noteText });
  status.textContent = "Done."; status.style.color = "var(--ok)";
  saveAll();
}

// ── References (About) ─────────────────────────────────────
function renderAboutRefs() {
  const order = ["aspen2020","becker2014","nice","schofield","mifflin","friedli2018","whoBmi"];
  $("aboutRefs").innerHTML = `<ul>${order.map(k => {
    const r = REFS[k];
    return `<li><a href="${r.url}" target="_blank" rel="noopener">${escapeHtml(r.label)}</a> — ${escapeHtml(r.cite)}${r.alt ? ` · <a href="${r.alt}" target="_blank" rel="noopener">alt</a>` : ""}</li>`;
  }).join("")}</ul>`;
}

// ── Persistence ────────────────────────────────────────────
const FIELD_IDS = [
  "a_setting","a_sex","a_age","a_weight","a_weightUnit","a_height","a_heightUnit","a_usualWeight","a_usualWeightUnit",
  "a_daysNoIntake","a_intakeKcal","a_factor","a_phosBase","a_phosUnit","a_phosNow","a_phosUnitNow","a_kBase","a_mgBase","a_kNow","a_mgNow",
  "p_setting","p_sex","p_age","p_ageUnit","p_weight","p_weightUnit","p_height","p_heightUnit","p_usualWeight","p_usualWeightUnit",
  "p_daysLowIntake","p_intakeKcal","p_factor","p_whz","p_bmiZ","p_muacZ","p_lhaZ","p_zDecline","p_velocityPct",
  "p_phosBase","p_phosUnit","p_phosNow","p_phosUnitNow","p_lytes","p_kBase","p_kNow","p_comorbidity"
];
const CHECK_IDS = ["a_rfAlcohol","a_rfDiuretics","a_rfInsulin","a_rfChemo","a_rfAntacids","a_rfStarvation","a_fatLossMod","a_fatLossSevere","a_muscleLossMild","a_muscleLossSevere","a_comorbidityMod","a_comorbiditySevere"];

function activePane() {
  const tab = document.querySelector(".pane-tab.active");
  return tab ? tab.dataset.pane : "adult";
}
function collectState() {
  const s = {};
  FIELD_IDS.forEach(id => { const n = $(id); if (n) s[id] = n.value; });
  CHECK_IDS.forEach(id => { const n = $(id); if (n) s[id] = n.checked; });
  s._pane = activePane();
  return s;
}
function applyState(s) {
  if (!s) return;
  Object.keys(s).forEach(k => {
    if (k === "_pane") return;
    const n = $(k); if (!n) return;
    if (n.type === "checkbox") n.checked = !!s[k]; else n.value = s[k];
  });
}
function saveAll() { saveState(collectState()); }
function restoreAll() { applyState(loadState()); }

// ── Shareable URL (state encoded in the hash; static-host friendly) ────────
function encodeState(s) {
  // Drop empty values to keep the link short.
  const compact = {};
  Object.keys(s).forEach(k => {
    const v = s[k];
    if (v === "" || v === false || v == null) return;
    compact[k] = v;
  });
  return btoa(unescape(encodeURIComponent(JSON.stringify(compact))))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decodeState(str) {
  try {
    const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(atob(b64))));
  } catch (_) { return null; }
}
function buildShareURL() {
  return `${location.origin}${location.pathname}#d=${encodeState(collectState())}`;
}
function shareLink() {
  const url = buildShareURL();
  history.replaceState(null, "", url);
  navigator.clipboard.writeText(url)
    .then(() => showToast("Share link copied"))
    .catch(() => showToast("Copy failed — link is in the address bar"));
}
function loadFromHash() {
  const m = location.hash.match(/[#&]d=([^&]+)/);
  if (!m) return false;
  const state = decodeState(m[1]);
  if (!state) return false;
  applyState(state);
  const pane = state._pane === "peds" ? "peds" : (state._pane === "about" ? "about" : "adult");
  const tab = document.querySelector(`.pane-tab[data-pane="${pane}"]`);
  if (tab) tab.click();
  // Auto-recalculate so the colleague immediately sees the same result.
  if (pane === "peds") runPeds();
  else if (pane === "adult") runAdult();
  return true;
}

// ── Wire up ────────────────────────────────────────────────
document.querySelector('[data-calc="adult"]').addEventListener("click", runAdult);
document.querySelector('[data-calc="peds"]').addEventListener("click", runPeds);
// Theme: cycle light → dark → auto (auto = follow OS preference).
const THEME_KEY = "rhefeed_theme";
function applyTheme(mode) {
  if (mode === "light" || mode === "dark") document.documentElement.dataset.theme = mode;
  else delete document.documentElement.dataset.theme;
  const btn = $("btnTheme");
  btn.textContent = mode === "light" ? "\u2600" : mode === "dark" ? "\u263E" : "\u25D0";
  btn.title = `Theme: ${mode || "auto"}`;
}
$("btnTheme").addEventListener("click", () => {
  const cur = localStorage.getItem(THEME_KEY);
  const next = cur === "light" ? "dark" : cur === "dark" ? null : "light";
  if (next) localStorage.setItem(THEME_KEY, next); else localStorage.removeItem(THEME_KEY);
  applyTheme(next);
});
applyTheme(localStorage.getItem(THEME_KEY));

$("btnShare").addEventListener("click", shareLink);
$("btnPrint").addEventListener("click", () => window.print());
$("btnNew").addEventListener("click", () => { clearState(); location.hash = ""; location.reload(); });
document.addEventListener("input", saveAll);

renderAboutRefs();
// A shared link (URL hash) takes priority over the locally saved draft.
if (!loadFromHash()) restoreAll();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
