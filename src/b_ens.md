---
title: Entrepreneurship and Start-ups
style: styles.css
---

```js
import { color_scale, color_range, colorLegend, countries } from "./components/utils/colors.js"
import { line_oecd } from "./components/plots/line_plots.js"
import { bar_x, bar_x_unicorn } from "./components/plots/bar_x.js"
import { bar_vc_ch } from "./components/plots/bar_y.js"
import { arrow_unicorns } from "./components/plots/arrow_y.js"
import * as aq from "npm:arquero";

const df_oecd_vc = await FileAttachment("data/df_oecd_vc.csv").csv({typed: true});
const df_vc_gdp = await FileAttachment("data/20241024_vc.txt").tsv({typed: true});
const df_gem_tea = await FileAttachment("data/gem_tea_2018-2024.csv").csv({typed: true});
const df_vc_ch = await FileAttachment("data/df_startupticker_vc.csv").csv({typed: true});
const countries_filtered = isr ? countries.filter(d => !["DEU", "FIN", "NLD", "SWE"].includes(d)) : countries.filter(d => !["ISR", "USA"].includes(d))
const df_vc = df_oecd_vc.filter(
    (d) =>
      (d.measure === "VC_INV_MKT") && // R&D Personnel
      (d.bds === "_T") &&
      (d.unit === "PT_B1GQ") && // per 1'000 employment
      countries_filtered.includes(d.iso3)
  ).sort((a, b) => a.year - b.year);
const df_tea = df_gem_tea
    .filter((d) => countries.includes(d.iso3))
    .sort((a, b) => a.year - b.year)
    .map(d => ({
      ...d,
      country: d.economy,
      year_date: new Date(d.year.toString()),
      zIndex: d.iso3 === "CHE" ? 1 : 0
      }))
      .sort((a, b) => a.zIndex - b.zIndex)
const df_vc_ch_rounds = df_vc_ch.filter((d) => d.measure === "Financing rounds of Swiss start-ups" && d.year_date > new Date("2017"));
const df_vc_ch_fin = df_vc_ch.filter((d) => d.measure === "Invested capital in Swiss start-ups" && d.year_date > new Date("2017"));
const df_epo = await FileAttachment("./data/df_epo.csv").csv({ typed: true });
const df_oecd_msti = await FileAttachment("./data/df_oecd_msti.csv").csv({ typed: true });
const df_unicorns_country = await FileAttachment("./data/df_unicorns_country.csv").csv({ typed: true });
const df_unicorns_ch = await FileAttachment("./data/df_unicorns_ch.csv").csv({ typed: true });
const gdp = df_oecd_msti
    .filter(
      (d) =>
        d.year_date < new Date("2024-01-01") &&
        d.year_date > new Date("2022-01-01") &&
        countries.includes(d.iso3) &&
        d.unit === "USD_PPP" &&
        d.measure === "GDP"
    )
    .map((d) => ({
      iso3: d.iso3,
      country: d.country,
      year: d.year_date,
      measure: d.measure_name,
      gdp: d.obs_value
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
        gdp_unicorn: unicorn.unicorns / (gdpRecord.gdp / 133000)
      };
    });
```

# Entrepreneurship and Start-ups
## Venture capital market in Switzerland
<mark>New:</mark>&nbsp;&nbsp;&nbsp;Venture capital availability in ${colorLegend("CHE")} has been increasing steadily until 2022, but has declined since. The financing rounds have become only slightly fewer, but smaller. The in- and then decreasing VC funding with a peak in 2021/2022 is mirrored in other countries (see below).

<div style="display: grid; grid-template-columns: 1fr 1fr; max-width: 640px">
    ${bar_vc_ch(df_vc_ch_fin)}
  ${bar_vc_ch(df_vc_ch_rounds)}

</div>

## Venture capital investments in % of GDP 2017–2024
According to the report «Fast-growing start-ups in Switzerland» ([SECO, 2017](https://www.seco.admin.ch/dam/seco/en/dokumente/Standortfoerderung/KMU-Politik/Finanzierung%20der%20KMU/Bericht%20Postulat%20Derder%20-%20Rasch%20wachsende%20Jungunternehmen%20in%20der%20Schweiz.pdf.download.pdf/EN_Bericht_PO_Derder_Fast_growing_start_ups_in_Switzerland.pdf)) the venture capital market in ${colorLegend("CHE")} was not as mature as the markets in more advanced countries (such as ${colorLegend("ISR")}, the ${colorLegend("USA")}). The VC market has since expanded, but there is still room for improvement.

```js
const isr = view(
  Inputs.toggle({
    label: "incl. Israel and the USA",
    value: true
  })
);
```

```js
display(line_oecd(df_vc,"VC investments in % of GDP",false,"OECD Venture Capital investments","https://data-explorer.oecd.org/vis?lc=en&tm=invest&pg=0&snb=107&vw=tb&df[ds]=dsDisseminateFinalDMZ&df[id]=DSD_VC%40DF_VC_INV&df[ag]=OECD.SDD.TPS&df[vs]=1.0&pd=2007%2C&dq=...PT_B1GQ.A&ly[rw]=BUSINESS_DEVELOPMENT_STAGE&ly[cl]=TIME_PERIOD&ly[rs]=REF_AREA&to[TIME_PERIOD]=false", 1, false, true))
```
<a href="./images/venture-capital-gdp-live.png" download="venture-capital-gdp.png">⤓ Download image</a>

<div class="warning" label="Note">The OECD data should be taken with a grain of salt. There is no standard for data collection for VC investment data and there is no single source. The <a href="https://www.investeurope.eu/media/aywhjtsp/20250508_invest-europe_pe-activity-data-2024-report.pdf" target="_blank">Invest Europe data</a> (p.56), which is most likely the source for the OECD data for Switzerland, does not show an upward trend for Switzerland in 2024, but confirms the downward trend in the startupticker.ch data.</div>

## Total early-stage entrepreneurial activity (TEA)
<mark>New:</mark>&nbsp;&nbsp;&nbsp;The share of 18-64 population who are either a nascent entrepreneur or owner-manager of a new business in ${colorLegend("CHE")} has been hovering between 8 and 10 percent. This is a low- to mid-table position among innovation peers.

```js
display(line_oecd(df_tea, "Share of 18-64 population who are either a nascent entrepreneur or owner-manager of a new business in %", true,"Global Entrepreneurship Monitor","https://gemconsortium.org/reports/latest-global-report", 1, false, true))
```
<a href="./images/entrepreneurial-activity-tea-live.png" download="entrepreneurial-activity-tea.png">⤓ Download image</a>

## Technology Intensity of Investment Portfolios 
<mark>New:</mark>&nbsp;&nbsp;&nbsp;The European Patent Office (EPO) links its own patent data to [dealroom.co](https://dealroom.co)'s data on investors and their investments and creates a comparative analysis of the technology intensity of the investment portfolios in Europe and the US.

The EPO introduces the metric **Technology Investor Score (TIS)** designed to identify investors specialized in supporting high-tech companies. The TIS measures the percentage of companies with at least one patent within an investor’s portfolio. A high TIS indicates an investor’s engagement with innovation-driven companies. 

The analysis reveals _"significant funding gaps between Europe and the US for high-TIS private investors, particularly in critical technology sectors with high growth potential. These gaps are also most evident in the later-stage funding rounds essential for scaling up. Instead, we find a funding surplus for public investors."_

In other words, the US has more funding from high-TIS investors who are private, specialize in later-stage rounds (scale-up), and invest in high-tech sectors. This is only partially offset in Europe by greater funding from public investors. 

These funding gaps also apply to Switzerland. However, they are less pronounced than in other European countries because Switzerland ranks at the top in most categories compared to its European peers, including having a more mature VC market and investors with higher TIS scores. Innosuisse also appears as a public investor with a high TIS score, primarily because its support for the Swiss Accelerator and Start-up Innovation Projects is included in the dealroom.co data.

### Average Technology Investor Score (TIS) by country
<div>${display(bar_x(df_epo, "country", "EPO", "https://epo.org/mapping-investors"))}</div>
<a href="./images/technology-investor-score-country-live.png" download="technology-investor-score-country.png">⤓ Download image</a>

### TIS-Score of top Swiss investors
<div>${display(bar_x(df_epo, "investor", "EPO", "https://epo.org/mapping-investors"))}</div>
<a href="./images/swiss-investor-scores-live.png" download="swiss-investor-scores.png">⤓ Download image</a>

## Unicorn companies
<mark>New:</mark>&nbsp;&nbsp;&nbsp;This report uses CB Insights' unicorn database as the main data source, as it offers the best, freely available basis for comparing unicorns across countries. Since there's no official data on unicorns and different sources define them differently, we compared the data to the results of Dealroom, PitchBook, and Crunchbase. While the exact numbers vary, the relative differences between countries are similar.

<div class="warning" label="Note">Please note that these statistics should be thus viewed cautiously, as methods for identifying unicorns differ between data providers. The list of Swiss unicorns makes no claim to completeness or accuracy, but is intended to give an impression.</div>

### Number of unicorn companies relative to GDP
The graph below compares countries' efficiency in creating unicorn companies relative to their economic size, measured as the number of unicorns per $133 billion of GDP. Switzerland produces one unicorn per $133 billion GDP, similar to the Netherlands and Sweden. In contrast, the United States and Israel significantly outperform this benchmark, generating 3-6 times more unicorns relative to their GDP. CB Insights defines a unicorn company, or unicorn startup, as a private company with a valuation over $1 billion.

<div>${display(bar_x_unicorn(df_ug, color_scale))}</div>
<a href="./images/unicorn-density-live.png" download="unicorn-density.png">⤓ Download image</a>

### Swiss unicorn companies
We've also created our own list of Swiss unicorns, including both current unicorns and former ones that have gone public or been acquired, thus some might not meet the strictest unicorn definition. Accordingly, the number is significantly higher than the number in the CB Insights data (28 vs 6). The list is based on the list of the Swiss ICT Investor Club (SICTIC) and has been updated with our own research.
<div>${display(arrow_unicorns(df_unicorns_ch))}</div>
<a href="./images/swiss-unicorns-live.png" download="swiss-unicorns.png">⤓ Download image</a>

#### Sources
- Startupticker.ch ([2025](https://www.startupticker.ch/en/swiss-venture-capital-report)) Venture Capital Report&nbsp;&nbsp;&nbsp;<mark>New</mark>
- SECO ([2017](https://www.seco.admin.ch/dam/seco/en/dokumente/Standortfoerderung/KMU-Politik/Finanzierung%20der%20KMU/Bericht%20Postulat%20Derder%20-%20Rasch%20wachsende%20Jungunternehmen%20in%20der%20Schweiz.pdf.download.pdf/EN_Bericht_PO_Derder_Fast_growing_start_ups_in_Switzerland.pdf)) Fast-growing start-ups in Switzerland
- GEM ([2025](https://gemconsortium.org/reports/latest-global-report)) Global Entrepreneurship Monitor&nbsp;&nbsp;&nbsp;<mark>New</mark>
- European Patent Office ([2025](https://epo.org/mapping-investors)) Mapping investors for European innovators