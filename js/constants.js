// ─────────────────────────────────────────────────────────────────────────
// Clinical thresholds & equation coefficients.
// Every number here is traceable to a published source (see js/refs or README).
// This tool provides a monitoring/repletion FRAMEWORK and consult triggers;
// it deliberately avoids prescriptive electrolyte dosing tables.
// ─────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "rhefeed_v2";

// ── ASPEN 2020 refeeding-syndrome SEVERITY (electrolyte decrement) ─────────
// da Silva 2020: decrease in any 1–3 of P/K/Mg by 10–20% (mild), 20–30%
// (moderate), >30% (severe), occurring within 5 days of reintroducing calories.
const RS_SEVERITY = {
  mildPct: 10,
  moderatePct: 20,
  severePct: 30,
  windowDays: 5
};

// Commonly cited "imminent danger" hypophosphatemia threshold (Friedli 2018,
// ASPEN case discussions): phosphate ≤ 0.6 mmol/L (≈1.9 mg/dL) or a precipitous
// drop. <0.32 mmol/L is life-threatening.
const PHOS_DANGER_mmolL = 0.6;
const PHOS_CRITICAL_mmolL = 0.32;

// ── ASPEN 2020 ADULT risk criteria (Table 3) ──────────────────────────────
// Moderate risk = ANY 2 criteria; Significant risk = ANY 1 criterion.
const ASPEN_ADULT = {
  bmi:          { moderate: 18.5, significant: 16.0 },     // 16–18.5 vs <16
  wtLossModPct: 5,    wtLossModMonths: 1,                  // 5% in 1 month
  wtLossSig3moPct: 7.5,                                    // 7.5% in 3 months
  wtLossSig6moPct: 10,                                     // >10% in 6 months
  intakeNoneModDays: 5,                                    // none/negligible 5–6 d
  intakeNoneSigDays: 7,                                    // none/negligible >7 d
  intakeModPctEER: 75, intakeModDaysAcute: 7,             // <75% EER >7 d acute
  intakeSigPctEER: 50, intakeSigDaysAcute: 5              // <50% EER >5 d acute
};

// ── ASPEN 2020 PEDIATRIC risk criteria (Table 5) ──────────────────────────
// Mild = ANY 3 categories; Moderate = ANY 2; Significant = ANY 1.
// (Not for ≤28 days of life or ≤44 weeks corrected GA.)
const ASPEN_PEDS = {
  // z-score (weight-for-length 1–24 mo, or BMI-for-age 2–20 yr), AS A CHANGE FROM BASELINE
  zMild: -1.0, zMod: -2.0, zSig: -3.0,
  // weight gain velocity, % of norm
  velMildPct: 75, velModPct: 50, velSigPct: 25,
  // consecutive days of energy/protein intake <75% of estimated need
  intakePctEER: 75,
  intakeMildDays: 3, intakeModDays: 5, intakeSigDays: 7,
  // prefeeding electrolytes: % below lower limit of normal
  lytesMildPctBelow: 25, lytesModPctBelow: 50
};

// ── AND/ASPEN 2014 pediatric MALNUTRITION indicators (Becker 2014) ─────────
// Used to grade existing under-nutrition (distinct from RS risk above).
const PEDS_MALN = {
  // Single data point — z-scores (weight-for-height, BMI-for-age, MUAC)
  z: { mild: -1.0, moderate: -2.0, severe: -3.0 },
  // Length/height-for-age z: only a SEVERE indicator (stunting) at ≤ -3
  stuntSevereZ: -3.0,
  // Multi-point: weight loss as % of usual body weight (2–20 yr)
  wtLossUBW: { mild: 5, moderate: 7.5, severe: 10 },
  // Multi-point: weight gain velocity (<2 yr), % of expected
  velocity: { mild: 75, moderate: 50, severe: 25 },
  // Multi-point: deceleration in weight-for-length/height z (drop in # of z-scores)
  zDecline: { mild: 1, moderate: 2, severe: 3 },
  // Multi-point: inadequate nutrient intake, % of estimated need
  intake: { mild: 75, moderate: 50, severe: 25 } // 51–75 mild, 26–50 mod, ≤25 severe
};

// ── NICE CG32 adult high-risk criteria ────────────────────────────────────
const NICE = {
  major: { bmi: 16.0, wtLossPct: 15.0, daysNoIntake: 10 },
  minor: { bmi: 18.5, wtLossPct: 10.0, daysNoIntake: 5 },
  // High risk if ANY 1 major OR ANY 2 minor.
  // Extreme risk (start 5 kcal/kg/d): BMI<14 or negligible intake >15 d.
  extremeBmi: 14.0, extremeDaysNoIntake: 15
};

// ── WHO adult BMI classification ───────────────────────────────────────────
const BMI_CLASS = [
  { max: 16.0,  label: "Severe thinness" },
  { max: 17.0,  label: "Moderate thinness" },
  { max: 18.5,  label: "Mild thinness" },
  { max: 25.0,  label: "Normal" },
  { max: 30.0,  label: "Overweight" },
  { max: Infinity, label: "Obese" }
];

// ── Feeding initiation / advancement (ASPEN 2020 Tables 6 & 7; NICE CG32) ──
const FEEDING = {
  adult: {
    startKcalPerKgLow: 10,   // ASPEN: 10–20 kcal/kg first 24 h
    startKcalPerKgHigh: 20,
    dextroseGramsLow: 100,   // or 100–150 g dextrose first 24 h
    dextroseGramsHigh: 150,
    niceMaxKcalPerKg: 10,    // NICE: max 10 kcal/kg/d
    niceExtremeKcalPerKg: 5, // NICE: 5 kcal/kg/d in extreme cases
    advancePctGoal: 33,      // advance by ~33% of goal every 1–2 days
    advanceDaysMin: 4, advanceDaysMax: 7
  },
  peds: {
    startPctGoalLow: 40, startPctGoalHigh: 50, // initiate at max 40–50% goal
    girStartLow: 4, girStartHigh: 6,           // GIR mg/kg/min start
    girAdvance: 2, girMax: 18                   // advance 1–2 mg/kg/min, max 14–18
  }
};

// ── Thiamine (ASPEN 2020) ──────────────────────────────────────────────────
const THIAMINE = {
  adultMg: 100,          // 100 mg before feeding / before dextrose IVF
  pedsMgPerKg: 2,        // 2 mg/kg ...
  pedsMaxMg: 200,        // ... to a max of 100–200 mg/d
  durationDays: "5–7 days or longer"
};

// ── Energy estimation ──────────────────────────────────────────────────────
// Schofield (1985) weight-only BMR (kcal/day), by sex and age band.
const SCHOFIELD = {
  male: [
    { maxAge: 3,  m: 59.512, b: -30.4 },
    { maxAge: 10, m: 22.706, b: 504.3 },
    { maxAge: 18, m: 17.686, b: 658.2 },
    { maxAge: 30, m: 15.057, b: 692.2 },
    { maxAge: 60, m: 11.472, b: 873.1 },
    { maxAge: Infinity, m: 11.711, b: 587.7 }
  ],
  female: [
    { maxAge: 3,  m: 58.317, b: -31.1 },
    { maxAge: 10, m: 20.315, b: 485.9 },
    { maxAge: 18, m: 13.384, b: 692.6 },
    { maxAge: 30, m: 14.818, b: 486.6 },
    { maxAge: 60, m: 8.126,  b: 845.6 },
    { maxAge: Infinity, m: 9.082, b: 658.5 }
  ]
};

// Stress / activity factors applied to BMR to estimate total energy needs.
const ENERGY_FACTORS = [
  { value: 1.2,  label: "Bedbound / minimal activity (×1.2)" },
  { value: 1.3,  label: "Ward, light activity (×1.3)" },
  { value: 1.5,  label: "Mobile / catch-up growth (×1.5)" }
];

// Intake adequacy bands (mirrors ASPEN/AND inadequate-intake grading).
const INTAKE_BANDS = {
  adequate: 75,   // >75% of needs
  mild: 50,       // 51–75% mild
  moderate: 25    // 26–50% moderate; ≤25% severe
};

// ── Source documentation (real, canonical links) ──────────────────────────
// Each calculation in the app cites a key whose entry lives here, so any number
// can be traced to primary literature. DOIs are permanent publisher links.
const REFS = {
  aspen2020: {
    key: "aspen2020",
    label: "ASPEN 2020 Consensus Recommendations for Refeeding Syndrome",
    cite: "da Silva JSV, et al. Nutr Clin Pract. 2020;35(2):178–195.",
    url: "https://doi.org/10.1002/ncp.10474",
    alt: "https://pubmed.ncbi.nlm.nih.gov/32115791/"
  },
  becker2014: {
    key: "becker2014",
    label: "AND/ASPEN Pediatric Malnutrition Indicators",
    cite: "Becker P, et al. Nutr Clin Pract. 2015;30(1):147–161.",
    url: "https://doi.org/10.1177/0884533614557642",
    alt: "https://www.jandonline.org/article/S2212-2672(14)01359-8/fulltext"
  },
  nice: {
    key: "nice",
    label: "NICE CG32 — Nutrition support for adults",
    cite: "National Institute for Health and Care Excellence. CG32 (2006, updated 2017).",
    url: "https://www.nice.org.uk/guidance/cg32"
  },
  schofield: {
    key: "schofield",
    label: "Schofield equations for basal metabolic rate",
    cite: "Schofield WN. Hum Nutr Clin Nutr. 1985;39 Suppl 1:5–41.",
    url: "https://pubmed.ncbi.nlm.nih.gov/4044297/"
  },
  mifflin: {
    key: "mifflin",
    label: "Mifflin–St Jeor resting energy expenditure equation",
    cite: "Mifflin MD, St Jeor ST, et al. Am J Clin Nutr. 1990;51(2):241–247.",
    url: "https://doi.org/10.1093/ajcn/51.2.241"
  },
  friedli2018: {
    key: "friedli2018",
    label: "Friedli — Management and prevention of refeeding syndrome",
    cite: "Friedli N, et al. Nutrition. 2018;47:13–20.",
    url: "https://doi.org/10.1016/j.nut.2017.09.007"
  },
  whoBmi: {
    key: "whoBmi",
    label: "WHO Body Mass Index classification (adults)",
    cite: "World Health Organization. BMI thresholds.",
    url: "https://www.who.int/data/gho/data/themes/topics/topic-details/GHO/body-mass-index"
  }
};
