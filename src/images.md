---
title: Innovation Ecosystem Monitor 2024
style: styles.css
---

```js
// Component imports
import { plot_eis, plot_rank_bump } from "./components/plots/rank.js";
import { arrow_eis } from "./components/plots/arrow_y.js";
import {
  line_cis,
  line_oecd,
  line_oecd_gbard,
} from "./components/plots/line_plots.js";
import {
  bar_stacked_y,
  bar_stacked_y_normalized,
  area_stacked_y_gerd_ch,
} from "./components/plots/bar_stacked_y.js";
import { bar_stacked_x } from "./components/plots/bar_stacked_x.js";
import { rnd_ch_sankey } from "./components/plots/sankey.js";
import { bar_x, bar_x_unicorn } from "./components/plots/bar_x.js";
import { arrow_unicorns } from "./components/plots/arrow_y.js";
import { country_iso3, iso3_country } from "./components/utils/countries.js";
import {
  color_scale,
  colorLegend,
  countries,
} from "./components/utils/colors.js";
import { filter_oecd_data } from "./components/utils/filterOecdData.js";
import { subtractYears } from "./components/utils/subtractYears.js";
import * as aq from "npm:arquero";

// Data loading for all charts
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
      (d.year_date > new Date("2021-12-31") || d.year_date === "NA")
    //&& ["2022", "2023", "2024", "Change"].includes(d.year)
  );
const df_eis_raw = await FileAttachment("data/eis_raw_data_2026.csv").csv({
  typed: true,
});

const df_eis = df_eis_raw.filter((d) => d.year_date >= new Date("2017-01-01"));

const df_eis_filtered = df_eis.filter(
  (d) => countries.includes(d.iso3) && d.var === "SII"
);

const df_gii = await FileAttachment("data/gii_2021_2025_score.csv").csv({
  typed: true,
});
const df_gii_filtered = df_gii.filter((d) => countries.includes(d.iso3));

// Research & Development data
const df_gtard = await FileAttachment("./data/df_gtard.csv").csv({
  typed: true,
});
const df_oecd_msti = await FileAttachment("./data/df_oecd_msti.csv").csv({
  typed: true,
});
const df_rnd_ch = await FileAttachment("./data/rnd_ch_2023.csv").csv({
  typed: true,
});
const df_rnd_type = await FileAttachment("./data/df_rnd_type.csv").csv({
  typed: true,
});

// Manipulate data
const df_gerd = filter_oecd_data(
  df_oecd_msti,
  "PT_B1GQ",
  "G",
  countries
).filter((d) => d.iso3 !== "GBR");
const df_gerd_gov = filter_oecd_data(
  df_oecd_msti,
  "PT_B1GQ",
  "G_FG",
  countries
);
const df_berd_gov = filter_oecd_data(
  df_oecd_msti,
  "PT_BERD",
  "B_FG",
  countries
);
const df_rnd_personnel = filter_oecd_data(
  df_oecd_msti,
  "10P3EMP",
  "T_TT",
  countries
);
const df_gbard_tax = df_gtard
  .filter((d) => countries.includes(d.iso3))
  .sort((a, b) => a.year - b.year); // only for selected countries
const df_gerd_type = aq
  .from(
    df_oecd_msti.filter(
      (d) =>
        ["B", "GV", "H"].includes(d.measure) &&
        d.unit === "PT_B1GQ" &&
        countries.includes(d.iso3) &&
        [2023].includes(d.year)
    )
  )
  .groupby("country")
  .derive({
    country_total: (d) => aq.op.sum(d.obs_value),
  })
  .ungroup()
  .derive({
    share: (d) => (d.obs_value / d.country_total) * 100,
  })
  .select(aq.not("country_total"))
  .orderby("measure_name", aq.desc("share"));
const df_gerd_type1 = df_gerd_type.objects();
const domain1 = df_gerd_type
  .filter((d) => d.measure === "B")
  .orderby("measure_name", "share")
  .array("country");
const order1 = df_gerd_type
  .groupby("measure_name")
  .count()
  .orderby(aq.desc("measure_name"))
  .array("measure_name");
const df_gerd_type3 = aq
  .from(
    df_oecd_msti.filter(
      (d) =>
        ["G_FA", "G_FON", "G_FG", "G_FB"].includes(d.measure) &&
        d.unit === "PT_B1GQ" &&
        ((countries.includes(d.iso3) && [2023].includes(d.year)) ||
          (["ISR"].includes(d.iso3) && [2021].includes(d.year)))
    )
  )
  .groupby("country")
  .derive({
    country_total: (d) => aq.op.sum(d.obs_value),
    measure_name: (d) =>
      d.measure === "G_FA"
        ? "Rest of the world"
        : d.measure === "G_FB"
        ? "Business sector"
        : d.measure === "G_FG"
        ? "Government"
        : "Higher Education and PNP sectors",
  })
  .ungroup()
  .derive({
    share: (d) => (d.obs_value / d.country_total) * 100,
  })
  .select(aq.not("country_total"))
  .orderby("measure_name", aq.desc("share"));
const df_gerd_type2 = df_gerd_type3.objects();
const domain2 = df_gerd_type3
  .filter((d) => d.measure === "G_FB")
  .orderby("measure_name", "share")
  .array("country");
const order2 = df_gerd_type3
  .groupby("measure_name")
  .count()
  .orderby(aq.desc("measure_name"))
  .array("measure_name");
const rnd_type = df_rnd_type.filter((d) => countries.includes(d.iso3));
const rnd_type2023 = rnd_type.map((d) => ({
  ...d,
  share:
    d.iso3 === "CHE" && d.type === "Applied research"
      ? 37.9
      : d.iso3 === "CHE" && d.type === "Basic research"
      ? 27.2
      : d.iso3 === "CHE" && d.type === "Experimental development"
      ? 34.9
      : d.share,
}));
const df_ch_gerd = df_oecd_msti.filter(
  (d) =>
    ["B", "GV", "H"].includes(d.measure) &&
    d.unit === "PT_B1GQ" &&
    ["CHE"].includes(d.iso3) &&
    [2023, 2021, 2019].includes(d.year)
);

// Entrepreneurship and Start-ups data
const df_oecd_vc = await FileAttachment("./data/df_oecd_vc.csv").csv({
  typed: true,
});
const df_gem_tea = await FileAttachment("./data/df_gem_tea_2018_2024.csv").csv({
  typed: true,
});
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
const df_epo = await FileAttachment("./data/df_epo.csv").csv({ typed: true });
const df_unicorns_country = await FileAttachment(
  "./data/df_unicorns_country.csv"
).csv({ typed: true });
const df_unicorns_ch = await FileAttachment("./data/df_unicorns_ch.csv").csv({
  typed: true,
});
const countries_filtered =
  //isr ? countries.filter(d => !["DEU", "FIN", "NLD", "SWE"].includes(d)) :
  countries.filter((d) => !["ISR", "USA"].includes(d));
const df_vc = df_oecd_vc
  .filter(
    (d) =>
      d.measure === "VC_INV_MKT" && // R&D Personnel
      d.bds === "_T" &&
      d.unit === "PT_B1GQ" && // per 1'000 employment
      countries_filtered.includes(d.iso3)
  )
  .sort((a, b) => a.year - b.year);
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

// Innovation Activities data
const df_oecd_mfp = await FileAttachment("./data/df_oecd_mfp.csv").csv({
  typed: true,
});
const df_oecd_mfp_plot = df_oecd_mfp
  .filter((d) => countries.includes(d.iso3))
  .sort((a, b) => a.year_date - b.year_date)
  .map((d) => ({
    ...d,
    zIndex: d.iso3 === "CHE" ? 1 : 0,
  }))
  .sort((a, b) => a.zIndex - b.zIndex); // only for selected countries
// OECD MSTI Daten laden
const df_switt = await FileAttachment("data/switt_startup_2024.csv").csv({
  typed: true,
});
const df_patents = df_eis
  .filter((d) => countries.includes(d.iso3) & (d.var === "3.3.1"))
  .map((d) => ({
    ...d,
    zIndex: d.iso3 === "CHE" ? 1 : 0,
  }))
  .sort((a, b) => a.zIndex - b.zIndex);

const df_ppcp = df_eis
  .filter((d) => countries.includes(d.iso3) & (d.var === "3.2.2"))
  .map((d) => ({
    ...d,
    zIndex: d.iso3 === "CHE" ? 1 : 0,
  }))
  .sort((a, b) => a.zIndex - b.zIndex);

// Sustainability and High-tech Exports data
const df_ht = await FileAttachment("./data/df_ht.csv").csv({ typed: true });
const df_oecd_gg = await FileAttachment("./data/df_oecd_gg.csv").csv({
  typed: true,
});

const df_htex = df_ht
  .filter(
    (d) => countries.includes(d.iso3) & (d.year_date > new Date("2016-01-01"))
  )
  .map((d) => ({
    ...d,
    zIndex: d.iso3 === "CHE" ? 1 : 0,
  }))
  .sort((a, b) => a.zIndex - b.zIndex);

const df_mht = df_eis
  .filter((d) => countries.includes(d.iso3) & (d.var === "4.2.1"))
  .map((d) => ({
    ...d,
    zIndex: d.iso3 === "CHE" ? 1 : 0,
  }))
  .sort((a, b) => a.zIndex - b.zIndex);
const df_mht_unido = await FileAttachment("./data/df_unido_SDG_data.csv").csv({
  typed: true,
});
const df_co2_prod = filter_oecd_data(
  df_oecd_gg,
  "USD_CO2",
  "CO2_PBPROD",
  countries
);
const df_r_prod = filter_oecd_data(df_oecd_gg, "USD_KG", "DMC_PROD", countries);
const df_serv = df_eis
  .filter((d) => countries.includes(d.iso3) & (d.var === "4.2.2"))
  .map((d) => ({
    ...d,
    zIndex: d.iso3 === "CHE" ? 1 : 0,
  }))
  .sort((a, b) => a.zIndex - b.zIndex);
```

# Index

<figure id="innovation-rankings-figure">
<h2>Comparative Innovation Index Ranking, 2022–25</h2>
${display(plot_rank_bump(df_ranking, ["EIS", "GII"], true, html`Sources: WIPO (2024), European Commission (2025)`))}
</figure>
<figcaption><a href="./images/innovation-rankings-live.png" download="innovation-rankings.png">⤓ Download image</a></p>

<figure id="eis-progress-arrow-figure">
<h2>European Innovation Index Score Development, 2018–2025</h2>
${display(arrow_eis(df_eis_filtered, "2021","2025", false))}
</figure>
<figcaption><a href="./images/eis-progress-arrow-live.png" download="eis-progress-arrow.png">⤓ Download image</a></p>

<figure id="gii-progress-arrow-figure">
<h2>Global Innovation Index Score Development, 2021–2025</h2>
${display(arrow_eis(df_gii_filtered, "2021","2025", true))}
</figure>
<figcaption><a href="./images/gii-progress-arrow-live.png" download="gii-progress-arrow.png">⤓ Download image</a></p>

<figure id="competitiveness-rankings-figure">
<h2>International Competitiveness Rankings, 2022–25</h2>
${display(plot_rank_bump(df_ranking, ["WCR", "WDCR"], false,"Source: IMD World Competitiveness Center"))}
</figure>
<figcaption><a href="./images/competitiveness-rankings-live.png" download="competitiveness-rankings.png">⤓ Download image</a></p>

# A. Research & Development

<figure id="swiss-rnd-sankey-figure">
<h2>Swiss R&D Financial Flows by Sector, 2023</h2>
${display(rnd_ch_sankey(df_rnd_ch))}
<figcaption><span>Source: Federal Statistical Office<br>Note: Private non-profit organizations (PNP) are included for comprehensiveness; however, they represent only a marginal portion of total funding (CHF 0.1 bn) and expenditure (CHF 0.3 bn).</span></figcaption>
</figure>

<div>test
<a href="./images/swiss-rnd-sankey-live.png" download="swiss-rnd-sankey.png">⤓ Download image</a>
</div>

<figure id="gerd-gdp-comparison-figure">
<h2>Gross Domestic Expenditure on R&D (GERD) as Percentage of GDP, 2017–2023</h2>
${display(line_oecd(df_gerd,"GERD in % of GDP",false,"OECD Main Science and Technology Indicators (MSTI)","https://oe.cd/msti", 2, true, true))}
</figure>
<small><a href="./images/gerd-gdp-comparison-live.png" download="gerd-gdp-comparison.png">⤓ Download image</a></small>

<figure id="rnd-expenditure-by-sector-figure">
<h2>R&D Expenditure by Sector as Percentage of GERD, 2023</h2>
${display(bar_stacked_y_normalized(df_gerd_type1, true, domain1, order1))}
</figure>
<a href="./images/rnd-expenditure-by-sector-live.png" download="rnd-expenditure-by-sector.png">⤓ Download image</a>

<figure id="rnd-activities-by-type-figure">
<h2>R&D Activities by Type as Percentage of GERD, 2023</h2>
${display(bar_stacked_x(rnd_type2023))}
</figure>
<small><a href="./images/rnd-activities-by-type-live.png" download="rnd-activities-by-type.png">⤓ Download image</a></small>

<figure id="rnd-funding-sources-figure">
<h2>R&D Funding Sources by Sector as Percentage of GERD, 2023</h2>
${display(bar_stacked_y_normalized(df_gerd_type2, true, domain2, order2))}
</figure>
<small><a href="./images/rnd-funding-sources-live.png" download="rnd-funding-sources.png">⤓ Download image</a></small>

<figure id="government-rnd-funding-figure">
<h2>Government-Financed R&D Expenditure as Percentage of GDP, 2017–2023</h2>
${display(line_oecd(df_gerd_gov, "% of GDP", false, "OECD Main Science and Technology Indicators (MSTI)", "https://oe.cd/msti", 1, true, true))}
</figure>
<figcaption><a href="./images/government-rnd-funding-live.png" download="government-rnd-funding.png">⤓ Download image</a></p>

<figure id="government-business-rnd-figure">
<h2>Government Financing of Business R&D Expenditure (BERD) as Percentage of BERD, 2017–2023</h2>
${display(line_oecd(df_berd_gov, "% of business enterprise expenditure on R&D", false, "OECD Main Science and Technology Indicators (MSTI)", "https://oe.cd/msti", 1, true, true))}
</figure>
<figcaption><a href="./images/government-business-rnd-live.png" download="government-business-rnd.png">⤓ Download image</a></p>

<figure id="rnd-personnel-intensity-figure">
<h2>R&D Personnel Intensity, 2017–2023</h2>
${display(line_oecd(df_rnd_personnel, "R&D personnel per 1'000 employment", false, "OECD Main Science and Technology Indicators (MSTI)", "https://oe.cd/msti", 1, false, true))}
</figure>
<figcaption><a href="./images/rnd-personnel-intensity-live.png" download="rnd-personnel-intensity.png">⤓ Download image</a></p>

# B. Entrepreneurship and Start-ups

<figure id="venture-capital-gdp-figure">
<h2>Venture Capital Investments as Percentage of GDP, 2017–2024</h2>
${display(line_oecd(df_vc,"VC investments in % of GDP",false,"OECD Venture Capital investments","https://data-explorer.oecd.org/vis?lc=en&tm=invest&pg=0&snb=107&vw=tb&df[ds]=dsDisseminateFinalDMZ&df[id]=DSD_VC%40DF_VC_INV&df[ag]=OECD.SDD.TPS&df[vs]=1.0&pd=2007%2C&dq=...PT_B1GQ.A&ly[rw]=BUSINESS_DEVELOPMENT_STAGE&ly[cl]=TIME_PERIOD&ly[rs]=REF_AREA&to[TIME_PERIOD]=false", 2, true, true))}
</figure>
<a href="./images/venture-capital-gdp-live.png" download="venture-capital-gdp.png">⤓ Download image</a>

<figure id="entrepreneurial-activity-tea-figure">
<h2>Total Entrepreneurial Activity Rate (TEA) among 18-64 Population, 2018–2024</h2>
${display(line_oecd(df_tea,"Share of 18-64 population who are either a nascent entrepreneur or owner-manager of a new business in %", true,"Global Entrepreneurship Monitor","https://gemconsortium.org/reports/latest-global-report", 1, false, true))}
</figure>
<a href="./images/entrepreneurial-activity-tea-live.png" download="entrepreneurial-activity-tea.png">⤓ Download image</a>

<figure id="technology-investor-score-country-figure">
<h2>Technology Investor Score: Patent Portfolio Intensity of Investment Firms</h2>
${display(bar_x(df_epo, "country", "EPO", "https://epo.org/mapping-investors"))}
</figure>

<a href="./images/technology-investor-score-country-live.png" download="technology-investor-score-country.png">⤓ Download image</a>

<figure id="swiss-investor-scores-figure">
<h2>Technology Investor Scores of Leading Swiss Investment Firms</h2>
${display(bar_x(df_epo, "investor", "EPO", "https://epo.org/mapping-investors"))}
</figure>
<a href="./images/swiss-investor-scores-live.png" download="swiss-investor-scores.png">⤓ Download image</a>

<figure id="unicorn-density-figure">
<h2>Unicorn Company Density, 2025</h2>
${display(bar_x_unicorn(df_ug, color_scale))}
</figure>
<a href="./images/unicorn-density-live.png" download="unicorn-density.png">⤓ Download image</a>

<figure id="swiss-unicorns-figure">
<h2>Swiss Unicorn Companies: Current and Former Unicorn Enterprises, 2025</h2>
${display(arrow_unicorns(df_unicorns_ch))}
</figure>
<a href="./images/swiss-unicorns-live.png" download="swiss-unicorns.png">⤓ Download image</a>

# C. Innovation Activities

<figure id="multifactor-productivity-figure">
<h2>Multi-Factor Productivity, 1998–2022</h2>
${line_oecd(df_oecd_mfp_plot, "Multi-factor productivity (Index = 2015, Current prices)",false,"OECD Productivity database","https://sdmx.oecd.org/public/rest/data/OECD.SDD.TPS,DSD_PDB@DF_PDB_GR,1.0/.A.MFPH..IX.V...?startPeriod=1998&format=csvfilewithlabels", 1, false, false)}
</figure>
<a href="./images/multifactor-productivity-live.png" download="multifactor-productivity.png">⤓ Download image</a>

# D. Knowledge and Technology Transfer

<figure id="pct-patents-figure">
<h2>International Patent Applications per Billion GDP (PPS), 2015–2020</h2>
${display(line_oecd(df_patents, "PCT patent applications per billion GDP (in PPS)", false, "European Commission / WIPO", "https://ec.europa.eu/research-and-innovation/en/statistics/performance-indicators/european-innovation-scoreboard", 1, false, true))}
</figure>
<a href="./images/pct-patents-live.png" download="pct-patents.png">⤓ Download image</a>

<figure id="public-private-copubs-figure">
<h2>Public-Private Research Collaboration, 2017–2023</h2>
${display(line_oecd(df_ppcp, "Public-private co-publications per million population", false, "European Commission", "https://ec.europa.eu/research-and-innovation/en/statistics/performance-indicators/european-innovation-scoreboard", 1, false, false))}
</figure>
<a href="./images/public-private-copubs-live.png" download="public-private-copubs.png">⤓ Download image</a>

<figure id="swiss-research-startups-figure">
<h2>Start-ups and Spin-offs from Swiss Universities, 2017–2023</h2>
${display(bar_stacked_y(df_switt, "swiTT", "https://switt.ch/switt-reports"))}
</figure>
<a href="./images/swiss-research-startups-live.png" download="swiss-research-startups.png">⤓ Download image</a>

# E. Sustainability and High-tech Exports

<figure id="resource-productivity-figure">
<h2>Resource Productivity</h2>
${display(line_oecd(df_r_prod,"",false,"OECD Green Growth","https://data-explorer.oecd.org/vis?df[ds]=DisseminateFinalDMZ&df[id]=DSD_GG%40DF_GREEN_GROWTH&df[ag]=OECD.ENV.EPI&dq=....&pd=%2C&to[TIME_PERIOD]=false", 1, false, true))}
</figure>
<a href="./images/resource-productivity-live.png" download="resource-productivity.png">⤓ Download image</a>

<figure id="co2-productivity-figure">
<h2>CO2 Productivity</h2>
${display(line_oecd(df_co2_prod,"",false,"OECD Green Growth","https://data-explorer.oecd.org/vis?df[ds]=DisseminateFinalDMZ&df[id]=DSD_GG%40DF_GREEN_GROWTH&df[ag]=OECD.ENV.EPI&dq=....&pd=%2C&to[TIME_PERIOD]=false", 1, false, true))}
</figure>
<a href="./images/co2-productivity-live.png" download="co2-productivity.png">⤓ Download image</a>

<figure id="hightech-exports-figure">
<h2>High-Technology Export Share, 2017–2022</h2>
${display(line_oecd(df_htex,"Exports of high technology products as a share of total products exports",false,"European Commission","https://data.europa.eu/data/datasets/vfajyjoirq3icsstf1zw?locale=en", 0, true, true))}
</figure>
<a href="./images/hightech-exports-live.png" download="hightech-exports.png">⤓ Download image</a>

<figure id="medium-hightech-exports-figure">
<h2>Medium and High-Technology Export Share, 2016–2023</h2>
${display(line_oecd(df_mht, "Exports of medium and high technology products as a share of total products exports", false, "European Commission","https://research-and-innovation.ec.europa.eu/statistics/performance-indicators/european-innovation-scoreboard_en", 0, true, true))}
</figure>
<a href="./images/medium-hightech-exports-live.png" download="medium-hightech-exports.png">⤓ Download image</a>

<figure id="medium-hightech-manufacturing-figure">
<h2>Medium and High-Tech Manufacturing Value Added</h2>
${display(line_oecd(df_mht_unido.filter((d) => countries.includes(d.iso3) && d.measure == "NV_IND_TECH"), "", false, "UNIDO", "https://stat.unido.org/data/download?dataset=sdg", 0, true, true))}
</figure>
<a href="./images/medium-hightech-manufacturing-live.png" download="medium-hightech-manufacturing.png">⤓ Download image</a>

<figure id="knowledge-intensive-services-figure">
<h2>Knowledge-intensive Services Exports</h2>
${display(line_oecd(df_serv, "Knowledge-intensive services exports as a percentage of total services exports", false, "European Commission","https://research-and-innovation.ec.europa.eu/statistics/performance-indicators/european-innovation-scoreboard_en", 0, true, true))}
</figure>
<a href="./images/knowledge-intensive-services-live.png" download="knowledge-intensive-services.png">⤓ Download image</a>
