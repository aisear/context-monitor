---
title: Innovation Ecosystem Monitor 2024
style: styles.css
header: <a href="https://www.innosuisse.admin.ch/en" class="logo" id="header-logo-container" aria-label="Open Homepage"><img src="/images/swiss-logo.svg" class="logo_flag" tabindex="0" alt="Logo with Swiss flag""></a><a href="https://www.innosuisse.admin.ch/en" class="no-underline">Innosuisse<br>Swiss Innovation Agency</a>
---

```js
import { plot_eis, plot_rank_bump } from "./components/plots/rank.js";
import { arrow_eis } from "./components/plots/arrow_y.js";
import {
  color_scale,
  colorLegend,
  countries,
} from "./components/utils/colors.js";
import * as aq from "npm:arquero";

const df_rank = await FileAttachment("data/rankings_2026.csv").csv({
  typed: true,
});
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
      (d.year_date > new Date("2022-12-31") || d.year_date === "NA"),
  );
const df_eis = await FileAttachment("data/eis_raw_data_2026.csv").csv({
  typed: true,
});
const df_eis_filtered = df_eis.filter(
  (d) => countries.includes(d.iso3) && d.var === "SII",
);
const df_gii = await FileAttachment("data/gii_2021_2025_score.csv").csv({
  typed: true,
});
const df_gii_filtered = df_gii.filter((d) => countries.includes(d.iso3));
```

<div style="background: transparent linear-gradient(284deg, #AFBDFA 0%, #FE8776 100%) no-repeat padding-box; height: 60px; width: 650px; padding-left: 48px; padding-top: 1px; padding-bottom: 60px;  margin-left: -48px; margin-top: -31px;">

# Innovation Ecosystem Monitor

<small><small style="display: block; text-align: right;">Last changes: 10. November 2025</small></small>

</div>

## Mapping Switzerland's Innovation Strengths, Weaknesses and Their Evolution Over Time

### What is the monitors purpose?

The goal of this monitor is to provide an overview of the competitiveness of Switzerland's innovation ecosystem in an international context and go into more detail where it is relevant to Innosuisse. The monitor aims to provide a better understanding of the strengths and weaknesses of the Swiss innovation ecosystem and its development over time. Wherever possible the monitor links to reports that describe the findings in more detail. The report is updated at least once a year after the publication of most indices in autumn.

### From the abstract to the concrete

Switzerland regularly appears on top of international innovation rankings. These indices are constructed out of a multitude of indicators, they present different perspectives on the innovation ecosystem and their selection influences the final ranking.

In the following, the report will first take a bird's eye view and look at different innovation indices (see below ↓) and then will dive into detail and shed light on selected input and output indicators (menu on the left hand side ←). The starting point for the in-depth analyses are selected indicators from the European Innovation Scoreboard (EIS).

## Switzerland maintains its position on top

${colorLegend("CHE")} remains at the top of the two most prominent innovation rankings. The leading countries in both the Global Innovation Index (GII) and the European Innovation Scoreboard (EIS) have changed little. Only ${colorLegend("SWE")}, ${colorLegend("KOR")} and ${colorLegend("CHN")} have made significant gains. ${colorLegend("CHN")} has entered the GII's top ten for the first time and sits just outside it in the EIS.

```js
display(
  plot_rank_bump(
    df_ranking,
    ["EIS", "GII"],
    true,
    html`Sources: WIPO (2024), European Commission (2025)`,
  ),
);
// display(plot_rank(df_ranking, domain_rank_gii, ["EIS", "GII", "EIQ"],"Sources: WIPO (2024), European Commission (2024) & Economist Impact (2023)", true))
```

<a href="./images/innovation-rankings-live.png" download="innovation-rankings.png">⤓ Download image</a>

<div class="note" label="FAQ">
  <details>
  <summary>Why are the Swiss S&T clusters not top-ranked?</summary>
  <p>Here, only Zurich region (rank 40, +10 compared to 2024) ranks among the <a href="https://www.wipo.int/en/web/global-innovation-index/2025/innovation-clusters">top 100 Science & Technology-Clusters</a>, behind among others London (8), Paris (12), Munich (27) and Berlin (30). Basel region has dropped out of the top 100 (compared to its rank 96 in 2024). 
  
  The reason why Switzerland appears nonetheless at the top of the rankings as a country is twofold: 
  1. The S&T-Clusters are – unlike the countries – not compared relative to their size, but in absolute terms. Consequently, bigger clusters have an advantage.
  2. The concentration of S&T-Clusters in Switzerland is dense in relation to the rest of the country (and in contrast to other countries).</p></details></div>
<p></p>

## However, followers may be catching up

### Comparison of the score evolution for GII and EIS 2021–2025

${colorLegend("CHE")} has slipped slightly in the latest European Innovation Scoreboard (EIS). ${colorLegend("SWE")}, ${colorLegend("KOR")} and ${colorLegend("DNK")} have gained ground and narrowed the gap. This is partly due to changes in the index's methodology. The EIS now includes, for example, measures of supply-chain vulnerability, which penalises Switzerland: its complex products depend on high-tech imports from outside the EU.

```js
display(arrow_eis(df_eis_filtered, "2021", "2025", false));
```

<a href="./images/eis-progress-arrow-live.png" download="eis-progress-arrow.png">⤓ Download image</a>

The Global Innovation Index, which uses a broader set of indicators, shows no such convergence and no decline in Swiss innovative power.

```js
display(arrow_eis(df_gii_filtered, "2021", "2025", true));
```

<a href="./images/gii-progress-arrow-live.png" download="gii-progress-arrow.png">⤓ Download image</a>

### Switzerland's strengths and weaknesses

Both indices highlight similar strengths: exceptional scientific output and exceptionally close links between industry and academia, evident in public-private co-publications and university-industry R&D collaboration.

The weaknesses are more varied, from limited government support to low foreign direct investment and trade impacts. One very notable difference: high-tech imports. The EIS treats them as a vulnerability, signalling dependence on critical supplies. The GII sees them positively, as a sign of economic complexity and ability to absorb foreign knowledge. Both views have their raison d'être. Which matters more depends on how open the global economy remains.

|                | European Innovation Scoreboard (2025)                                                                                                                    | Global Innovation Index (2025)                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Strengths**  | [Public-private co-publications](d_ktt#public-private-co-publications)<br>_Innovation linkages_                                                          | University–industry R&D collaboration<br>_Innovation linkages_                 |
|                | International scientific co-publications<br>_Attractive research systems_                                                                                | Patents by origin/bn PPP$ GDP<br>_Knowledge creation_                          |
|                | Foreign doctorate students as a share of all doct. stud.<br>_Attractive research systems_                                                                | Production and export complexity<br>_Knowledge diffusion_                      |
| **Weaknesses** | [Direct & indirect government support of business R&D](a_rnd#business-expenditure-on-r-and-d-berd-financed-by-government)<br>_Finance and support_       | FDI net inflows, % GDP<br>_Knowledge absorption_                               |
|                | High-tech imports from outside the EU<br>_Trade impacts_                                                                                                 | ICT use<br>_ICT_                                                               |
|                | [Exports of medium and high-tech products](e_snd#exports-of-medium-and-high-technology-products-as-a-share-of-total-products-exports)<br>_Trade impacts_ | Domestic industry diversification<br>_Trade, diversification and market scale_ |

<details>
<summary><small>Additional info: Strong increases an decreases</small></summary>

|                           | European Innovation Scoreboard (2018–25)                                                                                                                                             | Global Innovation Index (2021–25)                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| **↗ Strong<br>increases** | [Venture capital expenditures](b_ens#venture-capital-investments-in-of-gdp-2017-2024)<br>_Finance and support_                                                                       | Applied tariff rate, weighted avg., %<br>_Trade, diversification and market scale_ |
|                           | [Sales of new-to-market and new-to-firm innovations](c_inno#sales-of-new-to-market-and-new-to-enterprise-innovations-as-a-percentage-of-turnover) <br>_Sales and employment impacts_ | High-tech imports, % total trade<br>_Knowledge absorption_                         |
|                           | Population involved in lifelong learning<br>_Human resources_                                                                                                                        | Industrial designs by origin/bn $ GDP<br>_Intangible assets_                       |
| **↘ Strong<br>decreases** | SMEs introducing business process innovations<br>_Innovators_                                                                                                                        | FDI net inflows, % GDP<br>_Knowledge absorption_                                   |
|                           | Design applications<br>_Intellectual assets_                                                                                                                                         | ICT services imports, % total trade<br>_Knowledge absorption_                      |
|                           | Employment in innovative enterprises<br>_Sales and employment impacts_                                                                                                               | Labor productivity growth, %<br>_Knowledge impact_                                 |

</details>

## Switzerland is one of the most competitive countries

${colorLegend("CHE")} also ranks highly in broader measures of competitiveness. It has climbed on top of IMD's rankings for both overall and digital competitiveness.

```js
display(
  plot_rank_bump(
    df_ranking,
    ["WCR", "WDCR"],
    false,
    "Source: IMD World Competitiveness Center",
  ),
);
```

<a href="./images/competitiveness-rankings-live.png" download="competitiveness-rankings.png">⤓ Download image</a>

#### Sources

- Wipo ([2025](https://www.wipo.int/en/web/global-innovation-index)) Global Innovation Index
- European Commission ([2025](https://research-and-innovation.ec.europa.eu/statistics/performance-indicators/european-innovation-scoreboard_en)) European Innovation Scoreboard
- IMD ([2025](https://www.imd.org/centers/wcc/world-competitiveness-center/rankings/world-competitiveness-ranking/)) World Competitiveness Ranking
- IMD ([2025](https://www.imd.org/centers/wcc/world-competitiveness-center/rankings/world-digital-competitiveness-ranking/)) World Digital Competitiveness Ranking

#### Other indices

- Economist ([2024](https://web.archive.org/web/20240922204922/https://impact.economist.com/new-globalisation/innovation-quotient)) The Innovation Quotient has been discontinued and is no longer included.
- GEM ([2025](https://gemconsortium.org/reports/latest-global-report)) Global Entrepreneurship Monitor
- The EU made a [study](https://op.europa.eu/en/publication-detail/-/publication/70fe2318-fb72-11ed-a05c-01aa75ed71a1/language-en) on the development of an European startup scoreboard. The scoreboard is [in development](https://4front.fi/proving-valuable-insights-on-europes-startup-and-scaleup-landscape/).

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
