# AGENTS.md — RHEFEED

## Run / Deploy

No build step, no dependencies. Serve the root directory with any static server:

```bash
npx serve .                    # auto-reload
python3 -m http.server 8080    # built-in
```

Open `http://localhost:8080` to use. Deploy by pushing to a GitHub Pages branch (`main` / root).

## Architecture

This is a **pure vanilla JS PWA** — single-page clinical decision-support tool for refeeding syndrome risk assessment and management planning. No frameworks, no bundler, no runtime dependencies.

**Panes**: Adult / Pediatric / About, toggled via `data-pane` tabs. Each pane has its own form and a single Calculate button that runs the full pipeline and renders results inline.

**Data flow** (linear, synchronous):

```
Form DOM → units.js (unit conversions)
         → risk.js (BMI, % drops, ASPEN/NICE risk, imminent flags)
         → energy.js (BMR by Schofield or Mifflin, energy deficit, starvation grade)
         → malnutrition.js (pediatric AND/ASPEN malnutrition grading)
         → plan.js (feeding start, thiamine, monitoring, electrolytes, consults)
         → note.js (ASCII Assessment & Plan block for EMR)
         → app.js (render results to DOM, persist to LocalStorage)
```

**Key invariant**: `app.js` owns rendering and interaction only. It contains **zero clinical thresholds**. All clinical logic, thresholds, and reference tracing live in the other JS files.

## Key Files & Directories

```
js/constants.js     - Every clinical threshold, equation coefficient, energy factor, and reference DOI. Single source of truth.
js/units.js         - Pure unit converters (lb↔kg, in↔cm, phosphate mg/dL↔mmol/L, age months→years).
js/risk.js          - calcBMI, percentDrop, percentWeightLoss, rsSeverityFromDrop, aspenAdultRisk, aspenPedsRisk, niceHighRiskAdult, imminentFlags, overallRiskLabel.
js/energy.js        - Schofield & Mifflin BMR estimation, total energy needs, energy balance/deficit, degree-of-starvation composite, bmiClass.
js/malnutrition.js  - AND/ASPEN 2014 pediatric malnutrition grading from z-scores and trend indicators.
js/plan.js          - Management framework: feedingStart, thiamineRecommendation, monitoringRecommendation, electrolyteFramework, consultTriggers, buildPlan.
js/note.js          - ASCII EMR copy-block generators: buildAdultNote, buildPedsNote. Plaintext, chart-ready.
js/storage.js       - LocalStorage autosave/restore/clear (key: `rhefeed_v2`). Pure, no UI.
js/app.js           - UI wiring: DOM helpers, pane navigation, calculate runners (runAdult/runPeds), result rendering, theme toggle, shareable URL, persistence hooks.
index.html          - App shell. All markup. Script tags are ORDER-SENSITIVE: constants → units → energy → malnutrition → risk → plan → note → storage → app.
css/styles.css      - Design tokens (light/dark via CSS custom properties on :root), layout, components, print styles.
sw.js               - Cache-first service worker. Cache name: `rhefeed-v2`. Must update cache name when assets change.
manifest.json       - PWA manifest (name, icons, display: standalone).
icon.svg            - SVG app icon (used by manifest + apple-touch-icon).
CNAME               - Custom domain for GitHub Pages.
```

## JS Load Order

**Critical.** `index.html` `<script>` tags define the global namespace build-up. The order is:

1. `constants.js` — defines `STORAGE_KEY`, `RS_SEVERITY`, `ASPEN_ADULT`, `ASPEN_PEDS`, `NICE`, `FEEDING`, `THIAMINE`, `SCHOFIELD`, `ENERGY_FACTORS`, `INTAKE_BANDS`, `REFS`
2. `units.js` — consumes nothing from above
3. `energy.js` — consumes `SCHOFIELD`, `ENERGY_FACTORS`, `INTAKE_BANDS`, `BMI_CLASS`, `REFS`
4. `malnutrition.js` — consumes `PEDS_MALN`, `REFS`
5. `risk.js` — consumes `RS_SEVERITY`, `ASPEN_ADULT`, `ASPEN_PEDS`, `NICE`, `PHOS_DANGER_mmolL`, `PHOS_CRITICAL_mmolL`, `REFS`
6. `plan.js` — consumes `FEEDING`, `THIAMINE`, `REFS`
7. `note.js` — pure formatter, consumes nothing
8. `storage.js` — consumes `STORAGE_KEY`
9. `app.js` — consumes everything above

If you add a new JS file, insert it **before `app.js`** in `index.html`, and update `sw.js` `ASSETS` array.

## Coding Conventions

- **No modules, no imports.** Everything is global. Functions are camelCase, constants are UPPER_SNAKE.
- **Pure functions** in logic files — no DOM access, no side effects. Every computation function returns a plain object.
- **Transparency**: energy calculations embed a `work` array (step-by-step formula with substituted values) for "show calculation" disclosure.
- **Every clinical number is traceable** to a `REFS` key (DOI-linked) in `constants.js`.
- **HTML IDs** are prefixed: `a_` for adult, `p_` for pediatric.
- **Error handling** in logic files: return `NaN` / `null` for invalid inputs rather than throwing. `app.js` validates required fields before calling logic.
- **DOM helper**: `$(id)` = `document.getElementById(id)` (defined in app.js, not elsewhere).
- **CSS**: design tokens in `:root` and `:root[data-theme="dark"]` with `@media (prefers-color-scheme: dark)` fallback. Theme toggle writes `data-theme` attribute on `<html>`.

## Persistence

- Form state autosaves to LocalStorage key `rhefeed_v2` on every `input` event.
- Theme preference stored in `rhefeed_theme` (values: `"light"`, `"dark"`, or absent for auto).
- Shareable links encode state as base64 JSON in `#d=` URL hash fragment. Loading a shared link overrides saved state and auto-calculates.
- "New Patient" clears LocalStorage and reloads the page.

## Service Worker

- Cache name: **`rhefeed-v2`**. Whenever you add, remove, or rename an asset listed in the `ASSETS` array in `sw.js`, **bump the cache name** (e.g., `rhefeed-v3`) so existing installs pick up the change.
- Strategy: cache-first, network-fallback. GET requests only.
- The service worker is registered in `app.js` after DOMContentLoaded.

## Tips for AI Agents

- **Editing a clinical threshold**: change the value in `constants.js`. Do not touch any other file. The threshold flows to `risk.js` / `plan.js` / `energy.js` automatically through global constants.
- **Adding a new risk factor or calculation step**: add thresholds to `constants.js`, logic to `risk.js` or `plan.js`, and rendering to `app.js` (section HTML) and optionally `note.js` (EMR block). Keep clinical logic out of `app.js`.
- **Adding a new JS file**: insert its `<script>` tag before `app.js` in `index.html`, add its path to the `ASSETS` array in `sw.js`, and bump the cache name. All functions go on `window` — no ES modules.
- **The CSS uses custom properties heavily** — adding a new component means using `var(--surface)`, `var(--text)`, etc., not hardcoded hex colors.
- **Testing**: there are no unit tests. To manually test, serve the directory and exercise the two Calculate buttons. Check the console for errors.
- **Print styles**: `@media print` rules are at the bottom of `styles.css`. If you add new chrome/navigation, add print-hiding rules there.
- **Do not import libraries or add build steps** — this is a deliberate constraint of the project. Any new functionality must be vanilla JS.
- **Do not modify `REFS` entries** unless the source (DOI, citation) genuinely changed. These are canonical clinical references.

## Session History (2025-06-17)

This section captures architectural decisions and gotchas from the development session that built most of the current featureset.

### Features built this session

| Feature | Files | Notes |
|---|---|---|
| Z-score calculator | `js/zscore.js`, `index.html` (peds pane), `js/app.js` | Fetches LMS CSV from `github.com/robbie-med/ghrow`, caches in LocalStorage (7-day TTL). User picks WHO/CDC/China/Korea. Populates `p_whz`, `p_bmiZ`, `p_lhaZ`. Also stores IBW (50th %ile weight) on `p_whz.dataset.ibw` for catch-up formula. |
| Catch-up calorie calculator | `js/refeeding.js`, `index.html` (both panes), `js/app.js` | Pediatric: RDA kcal/kg × IBW ÷ actual weight. RDA table in `constants.js` (RDA_KCAL_PER_KG). Adult: (target - current) × 7700 kcal / days. WHO SAM protocol reference. |
| Baby food / formula calculator | `js/babyfood.js`, `index.html` (peds pane), `js/app.js` | 344 foods from USDA SR Legacy. Search with tags, suggestions dropdown. `calcFeedingAmount()` returns g/oz/mL per feed. Daily K/Mg/P totals. Preferred formulas pinned via Settings. |
| Pediatric note restructure | `js/note.js` | buildPedsNote now has ASSESSMENT / PLAN / EDUCATION sections. PLAN items are left-justified hyphens, attending-level terse. Catch-up formula shown inline. Food plan with specific amounts. |
| DOB replaces age field | `index.html`, `js/app.js` | `calcAgeFromDOB()` computes age in years from date inputs. `p_dob` + `p_measDate` replace `p_age` + `p_ageUnit`. |
| Institution Settings page | `js/settings.js`, `index.html` (Settings tab), `js/app.js` | Customize FEEDING and THIAMINE constants. Preferred formulas. Export/import JSON. Persists in `rhefeed_settings` (separate from patient `rhefeed_v2`). Settings apply by mutating const objects at runtime. |
| Plan rewrite (attending-level) | `js/plan.js` | All plan lines made terse, directive, no hedges. En/em dashes → hyphens in ASCII output. Thiamine now bulleted. |

### Critical gotchas

- **JS load order is ORDER-SENSITIVE**: `constants → units → energy → malnutrition → risk → plan → note → storage → zscore → refeeding → babyfood → settings → app`. If a file uses a global from another file, that file must load first.
- **Formula kcal normalization**: USDA SR Legacy reports powder formula at 500+ kcal/100g (dry powder). These are normalized to prepared density (~67 kcal/100g = 20 kcal/oz) by matching to liquid/RTF equivalents. The rebuild script is in the Python extraction above `babyfood.js`. If you regenerate the food data, you MUST re-run this normalization.
- **`dataset.selected` persistence**: The food search stores the selected food name in `p_foodSearch.dataset.selected`. This is restored on page load by `applyState()`. If the food plan disappears from notes after refresh, check this.
- **IBW storage**: `p_whz.dataset.ibw` is set by the z-score calculator. The catch-up and food calculators depend on this. If z-scores were entered manually (not calculated), IBW is unavailable and catch-up won't compute.
- **SW cache bumps**: Every time you add/remove an asset, bump the cache name in `sw.js` (currently `rhefeed-v6`).
- **Git remote**: `git@github.com:robbie-med/rhefeed.git` (SSH, not HTTPS).
- **GHROW data source**: Growth chart LMS data lives at `github.com/robbie-med/ghrow` (spelled "ghrow", not "growth"). Fetch from `raw.githubusercontent.com/robbie-med/ghrow/main/data/...`.
- **USDA data**: Baby food data extracted from `FoodData_Central_sr_legacy_food_csv_2018-04.zip` in project root. Category ID 3 = Baby Foods. K=1092, Mg=1090, P=1091, Energy=1008.
