---
title: Entrepreneurship and Start-ups
style: styles.css
---

```js
import {
  color_scale,
  color_range,
  colorLegend,
  countries,
} from "./components/utils/colors.js";
import { iso3_country } from "./components/utils/countries.js";
import { line_oecd } from "./components/plots/line_plots.js";
import {
  bar_x,
  bar_x_country,
  bar_x_unicorn,
} from "./components/plots/bar_x.js";
import { bar_vc_ch } from "./components/plots/bar_y.js";
import { arrow_unicorns } from "./components/plots/arrow_y.js";
import * as aq from "npm:arquero";

const df_oecd_vc = await FileAttachment("data/df_oecd_vc.csv").csv({
  typed: true,
});
const df_gem_tea = await FileAttachment("data/df_gem_tea_2018_2024.csv").csv({
  typed: true,
});
const df_vc_ch = await FileAttachment("data/df_startupticker_vc.csv").csv({
  typed: true,
});
const countries_filtered =
  isr ?
    countries.filter((d) => !["DEU", "FIN", "NLD", "SWE"].includes(d))
  : countries.filter((d) => !["ISR", "USA"].includes(d));
const df_vc = df_oecd_vc
  .filter(
    (d) =>
      d.measure === "VC_INV_MKT" && // R&D Personnel
      d.bds === "_T" &&
      d.unit === "PT_B1GQ" && // per 1'000 employment
      countries_filtered.includes(d.iso3),
  )
  .sort((a, b) => a.year - b.year);
const df_tea = df_gem_tea
  .filter((d) => countries.includes(d.iso3))
  .sort((a, b) => a.year - b.year)
  .map((d) => ({
    ...d,
    country: d.economy,
    year_date: new Date(d.year.toString()),
    zIndex: d.iso3 === "CHE" ? 1 : 0,
  }))
  .sort((a, b) => a.zIndex - b.zIndex);
const df_vc_ch_rounds = df_vc_ch.filter(
  (d) =>
    d.measure === "Financing rounds of Swiss start-ups" &&
    d.year_date > new Date("2017"),
);
const df_vc_ch_fin = df_vc_ch.filter(
  (d) =>
    d.measure === "Invested capital in Swiss start-ups" &&
    d.year_date > new Date("2017"),
);
const df_oecd_msti = await FileAttachment("./data/df_oecd_msti.csv").csv({
  typed: true,
});
const df_unicorns_country = await FileAttachment(
  "./data/df_unicorns_country.csv",
).csv({ typed: true });
const df_unicorns_ch = await FileAttachment("./data/df_unicorns_ch.csv").csv({
  typed: true,
});
const gdp = df_oecd_msti
  .filter(
    (d) =>
      d.year_date < new Date("2024-01-01") &&
      d.year_date > new Date("2022-01-01") &&
      countries.includes(d.iso3) &&
      d.unit === "USD_PPP" &&
      d.measure === "GDP",
  )
  .map((d) => ({
    iso3: d.iso3,
    country: d.country,
    year: d.year_date,
    measure: d.measure_name,
    gdp: d.obs_value,
  }));
const df_ug = df_unicorns_country
  .filter((d) => countries.includes(d.iso3))
  .map((unicorn) => {
    // Find matching GDP record
    const gdpRecord = gdp.find((g) => g.iso3 === unicorn.iso3);
    // Return unicorn data with added GDP
    return {
      ...unicorn,
      gdp: gdpRecord ? gdpRecord.gdp / 133000 : null, // Add GDP or null if no match
      gdp_unicorn: unicorn.unicorns / (gdpRecord.gdp / 133000),
    };
  });

// European Commission Start-up and Scale-up Scoreboard (ESS).
// The source uses EU statistical country codes (e.g. "UK", "EL") rather
// than ISO3, so only the codes relevant to our comparison set are mapped;
// anything else resolves to undefined and is dropped by the countries
// filter below.
const iso2_to_iso3_ess = new Map([
  ["CH", "CHE"],
  ["SE", "SWE"],
  ["US", "USA"],
  ["KR", "KOR"],
  ["UK", "GBR"],
  ["NL", "NLD"],
  ["FI", "FIN"],
  ["DK", "DNK"],
  ["CN", "CHN"],
  ["IL", "ISR"],
  ["SG", "SGP"],
]);
const df_ess_raw = await FileAttachment("data/df_ec_ESS.csv").csv({
  typed: true,
});
function ess_indicator(indicator_name) {
  return df_ess_raw
    .filter(
      (d) => d["Indicator name"] === indicator_name && d["Raw data"] !== "NA",
    )
    .map((d) => {
      const iso3 = iso2_to_iso3_ess.get(d["Country code"]);
      return {
        iso3,
        country: iso3_country.get(iso3) ?? d["Country"],
        year_date: new Date(String(d["Year"])),
        obs_value: d["Raw data"],
        var_axis: indicator_name,
      };
    })
    .filter((d) => countries.includes(d.iso3));
}
const df_ess_founders = ess_indicator(
  "Number of founders per million population",
);
const df_ess_valuations_gdp = ess_indicator(
  "Total valuations of the ecosystems in the country as a share of GDP",
);
const df_ess_exits = ess_indicator("Number of exits per million population");
const df_ess_unicorns = ess_indicator(
  "Number of unicorns per million population",
);
```

# Entrepreneurship and Start-ups

## Venture capital market in Switzerland

Venture capital availability in ${colorLegend("CHE")} has been increasing steadily until 2022, but has declined since. The financing rounds have become only slightly fewer, but smaller. The in- and then decreasing VC funding with a peak in 2021/2022 is mirrored in other countries (see below).

<div style="display: grid; grid-template-columns: 1fr 1fr; max-width: 640px">
  ${bar_vc_ch(df_vc_ch_fin)}
  ${bar_vc_ch(df_vc_ch_rounds)}
</div>

## Venture capital investments in % of GDP 2017–2025

According to the report «Fast-growing start-ups in Switzerland» ([SECO, 2017](https://www.seco.admin.ch/dam/seco/en/dokumente/Standortfoerderung/KMU-Politik/Finanzierung%20der%20KMU/Bericht%20Postulat%20Derder%20-%20Rasch%20wachsende%20Jungunternehmen%20in%20der%20Schweiz.pdf.download.pdf/EN_Bericht_PO_Derder_Fast_growing_start_ups_in_Switzerland.pdf)) the venture capital market in ${colorLegend("CHE")} was not as mature as the markets in more advanced countries (such as ${colorLegend("ISR")}, the ${colorLegend("USA")}). The VC market has since expanded, but there is still room for improvement.

```js
const isr = view(
  Inputs.toggle({
    label: "incl. Israel and the USA",
    value: true,
  }),
);
```

```js
display(
  line_oecd(
    df_vc,
    "VC investments in % of GDP",
    false,
    "OECD Venture Capital investments",
    "https://data-explorer.oecd.org/vis?lc=en&tm=invest&pg=0&snb=107&vw=tb&df[ds]=dsDisseminateFinalDMZ&df[id]=DSD_VC%40DF_VC_INV&df[ag]=OECD.SDD.TPS&df[vs]=1.0&pd=2007%2C&dq=...PT_B1GQ.A&ly[rw]=BUSINESS_DEVELOPMENT_STAGE&ly[cl]=TIME_PERIOD&ly[rs]=REF_AREA&to[TIME_PERIOD]=false",
    2,
    true,
    true,
  ),
);
```

<a href="./images/venture-capital-gdp-live.png" download="venture-capital-gdp.png">⤓ Download image</a>

<div class="warning" label="Note">The OECD data should be taken with a grain of salt. There is no standard for data collection for VC investment data and there is no single source. The <a href="https://www.investeurope.eu/media/aywhjtsp/20250508_invest-europe_pe-activity-data-2024-report.pdf" target="_blank">Invest Europe data</a> (p.56), which is most likely the source for the OECD data for Switzerland, does not show an upward trend for Switzerland in 2024, but confirms the downward trend in the startupticker.ch data.</div>

### Ecosystem valuation as a share of GDP

Combined valuation of a country's funded startups - market capitalisation or latest VC-round valuation, from Dealroom - as a share of GDP. It is a measure of how large and mature the startup ecosystem is relative to the size of the economy; valuations are based on announced figures or Dealroom's own benchmark estimates, which introduces some estimation uncertainty.

```js
display(
  line_oecd(
    df_ess_valuations_gdp,
    "",
    false,
    "European Commission - Start-up and Scale-up Scoreboard, Dealroom",
    "https://projects.research-and-innovation.ec.europa.eu/en/statistics/performance-indicators/european-startup-scaleup-scoreboard#/",
    1,
    true,
    true,
  ),
);
```

## Total early-stage entrepreneurial activity (TEA)

The share of 18-64 population who are either a nascent entrepreneur or owner-manager of a new business in ${colorLegend("CHE")} has been hovering between 8 and 10 percent. This is a low- to mid-table position among innovation peers.

```js
display(
  line_oecd(
    df_tea,
    "Share of 18-64 population who are either a nascent entrepreneur or owner-manager of a new business in %",
    true,
    "Global Entrepreneurship Monitor",
    "https://gemconsortium.org/reports/latest-global-report",
    1,
    false,
    true,
  ),
);
```

<a href="./images/entrepreneurial-activity-tea-live.png" download="entrepreneurial-activity-tea.png">⤓ Download image</a>

### Founders per million population

Number of startup founders - Dealroom-tracked, VC-backed companies launched since 2020 - per million population. The source only breaks this indicator down for 2025, so this is a single-year snapshot rather than a trend.

```js
display(
  bar_x_country(
    df_ess_founders,
    1,
    "European Commission - Start-up and Scale-up Scoreboard, Dealroom",
    "https://projects.research-and-innovation.ec.europa.eu/en/statistics/performance-indicators/european-startup-scaleup-scoreboard#/",
  ),
);
```

## Unicorn companies

This report uses CB Insights' unicorn database as the main data source, as it offers the best, freely available basis for comparing unicorns across countries. Since there's no official data on unicorns and different sources define them differently, we compared the data to the results of Dealroom, PitchBook, and Crunchbase. While the exact numbers vary, the relative differences between countries are similar.

<div class="warning" label="Note">Please note that these statistics should be thus viewed cautiously, as methods for identifying unicorns differ between data providers. The list of Swiss unicorns makes no claim to completeness or accuracy, but is intended to give an impression.</div>

### Number of unicorn companies relative to GDP

The graph below compares countries' efficiency in creating unicorn companies relative to their economic size, measured as the number of unicorns per $133 billion of GDP. Switzerland produces one unicorn per $133 billion GDP, similar to the Netherlands and Sweden. In contrast, the United States and Israel significantly outperform this benchmark, generating 3-6 times more unicorns relative to their GDP. CB Insights defines a unicorn company, or unicorn startup, as a private company with a valuation over $1 billion.

<div>${display(bar_x_unicorn(df_ug, color_scale))}</div>
<a href="./images/unicorn-density-live.png" download="unicorn-density.png">⤓ Download image</a>

### Unicorns per million population

Number of startups valued at $1 billion or more ("unicorns"), per million population, per Dealroom data - also one of the EU's Start-up and Scale-up Strategy KPIs.

```js
display(
  line_oecd(
    df_ess_unicorns,
    "",
    false,
    "European Commission - Start-up and Scale-up Scoreboard, Dealroom",
    "https://projects.research-and-innovation.ec.europa.eu/en/statistics/performance-indicators/european-startup-scaleup-scoreboard#/",
    1,
    false,
    true,
  ),
);
```

### Swiss unicorn companies

We've also created our own list of Swiss unicorns, including both current unicorns and former ones that have gone public or been acquired, thus some might not meet the strictest unicorn definition. Accordingly, the number is significantly higher than the number in the CB Insights data (28 vs 6). The list is based on the list of the Swiss ICT Investor Club (SICTIC) and has been updated with our own research.

<div>${display(arrow_unicorns(df_unicorns_ch))}</div>
<a href="./images/swiss-unicorns-live.png" download="swiss-unicorns.png">⤓ Download image</a>

## European Start-up and Scale-up Scoreboard

The European Commission's Start-up and Scale-up Scoreboard (ESS) benchmarks EU member states against a handful of non-EU comparators, including Switzerland. Switzerland is not ranked in the complete ranking, but there is data to compare it against its competitors.

### Exits per million population

Number of startup exits - acquisitions and other liquidity events among VC-backed companies tracked by Dealroom - per million population, capturing how often the ecosystem turns startups into successful outcomes.

```js
display(
  line_oecd(
    df_ess_exits,
    "",
    false,
    "European Commission - Start-up and Scale-up Scoreboard, Dealroom",
    "https://projects.research-and-innovation.ec.europa.eu/en/statistics/performance-indicators/european-startup-scaleup-scoreboard#/",
    1,
    false,
    true,
  ),
);
```

#### Sources

- Startupticker.ch ([2026](https://www.startupticker.ch/en/swiss-venture-capital-report)) Venture Capital Report
- SECO ([2017](https://www.seco.admin.ch/dam/seco/en/dokumente/Standortfoerderung/KMU-Politik/Finanzierung%20der%20KMU/Bericht%20Postulat%20Derder%20-%20Rasch%20wachsende%20Jungunternehmen%20in%20der%20Schweiz.pdf.download.pdf/EN_Bericht_PO_Derder_Fast_growing_start_ups_in_Switzerland.pdf)) Fast-growing start-ups in Switzerland
- GEM ([2026](https://gemconsortium.org/reports/latest-global-report)) Global Entrepreneurship Monitor
- European Commission ([2026](https://projects.research-and-innovation.ec.europa.eu/en/statistics/performance-indicators/european-startup-scaleup-scoreboard#/)) Start-up and Scale-up Scoreboard, Dealroom
