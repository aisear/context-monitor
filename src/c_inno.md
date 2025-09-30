---
title: Innovation Activities
style: styles.css
---

```js
import * as aq from "npm:arquero";
import { line_cis, line_oecd, line_oecd_mfp, line_rank  } from "./components/plots/line_plots.js"
import { lin_reg } from "./components/plots/lin_reg.js"
import { color_scale, colorLegend, countries } from "./components/utils/colors.js"

const eurostat_pct_rd = await FileAttachment("data/eurostat_pct_rd.txt").tsv({
  typed: true,
});
const domain_x = undefined
const eurostat_pct_rd_filtered = eurostat_pct_rd.filter(d => countries.includes(d.iso3)) //&& domain_x.includes(d.years)
const ie = await FileAttachment("./data/innovationserhebung.csv").csv({ typed: true });
const df_oecd_mfp = await FileAttachment("./data/df_oecd_mfp.csv").csv({ typed: true });
const df_oecd_mfp_plot = df_oecd_mfp
    .filter((d) => countries.includes(d.iso3))
    .sort((a, b) => a.year_date - b.year_date)
      .map(d => ({
      ...d,
      var_axis: "Multi-factor productivity (Index = 2015, Current prices)",
      zIndex: d.iso3 === "CHE" ? 1 : 0
      }))
      .sort((a, b) => a.zIndex - b.zIndex);
    ; // only for selected countries
```

# Innovation Activities
<mark>New:</mark>&nbsp;&nbsp;&nbsp;The KOF Swiss Economic Institute of the ETH Zürich publishes every two years the results of its innovation survey. The report and survey are mainly financed by the SEFRI. The results are also included in the Community Innovation Survey of the European Union and allow for limited international comparison . Since 2019 Innosuisse finances an extension of the company panel with applicants of Innosuisse grants with applications since 2016.

## The Swiss innovation landscape: Robust, but facing challenges
### The downward trend in business R&D and innovation activity has bottomed out
The survey has for almost two decades observed a decline in the share of companies stating that they conduct R&D (2000–02: 59% → 2020–22: 13%) and the share of companies stating that they have introduced product or process innovations (60% → 36%). This decline has reached its lowest point in 2016–18 and 2014–16 respectively. The results of 2018–20 looked like a reversal of the trend, but the most recent results did not confirm the upward trend, consequently we observe a stabilisation.
<div style="display: grid; grid-template-columns: 1fr 1fr; max-width: 640px">
  ${lin_reg(ie, "F&E im Inland ja/nein", true, false, [0, 100])}
  ${lin_reg(ie, "Produkt-/Prozessinnovationen ja/nein", true, false, [0, 100])}
</div>

### R&D and innovation are partially becoming decoupled
At the same time, the share of R&D expenditure in turnover has grown (2000–02: 0.9% → 2020–22: 2.4%) and the share of turnover from innovative products and services has declined only slightly (2010–12: 35% → 2020–22: 31%). This means: Fewer companies invest more in R&D, which is true in general, but also among SME. The R&D intensity of the still R&D active companies has increased. And while fewer companies are active in innovation over all, a growing share of companies are innovation-, but not R&D-active, indicating a change in innovation strategies and partially explaining why the share of turnover from innovative products and services has only slightly decreased. 

<div style="display: grid; grid-template-columns: 1fr 1fr; max-width: 640px">
  ${lin_reg(ie, "Umsatzanteil F&E-Ausgaben", true, false, [0,50])}
  ${lin_reg(ie, "Umsatzanteil innovative Produkte", true, false, [0, 50])}
</div>

### Software developers / suppliers have become a source for innovation
Suppliers and clients are still key players in companies' innovation processes, but software developers have become the second most important source of knowledge for innovation, with a strong increase in importance. The dependence on international software developers might pose a risk as well for future innovation performance.
<div>${line_rank(ie, "Bedeutung externer Wissensquellen", true, true)}</div>

### Securing funding is no longer the only major obstacle
The high cost of innovation is still the major obstacle to innovation, but has lost relevance compared to skills shortages and building regulations/spatial planning.
<div>${line_rank(ie,"Innovationshemmnisse", true, true)}</div>

### More companies receive innovation support, mainly driven by subnational agencies
The share of surveyed Swiss companies that have received support from Innosuisse has remained steady around 5% in the observations periods from 2012 to 2022. Meanwhile the share of companies that have received any innovation support has risen from 7% in 2010–2012 to around 12% in 2020–2022, mainly driven by the rise in regional and cantonal support since 2014–16. The offers from these agencies have generally a lower threshold and are more coaching-oriented than the support offers of Innosuisse.
<div>${line_rank(ie,"Innovationsförderung Stellen", true, true)}</div>

## The international innovation landscape: Divergence in R&D, convergence in product innovations
### Share of firms with R&D activities
${colorLegend("CHE")} lost its top position in share of firms with R&D activities over the last 20 years. In 2018–2020, the number of firms with R&D activities has started to slightly increase again for the first time since 2000–2002. At the same time, the average share of R&D expenditure has remained constant compared to the previous period, meaning that the concentration of R&D expenditure in the economy as a whole has decreased since 2018–2020. ${colorLegend("NLD")} and ${colorLegend("FIN")} have a significantly higher share of firms with R&D and have been trending upwards. 

```js
display(line_cis(eurostat_pct_rd_filtered, "pct_rd", domain_x, color_scale))
```

### Share of firms with product innovations
${colorLegend("CHE")}'s share of firms with product innovations had, after a long decline, increased significantly as well in 2018–2020. However, the latest observation period seems to confirm the general downward trend. Among European innovation leaders, the range in the share of companies with product innovations narrowed from 25%–55% to 27%–38% in twenty years.
```js
display(line_cis(eurostat_pct_rd_filtered, "pct_inno", domain_x, color_scale))

// <div class="note" label="Note"><details>
//  <summary>Different results by company size and sector</summary>
// <p>Both the proportion of R&D-active companies and the proportion of companies with product innovations have stabilised or increased compared to the last survey. When analysed by company size and sector, the indicators show more distinct patterns:

// - It is interesting to note that the proportion of R&D-active companies has increased particularly among small companies (< 50 FTEs), while the proportion among larger companies is either stable (50-100 FTEs and > 250 FTEs) or even declining (100-250 FTEs) (<a href="https://doi.org/10.3929/ethz-b-000583885">Spescha & Wörther, 2022</a>, p. 30).
// - If we look at the figures by sector, we see that the proportion of R&D-active companies in the high-tech sector has continued to fall (at a high level) and that, on the other hand, activity in the low-tech industry, modern and traditional services sectors has increased (<a href="https://doi.org/10.3929/ethz-b-000583885">Spescha & Wörther, 2022</a>, p. 20).

// New survey results will be published in December 2024.
// </p>
// </details>

// </div>
```

### Sales of new-to-market and new-to-enterprise innovations as a percentage of turnover
The recent up- and than downward trend in innovative activity in ${colorLegend("CHE")} is also mirrored in the sales of new innovations in percent of total turnover.

```js
display(line_cis(eurostat_pct_rd_filtered, "pct_sales_inno", domain_x, color_scale))


// ## Obstacles to innovation
// The most cited obstacles to innovation are mostly concerning its economic viability: The cost of innovation projects, lack of equity and debt capital and long amortisation periods. The shortage of skilled labour and R&D-personnel comes in 4th and 5th.
```
### Productivity is increasing
Survey results show that process innovations are leading to significant reductions in production costs, particularly among SMEs. This is reflected in the development of multi-factor productivity (MFP), which points to positive productivity effects from innovation activities. MFP is a measure of economic efficiency that captures the portion of output growth that cannot be explained by increases in labour and capital inputs alone. It reflects how effectively an economy or firm combines its resources to produce goods and services, essentially measuring the "residual" productivity gains that stem from technological progress, improved processes, organizational changes, and other innovations.
<div>${line_oecd(df_oecd_mfp_plot, "Multi-factor productivity (Index = 2015, Current prices)",false,"OECD Productivity database","https://sdmx.oecd.org/public/rest/data/OECD.SDD.TPS,DSD_PDB@DF_PDB_GR,1.0/.A.MFPH..IX.V...?startPeriod=1998&format=csvfilewithlabels", 1, false, false)}</div>
<a href="./images/multifactor-productivity-live.png" download="multifactor-productivity.png">⤓ Download image</a>

#### Sources
- KOF ([2025](https://innovationserhebung.ch/innovationsbericht_2023/)) Innovation report 2023
- Innosuisse has taken part in this survey since 2019 in order to learn more about the innovation behaviour and innovation environment of the companies that apply for funding ([Innosuisse innovation support: the perspective of firms, 2025](https://www.innosuisse.admin.ch/en/innovation-survey-2023)). The aim is to be able to draw selected comparisons with innovative companies that have not submitted a funding application to Innosuisse.
- Gersbach H. & Wörter M. ([2024](https://doi.org/10.3929/ethz-b-000657551)) Challenges for the Swiss Innovation System
- SBFI ([2022](https://www.sbfi.admin.ch/sbfi/de/home/forschung-und-innovation/forschung-und-innovation-in-der-schweiz/f-und-i-bericht.html)) Forschung und Innovation in der Schweiz – Zwischenbericht 2022, p.90ff