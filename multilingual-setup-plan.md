# Multilingual Observable Framework Setup Plan

## Overview

Observable Framework has **no built-in i18n system**, so multilingual support must be architected manually. This plan covers three languages: German (de), French (fr), and English (en) for both markdown prose and data labels.

---

## 1. Parallel Directory Structure

Use file-based routing with language prefixes. Each language gets its own directory with a full copy of every page, written natively in that language.

```
src/
├── index.md                  # Language picker / redirect
├── en/
│   ├── index.md
│   ├── a_rnd.md
│   ├── b_ens.md
│   ├── c_inno.md
│   ├── d_ktt.md
│   └── e_snd.md
├── de/
│   ├── index.md
│   ├── a_rnd.md
│   ├── b_ens.md
│   ├── c_inno.md
│   ├── d_ktt.md
│   └── e_snd.md
├── fr/
│   ├── index.md
│   ├── a_rnd.md
│   ├── b_ens.md
│   ├── c_inno.md
│   ├── d_ktt.md
│   └── e_snd.md
├── components/
│   ├── langSwitcher.js       # Language switcher component
│   ├── plots/                # Reusable chart functions (language-agnostic)
│   └── utils/
│       ├── i18n.js           # Shared translation strings for UI
│       ├── colors.js
│       └── countries.js
├── data/
│   ├── common/               # Language-agnostic numeric data
│   │   ├── rnd_indicators.csv
│   │   └── startup_data.csv
│   └── labels/               # Translated labels for charts/UI
│       ├── labels_en.json
│       ├── labels_de.json
│       └── labels_fr.json
```

This maps to URLs:
- `/en/a_rnd`, `/en/b_ens`, ...
- `/de/a_rnd`, `/de/b_ens`, ...
- `/fr/a_rnd`, `/fr/b_ens`, ...

---

## 2. Configuration (`observablehq.config.js`)

### Navigation with Language Sections

```js
export default {
  title: "Innovation Ecosystem",
  root: "src",
  base: "/context-monitor",
  theme: "light",
  typographer: true,

  // Dynamic <html lang="..."> per page
  head: ({path}) => {
    const lang = path.startsWith("/de/") ? "de"
               : path.startsWith("/fr/") ? "fr"
               : "en";
    return [
      '<link rel="icon" href="favicon-32x32.png" type="image/png" sizes="32x32">',
      `<script>document.documentElement.lang="${lang}"</script>`
    ].join("\n");
  },

  // Language switcher in header
  header: ({path}) => {
    const segments = path.replace(/^\//, "").split("/");
    const pathWithoutLang = segments.slice(1).join("/");
    const isLang = (l) => path.startsWith(`/${l}/`) ? ' class="active"' : "";
    return `<nav class="lang-switcher">
      <a href="/context-monitor/en/${pathWithoutLang}"${isLang("en")}>EN</a>
      <a href="/context-monitor/de/${pathWithoutLang}"${isLang("de")}>DE</a>
      <a href="/context-monitor/fr/${pathWithoutLang}"${isLang("fr")}>FR</a>
    </nav>`;
  },

  // Grouped sidebar navigation
  pages: [
    {
      name: "English",
      open: false,
      pages: [
        { name: "Research & Development", path: "/en/a_rnd" },
        { name: "Entrepreneurship & Start-ups", path: "/en/b_ens" },
        { name: "Innovation Activities", path: "/en/c_inno" },
        { name: "Knowledge & Technology Transfer", path: "/en/d_ktt" },
        { name: "Sustainability & High-tech Exports", path: "/en/e_snd" },
      ]
    },
    {
      name: "Deutsch",
      open: false,
      pages: [
        { name: "Forschung & Entwicklung", path: "/de/a_rnd" },
        { name: "Unternehmertum & Start-ups", path: "/de/b_ens" },
        { name: "Innovationsaktivitäten", path: "/de/c_inno" },
        { name: "Wissens- & Technologietransfer", path: "/de/d_ktt" },
        { name: "Nachhaltigkeit & Hightech-Exporte", path: "/de/e_snd" },
      ]
    },
    {
      name: "Français",
      open: false,
      pages: [
        { name: "Recherche & Développement", path: "/fr/a_rnd" },
        { name: "Entrepreneuriat & Start-ups", path: "/fr/b_ens" },
        { name: "Activités d'innovation", path: "/fr/c_inno" },
        { name: "Transfert de connaissances & technologies", path: "/fr/d_ktt" },
        { name: "Durabilité & Exportations high-tech", path: "/fr/e_snd" },
      ]
    }
  ],

  // Language-aware footer
  footer: ({path}) => {
    const lang = path.startsWith("/de/") ? "de"
               : path.startsWith("/fr/") ? "fr" : "en";
    const labels = { en: "Authors", de: "Autoren", fr: "Auteurs" };
    return `${labels[lang]}: SECO, Innosuisse`;
  }
};
```

---

## 3. Translation Module (`src/components/utils/i18n.js`)

Centralised UI strings used by reusable components (axis labels, tooltips, common terms):

```js
const translations = {
  en: {
    year: "Year",
    value: "Value",
    country: "Country",
    source: "Source",
    noData: "No data available",
    share: "Share (%)",
    millions: "Millions",
    billions: "Billions",
    switzerland: "Switzerland",
  },
  de: {
    year: "Jahr",
    value: "Wert",
    country: "Land",
    source: "Quelle",
    noData: "Keine Daten verfügbar",
    share: "Anteil (%)",
    millions: "Millionen",
    billions: "Milliarden",
    switzerland: "Schweiz",
  },
  fr: {
    year: "Année",
    value: "Valeur",
    country: "Pays",
    source: "Source",
    noData: "Pas de données disponibles",
    share: "Part (%)",
    millions: "Millions",
    billions: "Milliards",
    switzerland: "Suisse",
  }
};

/**
 * Translate a key for a given language. Falls back to English, then the key itself.
 */
export function t(lang, key) {
  return translations[lang]?.[key] ?? translations["en"]?.[key] ?? key;
}

/**
 * Detect language from the current URL path.
 */
export function getLang() {
  const path = window.location.pathname;
  if (path.includes("/de/")) return "de";
  if (path.includes("/fr/")) return "fr";
  return "en";
}
```

---

## 4. Multilingual Data Strategy

### 4a. Numeric Data: Shared, Language-Agnostic

Keep a single copy of numeric/statistical data. Use country codes and indicator codes rather than human-readable names:

```
src/data/common/rnd_indicators.csv
```

```csv
country_code,year,gerd_pct_gdp,researchers_per_1000
CH,2023,3.4,9.1
DE,2023,3.1,8.4
FR,2023,2.2,7.2
```

### 4b. Labels: Per-Language JSON Files

```
src/data/labels/labels_en.json
```

```json
{
  "countries": {
    "CH": "Switzerland",
    "DE": "Germany",
    "FR": "France"
  },
  "indicators": {
    "gerd_pct_gdp": "R&D expenditure (% of GDP)",
    "researchers_per_1000": "Researchers per 1,000 employed"
  }
}
```

```
src/data/labels/labels_de.json
```

```json
{
  "countries": {
    "CH": "Schweiz",
    "DE": "Deutschland",
    "FR": "Frankreich"
  },
  "indicators": {
    "gerd_pct_gdp": "F&E-Ausgaben (% des BIP)",
    "researchers_per_1000": "Forschende pro 1'000 Beschäftigte"
  }
}
```

```
src/data/labels/labels_fr.json
```

```json
{
  "countries": {
    "CH": "Suisse",
    "DE": "Allemagne",
    "FR": "France"
  },
  "indicators": {
    "gerd_pct_gdp": "Dépenses de R&D (% du PIB)",
    "researchers_per_1000": "Chercheurs pour 1'000 employés"
  }
}
```

### 4c. Loading in Pages

In each language-specific page (e.g. `src/de/a_rnd.md`):

```js
import {t, getLang} from "../components/utils/i18n.js";

const lang = getLang(); // "de"
const data = FileAttachment("../data/common/rnd_indicators.csv").csv({typed: true});
const labels = FileAttachment(`../data/labels/labels_${lang}.json`).json();
```

Then use `labels.countries[row.country_code]` for display names and `labels.indicators[column]` for axis labels.

---

## 5. Making Reusable Components Language-Aware

Pass `lang` into plot components rather than hardcoding any strings:

### Example: Line Plot

```js
// src/components/plots/line_plot.js
import {t} from "../utils/i18n.js";
import * as Plot from "@observablehq/plot";

export function linePlot(data, {lang = "en", labels = {}, ...options} = {}) {
  return Plot.plot({
    x: { label: t(lang, "year") },
    y: { label: options.yLabel ?? t(lang, "value") },
    color: { legend: true },
    marks: [
      Plot.line(data, {
        x: "year",
        y: "value",
        stroke: "country_code",
        title: (d) => `${labels.countries?.[d.country_code] ?? d.country_code}: ${d.value}`
      }),
    ],
    ...options
  });
}
```

### Usage in a Page

```js
linePlot(filteredData, {
  lang,
  labels,
  yLabel: labels.indicators["gerd_pct_gdp"]
})
```

---

## 6. Number Formatting

Use locale-aware formatting throughout:

```js
// Swiss formatting conventions per language
const formatNumber = (value, lang) => {
  const locales = { de: "de-CH", fr: "fr-CH", en: "en-CH" };
  return value.toLocaleString(locales[lang] ?? "en-CH");
};
```

---

## 7. Language Switcher Styling

Add to a global CSS file or inline in the `header`:

```css
.lang-switcher {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.lang-switcher a {
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: var(--theme-foreground-muted);
}

.lang-switcher a.active {
  background: var(--theme-foreground);
  color: var(--theme-background);
  font-weight: 600;
}
```

---

## 8. Root `index.md` — Language Picker

The root page serves as a language selector or redirects to a default:

```md
# Innovation Ecosystem

Choose your language / Sprache wählen / Choisir la langue:

- [English](/context-monitor/en/)
- [Deutsch](/context-monitor/de/)
- [Français](/context-monitor/fr/)
```

Or auto-redirect via JavaScript:

```js
const browserLang = navigator.language?.slice(0, 2);
const supported = ["de", "fr", "en"];
const lang = supported.includes(browserLang) ? browserLang : "en";
window.location.href = `/context-monitor/${lang}/`;
```

---

## 9. Summary

| Concern | Approach |
|---|---|
| **Page prose** | Separate `.md` file per language in `/en/`, `/de/`, `/fr/` dirs |
| **Navigation** | Sectioned `pages` config grouped by language |
| **HTML `lang` attribute** | `head` function sets `document.documentElement.lang` from path |
| **UI strings** (axis labels, tooltips) | `i18n.js` module with `t(lang, key)` helper |
| **Chart labels** | Pass `lang` to reusable plot components |
| **Data (numbers)** | Single shared dataset, language-neutral codes |
| **Data (display labels)** | Per-language JSON files merged at page level |
| **Language switching** | URL-based switcher component in header |
| **Number formatting** | `toLocaleString()` with locale derived from `lang` |

### Tradeoffs

- **Pro**: Clean separation; each language page is fully readable and editable on its own; no build-time complexity.
- **Con**: 3x page files to maintain. Changes to chart logic or layout must be replicated across language copies.
- **Mitigation**: Keep all visualization logic in shared components (`src/components/`). The `.md` pages should contain only prose and component calls, minimizing what needs to be duplicated.
