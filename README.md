# Refeeding Syndrome One-Stop

A fast, **offline-capable** clinical decision-support tool for bedside refeeding syndrome risk assessment and management planning. Enter anthropometrics, electrolytes, and clinical context — get an instant, colour-coded risk verdict plus a non-prescriptive care framework you can paste straight into the EMR.

> **Disclaimer** — Educational decision support only. Does not replace local protocols, pharmacy guidance, nutrition support teams, or clinician judgment. Always individualise dosing, repletion, fluid strategy, and monitoring.

---

## Screenshots

| Desktop — inputs | Desktop — results | Mobile |
|:---:|:---:|:---:|
| ![Inputs view showing the form with anthropometrics, lab fields, and risk-factor checkboxes](docs/screenshots/app-inputs.png) | ![Results view showing Very High Risk verdict with NICE/ASPEN detail and management guidance](docs/screenshots/app-results.png) | ![Mobile view showing the tab bar and stacked input form](docs/screenshots/app-mobile.png) |

---

## What it calculates

| Output | Source |
|---|---|
| BMI and % weight loss | Anthropometrics + usual weight |
| Electrolyte % drop (P, K, Mg) | Baseline → current values |
| **ASPEN severity** (None / Mild / Moderate / Severe) | Worst-across-electrolytes shift category |
| **NICE high-risk** (adult) | Major + minor flag count |
| **Imminent danger flags** | Phos ≤ 0.6 mmol/L and/or ≥ 30% drop |
| **Overall risk label** | Very high / High / Moderate / Lower |
| Feeding start rate & advance window | Risk label × weight |
| Thiamine / vitamin guidance | Risk level + patient type |
| Monitoring frequency | Setting (ICU vs floor) + flag count |
| Electrolyte repletion framework | ASPEN severity + imminent flags |
| Consult triggers | Risk label |
| ASCII EMR copy block | All of the above |

Clinical thresholds follow ASPEN 2020 consensus recommendations and NICE guideline CG32 (updated 2017).

---

## Features

- **Hero verdict** — colour-coded risk banner is the first thing you see after calculating
- **Progressive disclosure** — the 7 required fields are front-and-centre; optional labs and severity scores are collapsed by default
- **Offline-capable PWA** — installs to the home screen; service worker caches all assets so it works without a network connection
- **Mobile tab bar** — Inputs / Results tabs for one-handed use on a phone; switches automatically on Calculate
- **EMR copy block** — ASCII-only, click-to-copy; ready to paste into any EHR
- **Print / PDF** — clean print stylesheet strips navigation chrome
- **Export JSON** — machine-readable snapshot of inputs + computed values with ISO timestamp
- **LocalStorage autosave** — form state survives a page refresh; New Patient clears it

---

## Clinical logic

All logic lives in four isolated files that carry no UI dependencies — they can be unit-tested or vendored independently.

| File | Responsibility |
|---|---|
| `js/constants.js` | Numeric thresholds (ASPEN severity boundaries, NICE BMI/wt-loss/intake cutoffs, FEEDING start bands) |
| `js/units.js` | Unit conversions (kg↔lb, cm↔in, mg/dL↔mmol/L phosphate) |
| `js/risk.js` | NICE high-risk logic, ASPEN severity grading, imminent-flag detection, qualitative risk-factor enumeration, overall risk label |
| `js/plan.js` | Non-prescriptive care framework: feeding start, monitoring intensity, thiamine, electrolyte framework, consult triggers |

`js/storage.js` handles LocalStorage autosave/restore. `js/app.js` owns rendering and user interaction only — it calls the logic functions above but contains no clinical thresholds itself.

---

## Tech stack

- Pure HTML5 / CSS3 / vanilla JS — no build step, no runtime dependencies
- Progressive Web App (Web App Manifest + Cache-first Service Worker)
- Dark/light theme via `prefers-color-scheme`
- Tested in Chrome, Firefox, and Safari (desktop + mobile)

---

## Deployment

### GitHub Pages (recommended)

1. Fork or push to a public GitHub repo.
2. **Settings → Pages → Deploy from branch → `main` / root.**
3. Visit your Pages URL — the site is live in ~60 seconds.
4. On mobile, tap **Add to Home Screen** to install as a PWA.

### Local

```bash
# Any static server works — no build needed
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

---

## Project structure

```
rhefeed/
├── index.html          # App shell + all markup
├── css/
│   └── styles.css      # Design tokens, layout, components
├── js/
│   ├── constants.js    # Clinical thresholds
│   ├── units.js        # Unit conversions
│   ├── risk.js         # NICE / ASPEN / flag logic
│   ├── plan.js         # Care framework builder
│   ├── storage.js      # LocalStorage autosave
│   └── app.js          # UI rendering + wiring
├── manifest.json       # PWA manifest
├── sw.js               # Service worker (cache-first)
├── icon.svg            # Home-screen icon
└── CNAME               # Custom domain (GitHub Pages)
```

---

## References

- **ASPEN 2020** — da Silva JSV, et al. *ASPEN consensus recommendations for refeeding syndrome.* Nutr Clin Pract. 2020;35(2):178–195.
- **NICE CG32** — *Nutrition support for adults: oral nutrition support, enteral tube feeding and parenteral nutrition.* 2006; updated 2017.
- **Friedli 2018** — Friedli N, et al. *Management and prevention of refeeding syndrome in medical inpatients.* Nutrition. 2018;47:13–20.
- **Jing 2025** — Jing C, et al. *Development and validation of a risk prediction model for refeeding syndrome in adults with critical illness.* Clinical Nutrition. 2025;55:282–292.

---

## License

MIT — free to use, adapt, and deploy. Attribution appreciated but not required.
