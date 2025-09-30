---
title: Knowledge and Technology Transfer
style: styles.css
---

```js
import { bar_stacked_y } from "./components/plots/bar_stacked_y.js"
import { color_range, color_scale, colorLegend, countries } from "./components/utils/colors.js"
import { line_oecd } from "./components/plots/line_plots.js"
import { subtractYears } from "./components/utils/subtractYears.js"

// OECD MSTI Daten laden
const df = await FileAttachment("data/df.csv").csv({ typed: true });
// EU European Innovation Scoreboard Daten laden
const df_eis = await FileAttachment("data/eis_raw_data_2025.csv").csv({
  typed: true,
});
const df_switt = await FileAttachment("data/switt_startup_2024.csv").csv({
  typed: true,
});
const df_patents = df_eis.filter(
  (d) =>
    countries.includes(d.iso3) &
    (d.var === "3.3.1")
).map(d => ({
      ...d,
      zIndex: d.iso3 === "CHE" ? 1 : 0
      }))
      .sort((a, b) => a.zIndex - b.zIndex)
const df_ppcp = df_eis.filter(
  (d) =>
    countries.includes(d.iso3) &
    (d.var === "3.2.2")
).map(d => ({
      ...d,
      zIndex: d.iso3 === "CHE" ? 1 : 0
      }))
      .sort((a, b) => a.zIndex - b.zIndex)
```
# Knowledge and Technology Transfer
## PCT patent applications per billion GDP (in PPS)

${colorLegend("CHE")} is well-positioned and its PCT patent applications per billion GDP have grown steadily with the exceptions of 2019. This holds true as well if we look at patents per capita.

PCT patents are international patents filed through the WIPO-administered Patent Cooperation Treaty. It makes it possible to seek patent protection for an invention simultaneously in a number of countries by filing a single application.

```js
display(line_oecd(df_patents, "PCT patent applications per billion GDP (in PPS)",false, "European Commission / WIPO","", 1, false, true))
```

<a href="./images/pct-patents-live.png" download="pct-patents.png">⤓ Download image</a>

## Public-private co-publications

One of the strengths in the international comparison are ${colorLegend("CHE")}'s public-private co-publications. Only ${colorLegend("DNK")} can keep pace. The Innosuisse monitoring data shows that Innovation Projects with Implementation Partner make their contribution to this knowledge transfer between research and business (54 % report a co-publication as one result of their Innovation Project).

```js
display(line_oecd(df_ppcp,"Public-private publications per million population", false, "European Commission", "", 0, false, true))
```

<a href="./images/public-private-copubs-live.png" download="public-private-copubs.png">⤓ Download image</a>

## Start-ups from Swiss public research organisations

&nbsp;&nbsp;&nbsp;<mark>New:</mark>&nbsp;&nbsp;&nbsp;Universities and other public research organisations have become an important driver of start-up growth in Switzerland. The decline in recent years both in total <span style="border-bottom: solid 2px #0571b0;">start-ups</span> and more pronounced in <span style="border-bottom: solid 2px #06F7DA;">spin-offs (start-ups with a formal licence of IP)</span> has been halted in 2023 with a new record of founded start-ups and slightly higher number of spin-offs.

```js
display(bar_stacked_y(df_switt, "swiTT","https://switt.ch/switt-reports"))
```

<a href="./images/swiss-research-startups-live.png" download="swiss-research-startups.png">⤓ Download image</a>

<div class="note" label="Note">The swiTT report gives a relatively complete picture for start-ups and spin-offs from ETH Zürich, EPFL and universities; universities of applied sciences are less thoroughly represented.</div>

#### Sources
- European Commission ([2024](https://research-and-innovation.ec.europa.eu/statistics/performance-indicators/european-innovation-scoreboard_en)) European Innovation Scoreboard
- SBFI ([2024](https://www.sbfi.admin.ch/sbfi/de/home/dienstleistungen/publikationen/publikationsdatenbank/wtt-endbericht-2023.html)) Monitoring des Wissens- und Technologietransfers in der Schweiz
- swiTT ([2025](https://switt.ch/switt-reports)) swiTTreport 2024&nbsp;&nbsp;&nbsp;<mark>New</mark>
- Innosuisse ([2025](https://discover-innosuisse.ch/)) Discover&nbsp;&nbsp;&nbsp;<mark>New</mark>
- Innosuisse ([2025](https://www.innosuisse.admin.ch/en/figures-funding-data-portal)) Figures: funding data portal</a>&nbsp;&nbsp;&nbsp;<mark>New</mark>

```js
// Funktion, um die Jahresskala neu zu definieren. Die den rawdata angegebenen Daten des EIS beziehen sich auf das Jahr des SII nicht auf das letzte Jahr der Erhebung.

```