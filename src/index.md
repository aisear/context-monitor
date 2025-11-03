---
title: Innovation Ecosystem Monitor 2024
style: styles.css
header: <a href="https://www.innosuisse.admin.ch/en" class="logo" id="header-logo-container" aria-label="Open Homepage"><img src="/images/swiss-logo.svg" class="logo_flag" tabindex="0" alt="Logo with Swiss flag""></a><a href="https://www.innosuisse.admin.ch/en" class="no-underline">Innosuisse<br>Swiss Innovation Agency</a>
---

```js
import { plot_eis, plot_rank_bump } from "./components/plots/rank.js"
import { arrow_eis } from "./components/plots/arrow_y.js"
//import { iso3_country } from "./components/utils/countries.js"
import { color_scale, colorLegend, countries } from "./components/utils/colors.js"
// // EU European Innovation Scoreboard Daten laden
//const df_eis = await FileAttachment("data/eurostat_eis_values.csv").csv({typed: true});
const df_rank = await FileAttachment("data/rankings_2025.csv").csv({ typed: true });
const df_ranking = df_rank
    .map((item) => ({
      iso3: item.iso3,
      country: item.country,
      index: item.index,
      index_name: item.index_name,
      year: item.year.toString().substring(0, 4),
      year_date: item.year,
      rank: item.rank,
    }))
    .filter(
      (d) =>
        countries.includes(d.iso3) &&
        (d.year_date > new Date("2021-12-31") || d.year_date === "NA") 
        //&& ["2022", "2023", "2024", "Change"].includes(d.year)
    );
// First, sort the eis_score data by SII_2024 in descending order
//const df_eis = await FileAttachment("data/eurostat_eis_values.csv").csv({typed: true});
const df_eis = await FileAttachment("data/eis_raw_data_2025.csv").csv({typed: true});
// Rankingdaten laden.
const df_eis_filtered = df_eis.filter((d) => countries.includes(d.iso3) && (d.var === "SII"));
const df_eis_pivoted = aq
  .from(df_eis.filter((d) => countries.includes(d.iso3) & d.var === "SII"))
  .filter((d) => d.year === 2025 || d.year === 2021)
  .groupby("country", "iso3")
  .pivot("year", "obs_value")
  .orderby(aq.desc("2025"))
  .objects();
const df_eis_sorted = df_eis_pivoted.map((d) => d.country);

const df_gii = await FileAttachment("data/gii_2021_2025_score.csv").csv({typed: true});
const df_gii_filtered = df_gii.filter((d) =>
    countries.includes(d.iso3)
  );
const df_gii_pivoted = aq
    .from(df_gii_filtered)
    .groupby("country", "iso3")
    .pivot("year", "obs_value")
    .orderby(aq.desc("2025"))
    .objects();
  // Extract the sorted country names
const df_gii_sorted = df_gii_pivoted.map((d) => d.country);

```
<div style="background: transparent linear-gradient(284deg, #AFBDFA 0%, #FE8776 100%) no-repeat padding-box; height: 60px; width: 650px; padding-left: 48px; padding-top: 1px; padding-bottom: 60px;  margin-left: -48px; margin-top: -31px;">

# Innovation Ecosystem Monitor
</div>

## Mapping Switzerland's Innovation Strengths, Weaknesses and Their Evolution Over Time
### What is the monitors purpose?

The goal of this monitor is to provide an overview of the competitiveness of Switzerland's innovation ecosystem in an international context and go into more detail where it is relevant to Innosuisse. The monitor aims to provide a better understanding of the strengths and weaknesses of the Swiss innovation ecosystem and its development over time. Wherever possible the monitor links to reports that describe the findings in more detail. The report is updated at least once a year after the publication of most indices in autumn.

### From the abstract to the concrete

Switzerland regularly appears on top of international innovation rankings. These indices are constructed out of a multitude of indicators, they present different perspectives on the innovation ecosystem and their selection influences the final ranking.

In the following, the report will first take a bird's eye view and look at different innovation indices (see below ↓) and then will dive into detail and shed light on selected environment and framework conditions (menu on the left hand side ←). The starting point for the in-depth analyses are selected indicators from the European Innovation Scoreboard (EIS).

<div class="note" label="Note">
This is a new version of a previously internal Innovation Ecosystem Monitor published in Q3/2024. Differences in the findings or more recent sources compared to this version are highlighted in light blue like this: &nbsp;&nbsp;<mark>New</mark>&nbsp;&nbsp;. There have been major updates to the R&D, the innovation activities and the start-up chapter and only minor updates to this introductory and the knowledge transfer chapter.
</div>

## Switzerland maintains its position on top

${colorLegend("CHE")}'s top position in the two most prominent international innovation rankings is stable. Generally, there is not a lot of movement among the top 10 countries in both the Global Innovation Index (GII) and the European Innovation Scoreboard (EIS). Only ${colorLegend("SWE")}, ${colorLegend("KOR")} and ${colorLegend("CHN")} have made significant progress in both rankings. ${colorLegend("CHN")} has entered for the first time into the top 10 of the GII and is very close in the EIS.

```js
display(plot_rank_bump(df_ranking, ["EIS", "GII"], true, html`Sources: WIPO (2024), European Commission (2025)`))
// display(plot_rank(df_ranking, domain_rank_gii, ["EIS", "GII", "EIQ"],"Sources: WIPO (2024), European Commission (2024) & Economist Impact (2023)", true))
```
<a href="./images/innovation-rankings-live.png" download="innovation-rankings.png">⤓ Download image</a>

<div class="note" label="FAQ">
  <details>
  <summary>Why are the Swiss S&T clusters not top-ranked?</summary>
  <p>Here, only Zurich region (rank 50, -1 compared to 2023) and Basel region (rank 96, +1 compared to 2023) rank among the <a href="https://www.wipo.int/web/global-innovation-index/2024/science-technology-clusters">top 100 Science & Technology-Clusters</a>, behind among others Paris (12), London (21), Munich (22), Stuttgart (29). 
  
  The reason why Switzerland appears nonetheless at the top of the rankings as a country is twofold: 
  1. The S&T-Clusters are - unlike the countries - not compared relative to their size, but in absolute terms. Consequently bigger clusters have an advantage.
  2. The concentration of S&T-Clusters in Switzerland is very high in relation to the rest of the country (and in contrast to other countries).</p></details></div>
<p></p>

## However, followers are catching up

### Comparison of the score evolution for GII and EIS 2021–2025

With the newest update of the European Innovation Scoreboard, ${colorLegend("CHE")} has made modest losses in its score. Others – ${colorLegend("SWE")}, ${colorLegend("KOR")} and ${colorLegend("DNK")} – have made up substantial ground and are closing the gap. The methodology of the EIS has been modified to include variables that measure an economies exposure to supply chain disruption. This penalises Switzerland with its products with high complexity and its corresponding dependence on high-tech imports from outside the EU.

The Global Innovation Index on the other hand, with its broader scope of indicators, shows no similar narrowing of the gap between ${colorLegend("CHE")} and its closest competitors, except for the rise of ${colorLegend("CHN")}, reflected in both indices.  

```js
display(arrow_eis(df_eis_pivoted, df_eis_filtered, df_eis_sorted, "2021","2025", false));
```
<a href="./images/eis-progress-arrow-live.png" download="eis-progress-arrow.png">⤓ Download image</a>

```js
display(arrow_eis(df_gii_pivoted, df_gii_filtered, df_gii_sorted, "2021","2025", true));
```

### Switzerland's strengths and weaknesses

If we look at the relative strengths in both indices, they both highlight Switzerland’s extraordinary performance in the scientific output of its research system and the comparatively close links between industry and science reflected in the public-private co-publications.

The relative weaknesses are more diverse ranging from Switzerland’s reluctant approach to government support, to foreign direct investment net inflows  to trade impacts. An interesting difference between the EIS and GII is the high-tech imports indicator. While the EIS values it negatively as measure of dependency on critical imports, the GII values it positively as measure of economic complexity and capability to absorb knowledge from outside. Both perspectives have their raison d'être; they are two sides of the same coin, and which perspective holds true depends on how open the global economy will remain.

| | European Innovation Scoreboard | Global Innovation Index |
|-------------------------------|-------------------------------|------------------------|
| **Relative<br>strengths** | [Public-private co-publications](d_ktt#public-private-co-publications)<br>*Innovation linkages* | University–industry R&D collaboration<br>*Innovation linkages* |
| | International scientific co-publications<br>*Attractive research systems* | Patents by origin/bn PPP$ GDP<br>*Knowledge creation* |
| | Foreign doctorate students as a share of all doct. stud.<br>*Attractive research systems* | Production and export complexity<br>*Knowledge diffusion* |
| **Relative<br>weaknesses** | [Direct & indirect government support of business R&D](a_rnd#business-expenditure-on-r-and-d-berd-financed-by-government)<br>*Finance and support* | FDI net inflows, % GDP<br>*Knowledge absorption* |
| | High-tech imports from outside the EU<br>*Trade impacts* | ICT use<br>*ICT* |
| | [Exports of medium and high-tech products](e_snd#exports-of-medium-and-high-technology-products-as-a-share-of-total-products-exports)<br>*Trade impacts* | Domestic industry diversification<br>*Trade, diversification and market scale* |
| **↗ Strong<br>increases** | [Venture capital expenditures](b_ens#venture-capital-investments-in-of-gdp-2017-2024)<br>*Finance and support* | Applied tariff rate, weighted avg., %<br>*Trade, diversification and market scale* |
| | [Sales of new-to-market and new-to-firm innovations](c_inno#sales-of-new-to-market-and-new-to-enterprise-innovations-as-a-percentage-of-turnover)  <br>*Sales and employment impacts* | High-tech imports, % total trade<br>*Knowledge absorption* |
| | Population involved in lifelong learning<br>*Human resources* | Industrial designs by origin/bn $ GDP<br>*Intangible assets* |
| **↘ Strong<br>decreases** | SMEs introducing business process innovations<br>*Innovators* | FDI net inflows, % GDP<br>*Knowledge absorption* |
| | Design applications<br>*Intellectual assets* | ICT services imports, % total trade<br>*Knowledge absorption* |
| | Employment in innovative enterprises<br>*Sales and employment impacts* | Labor productivity growth, %<br>*Knowledge impact* |

## Switzerland is one of the most competitive countries
<mark>New:</mark>&nbsp;&nbsp;&nbsp;${colorLegend("CHE")} is also well positioned in other, less innovation focused rankings, such as IMD's competitiveness rankings, where it has recently made significant progress in both the competitiveness and the digital competitiveness ranking.

```js
display(plot_rank_bump(df_ranking, ["WCR", "WDCR"], false,"Source: IMD World Competitiveness Center"))
```
<a href="./images/competitiveness-rankings-live.png" download="competitiveness-rankings.png">⤓ Download image</a>

#### Sources
- Wipo ([2025](https://www.wipo.int/en/web/global-innovation-index)) Global Innovation Index
- European Commission ([2025](https://research-and-innovation.ec.europa.eu/statistics/performance-indicators/european-innovation-scoreboard_en)) European Innovation Scoreboard
- IMD ([2025](https://www.imd.org/centers/wcc/world-competitiveness-center/rankings/world-competitiveness-ranking/)) World Competitiveness Ranking&nbsp;&nbsp;&nbsp;<mark>New</mark>
- IMD ([2024](https://www.imd.org/centers/wcc/world-competitiveness-center/rankings/world-digital-competitiveness-ranking/)) World Digital Competitiveness Ranking&nbsp;&nbsp;&nbsp;<mark>New</mark>

#### Other indices
- Economist ([2024](https://web.archive.org/web/20240922204922/https://impact.economist.com/new-globalisation/innovation-quotient)) The Innovation Quotient. The index has been discontinued and is no longer included. 
- GEM ([2025](https://gemconsortium.org/reports/latest-global-report)) Global Entrepreneurship Monitor&nbsp;&nbsp;&nbsp;<mark>New</mark>
- The EU made a [study](https://op.europa.eu/en/publication-detail/-/publication/70fe2318-fb72-11ed-a05c-01aa75ed71a1/language-en) on the development of an European startup scoreboard (comparable to the EIS). The scoreboard is [in development](https://4front.fi/proving-valuable-insights-on-europes-startup-and-scaleup-landscape/).

```js
// ### Customize selection of countries for comparison
// We have preselected the top 10 countries in the Global Innovation Index plus Israel and compare all indicators against this set of countries (where data is available). You can adjust the selection below, the charts will update automatically.

// Evtl. muss hier wieder die Abhängigkeit von der Israel-Checkbox eingefügt werden.
// const countries_list = new Map(
//   df_rank
//     .filter((d) => d.index === "GII" && d.year === 2024)
//     .sort((a, b) => a.rank - b.rank)
//     .map((d) => [d.country, d.iso3])
// );

// const countries = view(
//   Inputs.select(countries_list, {
//     value: [
//       "CHE",
//       "SWE",
//       "USA",
//       "SGP",
//       "GBR",
//       "KOR",
//       "FIN",
//       "NLD",
//       "DEU",
//       "DNK",
//       "ISR",
//     ],
//     multiple: 3,
//     auto_expand_horizontally: true,
//     selected_items_on_top: true,
//     label:
//       "Selected countries (add or deselect countries with Ctrl + Left-click)",
//   })
// );
```