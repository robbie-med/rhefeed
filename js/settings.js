// ─────────────────────────────────────────────────────────────────────────
// Institution settings — modifiable defaults for feeding, thiamine,
// monitoring, consults, and preferred formulas.
// Persists separately from patient data (key: rhefeed_settings).
// Export/import as JSON for backup and cross-institution sharing.
// ─────────────────────────────────────────────────────────────────────────

const SETTINGS_KEY = "rhefeed_settings";
var SETTINGS = null;

function settingsDefaults() {
  return {
    feeding: {
      pedsStartPctLow: FEEDING.peds.startPctGoalLow,
      pedsStartPctHigh: FEEDING.peds.startPctGoalHigh,
      girStartLow: FEEDING.peds.girStartLow,
      girStartHigh: FEEDING.peds.girStartHigh,
      girAdvance: FEEDING.peds.girAdvance,
      girMax: FEEDING.peds.girMax,
      adultStartKcalLow: FEEDING.adult.startKcalPerKgLow,
      adultStartKcalHigh: FEEDING.adult.startKcalPerKgHigh,
      adultAdvancePct: FEEDING.adult.advancePctGoal,
      adultAdvanceDaysMin: FEEDING.adult.advanceDaysMin,
      adultAdvanceDaysMax: FEEDING.adult.advanceDaysMax
    },
    thiamine: {
      pedsMgPerKg: THIAMINE.pedsMgPerKg,
      pedsMaxMg: THIAMINE.pedsMaxMg,
      adultMg: THIAMINE.adultMg,
      durationDays: THIAMINE.durationDays
    },
    defaults: {
      foodFrequency: 3,
      preferredFormulas: []
    }
  };
}

function settingsLoad() {
  var defs = settingsDefaults();
  try {
    var raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      var saved = JSON.parse(raw);
      for (var k in defs) {
        if (defs.hasOwnProperty(k) && saved[k] !== undefined) {
          if (typeof defs[k] === "object" && typeof saved[k] === "object") {
            for (var sk in defs[k]) {
              if (defs[k].hasOwnProperty(sk) && saved[k][sk] !== undefined)
                defs[k][sk] = saved[k][sk];
            }
          } else {
            defs[k] = saved[k];
          }
        }
      }
    }
  } catch (_) {}
  SETTINGS = defs;
  settingsApply();
  return defs;
}

function settingsSave() {
  if (!SETTINGS) return;
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(SETTINGS)); } catch (_) {}
}

function settingsApply() {
  if (!SETTINGS) return;
  var s = SETTINGS;
  FEEDING.peds.startPctGoalLow = s.feeding.pedsStartPctLow;
  FEEDING.peds.startPctGoalHigh = s.feeding.pedsStartPctHigh;
  FEEDING.peds.girStartLow = s.feeding.girStartLow;
  FEEDING.peds.girStartHigh = s.feeding.girStartHigh;
  FEEDING.peds.girAdvance = s.feeding.girAdvance;
  FEEDING.peds.girMax = s.feeding.girMax;
  FEEDING.adult.startKcalPerKgLow = s.feeding.adultStartKcalLow;
  FEEDING.adult.startKcalPerKgHigh = s.feeding.adultStartKcalHigh;
  FEEDING.adult.advancePctGoal = s.feeding.adultAdvancePct;
  FEEDING.adult.advanceDaysMin = s.feeding.adultAdvanceDaysMin;
  FEEDING.adult.advanceDaysMax = s.feeding.adultAdvanceDaysMax;
  THIAMINE.pedsMgPerKg = s.thiamine.pedsMgPerKg;
  THIAMINE.pedsMaxMg = s.thiamine.pedsMaxMg;
  THIAMINE.adultMg = s.thiamine.adultMg;
  THIAMINE.durationDays = s.thiamine.durationDays;
}

function settingsReset() {
  try { localStorage.removeItem(SETTINGS_KEY); } catch (_) {}
  SETTINGS = settingsDefaults();
  settingsApply();
}

function settingsExport() {
  if (!SETTINGS) SETTINGS = settingsDefaults();
  var blob = new Blob([JSON.stringify(SETTINGS, null, 2)], { type: "application/json" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "rhefeed-settings-" + new Date().toISOString().slice(0, 10) + ".json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function settingsImport(file, callback) {
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var imported = JSON.parse(e.target.result);
      if (!imported.feeding || !imported.thiamine) {
        if (callback) callback(false, "Invalid settings file — missing required sections.");
        return;
      }
      SETTINGS = imported;
      settingsSave();
      settingsApply();
      if (callback) callback(true, "Settings imported.");
    } catch (_) {
      if (callback) callback(false, "Could not parse settings file.");
    }
  };
  reader.readAsText(file);
}

function settingsPreferredFormulas() {
  return (SETTINGS && SETTINGS.defaults && SETTINGS.defaults.preferredFormulas) || [];
}

function settingsFoodFrequency() {
  return (SETTINGS && SETTINGS.defaults && SETTINGS.defaults.foodFrequency) || 3;
}
