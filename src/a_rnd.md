---
title: Research & Development
style: styles.css
---

```js
// Load components
import { line_cis, line_oecd, line_oecd_gbard } from "./components/plots/line_plots.js"
import { bar_stacked_y_normalized, area_stacked_y_gerd_ch } from "./components/plots/bar_stacked_y.js"
import { bar_stacked_x } from "./components/plots/bar_stacked_x.js"
import { country_iso3, iso3_country } from "./components/utils/countries.js"
import { color_scale, colorLegend, countries } from "./components/utils/colors.js"
import { rnd_ch_sankey } from "./components/plots/sankey.js"
import * as aq from "npm:arquero";

// Load data
const df_gtard = await FileAttachment("./data/df_gtard.csv").csv({ typed: true });
const df_oecd_msti = await FileAttachment("./data/df_oecd_msti.csv").csv({ typed: true });
const df_rnd_ch = await FileAttachment("./data/rnd_ch_2023.csv").csv({ typed: true });
const df_rnd_type = await FileAttachment("./data/df_rnd_type.csv").csv({ typed: true });

// Manipulate data
function filter_oecd_msti(data, unit = "PT_B1GQ", measure = "G", countries = ["CHE"]) {
  return data
    .filter((d) => d.unit === unit && d.measure === measure && countries.includes(d.iso3))
    .sort((a, b) => {
      // First sort by country: CHE comes first
      if (a.iso3 === "CHE" && b.iso3 !== "CHE") return 1;
      if (a.iso3 !== "CHE" && b.iso3 === "CHE") return -1;
      
      // Then sort by year
      return a.year - b.year;
    });
}
const df_gerd = filter_oecd_msti(df_oecd_msti, "PT_B1GQ", "G", countries).filter(d => d.iso3 !== "GBR")
df_gerd.push({iso3: "CHE", country: "Switzerland", measure: "G", measure_name: "Gross Domestic Expenditure on R&D (GERD)", unit: "PT_B1GQ", unit_name: "Percentage of GDP", year: 2021, obs_value: 3.2, year_date: new Date("2023-01-01")})
const df_gerd_gov = filter_oecd_msti(df_oecd_msti, "PT_B1GQ","G_FG", countries)
const df_berd_gov = filter_oecd_msti(df_oecd_msti, "PT_BERD","B_FG", countries);
const df_rnd_personnel = filter_oecd_msti(df_oecd_msti, "10P3EMP","T_TT", countries)
const df_gbard_tax = df_gtard
    .filter((d) => countries.includes(d.iso3))
    .sort((a, b) => a.year - b.year); // only for selected countries
const df_gerd_type = aq.from(df_oecd_msti.filter((d) => ["B", "GV", "H"].includes(d.measure) &&
      d.unit === "PT_B1GQ" &&
      countries.includes(d.iso3) &&
      [2021].includes(d.year)
  )).groupby('country')
  .derive({
    country_total: d => aq.op.sum(d.obs_value)
  })
  .ungroup()
  .derive({
    share: d => (d.obs_value / d.country_total) * 100
  })
  .select(aq.not('country_total'))
  .orderby('measure_name', aq.desc('share'))
const df_gerd_type1 = df_gerd_type.objects()
const domain1 = df_gerd_type.filter(d=> d.measure === "B").orderby('measure_name', 'share')
    .array("country")
const order1 = df_gerd_type.groupby('measure_name').count().orderby(aq.desc('measure_name')).array('measure_name')
const df_gerd_type3 = aq.from(df_oecd_msti.filter((d) => ["G_FA", "G_FON", "G_FG", "G_FB"].includes(d.measure) &&
      d.unit === "PT_B1GQ" &&
      countries.includes(d.iso3) &&
      [2021].includes(d.year)
  )).groupby('country')
  .derive({
    country_total: d => aq.op.sum(d.obs_value),
    measure_name: d => d.measure === "G_FA" ? "Rest of the world" : d.measure === "G_FB" ? "Business sector" : d.measure ==="G_FG" ? "Government" : "Higher Education and PNP sectors"
  })
  .ungroup()
  .derive({
    share: d => (d.obs_value / d.country_total) * 100
  })
  .select(aq.not('country_total'))
  .orderby('measure_name', aq.desc('share'))
const df_gerd_type2 = df_gerd_type3.objects()
const domain2 = df_gerd_type3.filter(d=> d.measure === "G_FB").orderby('measure_name', 'share')
    .array("country")
const order2 = df_gerd_type3.groupby('measure_name').count().orderby(aq.desc('measure_name')).array('measure_name')
const rnd_type = df_rnd_type.filter(d => countries.includes(d.iso3))
const rnd_type2023 = rnd_type.map((d) => ({
  ...d,
share: (d.iso3 === "CHE" && d.type === "Applied research") ? 37.9 : 
(d.iso3 === "CHE" && d.type === "Basic research") ? 27.2 : (d.iso3 === "CHE" && d.type === "Experimental development") ? 34.9 : d.share
    }))
const df_ch_gerd = df_oecd_msti.filter(
  (d) => ["B", "GV", "H"].includes(d.measure) &&
  d.unit === "PT_B1GQ" &&
  ["CHE"].includes(d.iso3) &&
  [2021, 2019, 2017].includes(d.year));
```
# Research & Development (R&D)

## Funding and expenditure on R&D in Switzerland by sector in 2023
&nbsp;&nbsp;&nbsp;<mark>New:</mark>&nbsp;&nbsp;&nbsp;In Switzerland, as in almost all countries, the majority of R&D funding originates from and flows to business enterprises. However, Switzerland has a comparatively high outflow of R&D funding abroad and a comparatively low inflow. The high outflow of R&D funding is likely due to the strong presence of multinational firms, and among them the very R&D-active pharmaceutical companies. 

The federal government primarily funds R&D via the higher education sector, directly via universities (mainly the Swiss Federal Institutes of Technology ETH and EPFL) and indirectly via its national agencies, the Swiss National Science Foundation and Innosuisse. See new FSO graph for more detail: [DE](https://www.bfs.admin.ch/bfs/en/home/news/whats-new.assetdetail.33948459.html) / [FR](https://www.bfs.admin.ch/bfs/fr/home/actualites/quoi-de-neuf.assetdetail.33948457.html).

```js
display(rnd_ch_sankey(df_rnd_ch))
```
<figcaption><span>Source: <a href="https://www.bfs.admin.ch/bfs/de/home/aktuell/neue-veroeffentlichungen.assetdetail.33948456.html" target="_blank">Federal Statistical Office</a><br>Note: Private non-profit organizations (PNP) are included for comprehensiveness; however, they represent only a marginal portion of total funding (CHF 0.1 bn) and expenditure (CHF 0.3 bn).</span></figcaption>
<a href="./images/swiss-rnd-sankey-live.png" download="swiss-rnd-sankey.png">⤓ Download image</a>

In the following, we look in more detail at R&D funding from two perspectives:
- [R&D Expenditure: Who performs the R&D?](#r-and-d-expenditure)
- [R&D Funding: Who finances the R&D?](#r-and-d-funding)
<div class="note" label="Note">
The Federal Statistical Office (FSO) has just published its data for 2023. However, the OECD's data that allows for international comparison has not been updated yet. We've added data and comments for the year 2023 for Switzerland where we thought it was important and where we could do it with confidence.
</div>

## R&D Expenditure

### Gross Domestic Expenditure on Research and Development (GERD) in % of GDP 2017–2023

&nbsp;&nbsp;&nbsp;<mark>New:</mark>&nbsp;&nbsp;&nbsp;${colorLegend("CHE")} is among the top five of the most innovative countries in R&D spending as a percentage of GDP (3.2% or CHF 25.9 billion). Its GERD has slightly declined by 0.1 percentage point from 2021 to 2023, because the GDP grew faster than the spending on R&D. The R&D expenditures of ${colorLegend("ISR")} and ${colorLegend("KOR")} have increased significantly, while others stagnate on levels comparable to Switzerland. In the [graph above](#funding-and-expenditure-on-r-and-d-in-switzerland-by-sector-in-2023), GERD corresponds to the R&D expenditure in the column on the right minus the expenditure that flows abroad.

```js
display(line_oecd(df_gerd,"GERD in % of GDP",false,"OECD Main Science and Technology Indicators (MSTI)","https://oe.cd/msti", 1, true, true))
```
<a href="./images/gerd-gdp-comparison-live.png" download="gerd-gdp-comparison.png">⤓ Download image</a>

### GERD by sector in % of GDP 2021

Research and Development in Switzerland is mainly performed by <span style="border-bottom: solid 2px #0571b0">private businesses</span> or <span style="border-bottom: solid 2px #FCE300">higher education institutions</span> and rarely by the <span style="border-bottom: solid 2px #06F7DA">government</span> itself. Switzerland has one of the lowest share of R&D performed by government institutions. Sweden and Denmark's pattern of research and development most closely mirrors that of Switzerland. The high proportion of R&D carried out by the private sector in Israel is also striking.

```js
// Create the main input
const normalizeInput = Inputs.toggle({
  label: "Normalized to 100%",
  value: true
});

const normalize = view(normalizeInput);
```
```js
display(bar_stacked_y_normalized(df_gerd_type1, normalize, domain1, order1))

// <div class="note" label="Note">Innosuisse's primary instrument – Innovation Projects – contributes to the <span style="border-bottom: solid 2px #4269d0">Higher Education Expenditure on R&D (HERD)</span> since it only covers the research partner's costs while requiring companies to self-fund their portion of the project. In contrast, the newer funding instruments – Swiss Accelerator and Start-up Innovation Projects – would contribute to <span style="border-bottom: solid 2px #ff725c">Business Enterprise Expenditure on R&D (BERD)</span> as they provide direct financial support to companies. However, these programs fall outside the relevant time frame since they were only recently introduced.</div>

//### Switzerland's Gross Domestic Expenditure on Research and Development (R&D) in % of GDP 2017–2021)
//display(area_stacked_y_gerd_ch(df_ch_gerd))
```
<a href="./images/rnd-expenditure-by-sector-live.png" download="rnd-expenditure-by-sector.png">⤓ Download image</a>

### R&D expenditure by type of research in % of GERD 2023
&nbsp;&nbsp;&nbsp;<mark>New:</mark>&nbsp;&nbsp;&nbsp;Compared to other innovation leaders, Switzerland has a relatively high share of R&D expenditure in both <span style="border-bottom: solid 2px #0571b0">basic</span> and <span style="border-bottom: solid 2px #06F7DA">applied research</span>, which seek fundamental knowledge without immediate practical goals or target specific practical problems and directed towards application. Consequently, the share of expenditure for <span style="border-bottom: solid 2px #A2AFE9">experimental development</span>, which more clearly focuses on creating or improving products, processes, or services, is rather small. 

```js
display(bar_stacked_x(rnd_type2023))
```
<a href="./images/rnd-activities-by-type-live.png" download="rnd-activities-by-type.png">⤓ Download image</a>

## R&D Funding

### GERD financed by sector in % of GDP 2021
&nbsp;&nbsp;&nbsp;<mark>New:</mark>&nbsp;&nbsp;&nbsp;The main source of R&D funding is the business sector itself. Switzerland's domestic <span style="border-bottom: solid 2px #0571b0">business sector</span> share is among the top 3 of its innovation leader peers. The same holds true for <span style="border-bottom: solid 2px #06F7DA">government spending</span> on R&D (see [next graph](#gerd-financed-by-government-in-of-gdp-2017-2022) as well). <span style="border-bottom: solid 2px #FCE300">Higher education institutions</span> contribute an average and the <span style="border-bottom: solid 2px #FF8774">rest of the world</span> a below average share to the Swiss R&D funding.

Interesting here are Israel, and to a lesser extent Finland and Sweden, which are able to attract sizeable foreign direct investment into domestic R&D. Israel's funding for R&D would be average if it weren't for the high influx of foreign R&D funding.

```js
// Create a second input bound to the first
const normalizeSecond = view(
  Inputs.bind(
    Inputs.toggle({
      label: "Normalized to 100%"
    }),
    normalizeInput  // Bind to the input element, not the view
  )
);
```

```js
display(bar_stacked_y_normalized(df_gerd_type2, normalize, domain2, order2))
```
<a href="./images/rnd-funding-sources-live.png" download="rnd-funding-sources.png" class="download-link">⤓ Download image</a>

### GERD financed by government in % of GDP 2017–2022

${colorLegend("CHE")}'s government-financed R&D remained stable in the last 5 years, but will likely decrease to 0.83 % in 2023 (official OECD data is not published yet). Meanwhile, ${colorLegend("DEU")} and ${colorLegend("KOR")} have increased their financing ratio to GDP. Interestingly, ${colorLegend("ISR")} has a comparatively low share of government-financed GERD. Its R&D is mainly driven by private funding, especially from abroad (cf. also [venture capital investments](b_ens#venture-capital-investments-in-of-gdp-2017-2024)). 

```js
display(line_oecd(df_gerd_gov, "% of GDP", false, "OECD Main Science and Technology Indicators (MSTI)", "https://oe.cd/msti", 1, true, true))
```
<a href="./images/government-rnd-funding-live.png" download="government-rnd-funding.png">⤓ Download image</a>

### Business expenditure on R&D (BERD) financed by government

${colorLegend("CHE")}'s restrained approach to direct funding of BERD stands out clearly in an international comparison. Compared to other countries there has been very little direct financial support for business R&D. The statement still holds if tax incentives for R&D are included, see note below. 

The official OECD statistics are not out yet, but in 2023 the value for ${colorLegend("CHE")}'s government financed business enterprise expenditure on R&D is likely to rise to 1.7%, probably due to the new Innosuisse instruments Swiss Accelerator and the start-up innovation projects. However, this has very little effect on Switzerland's position.

```js
display(line_oecd(df_berd_gov, "% of business enterprise expenditure on R&D", false, "OECD Main Science and Technology Indicators (MSTI)", "https://oe.cd/msti", 1, true, true))
// title: 'Business expenditure on R&D (BERD) financed by government'
```
<a href="./images/government-business-rnd-live.png" download="government-business-rnd.png">⤓ Download image</a>

<div class="note" label="Note">
  <details>
    <summary>
      The picture is similar, if tax incentives for R&D are included and set in
      relation to GDP.
    </summary>
    <div class="card" style="background-color: white;">
      <h2>
        Sum of tax incentive support for business R&D (GTARD) and
        government-financed BERD in % of GDP
      </h2>
      ${display(line_oecd(df_gbard_tax,"% of GDP", false, "OECD R&D Tax Incentives database","https://data-explorer.oecd.org/vis?lc=en&df[ds]=dsDisseminateFinalDMZ&df[id]=DSD_RDTAX%40DF_RDTAX&df[ag]=OECD.STI.STP&df[vs]=1.0&dq=.A.DF_GTARD.PT_B1GQ..&pd=2015%2C&to[TIME_PERIOD]=false&vw=tb",2))}
    </div>
  </details>
</div>

## R&D Personnel

The share of personnel employed in R&D has increased over the years. ${colorLegend("CHE")} is no exception and its trend will continue as well in 2023 with 18.2 R&D personnel per 1'000 employment.

```js
display(line_oecd(df_rnd_personnel, "R&D personnel per 1'000 employment", false, "OECD Main Science and Technology Indicators (MSTI)", "https://oe.cd/msti", 1, false, false)) 
// title: 'R&D personnel per 1\'000 employment',
```
<a href="./images/rnd-personnel-intensity-live.png" download="rnd-personnel-intensity.png">⤓ Download image</a>

#### Sources
- For more detail, see chapter 4 of the Research and Innovation in Switzerland 2022 Interim Report: SBFI ([2022](https://www.sbfi.admin.ch/sbfi/de/home/forschung-und-innovation/forschung-und-innovation-in-der-schweiz/f-und-i-bericht.html)) Forschung und Innovation in der Schweiz – Zwischenbericht 2022
