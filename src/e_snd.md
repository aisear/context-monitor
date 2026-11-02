---
title: Sustainability and High-tech Exports
style: styles.css
---

```js
import { line_oecd } from "./components/plots/line_plots.js";
import {
  color_range,
  color_scale,
  colorLegend,
  countries,
} from "./components/utils/colors.js";
import { filter_oecd_data } from "./components/utils/filterOecdData.js";

// OECD ENV Daten
const df_ht = await FileAttachment("data/df_ht.csv").csv({ typed: true });
// EU European Innovation Scoreboard Daten laden
const df_eis = await FileAttachment("data/eis_raw_data_2025.csv").csv({
  typed: true,
});
const df_eis_2017 = df_eis.filter((d) => d.year_date >= new Date("2017-01-01"));
const df_oecd_gg = await FileAttachment("./data/df_oecd_gg.csv").csv({
  typed: true,
});
const df_co2_prod = filter_oecd_data(
  df_oecd_gg,
  "USD_CO2",
  "CO2_PBPROD",
  countries
);
const df_r_prod = filter_oecd_data(df_oecd_gg, "USD_KG", "DMC_PROD", countries); // const df_r2_prod= df_eis.filter(
//   (d) =>
//     countries.includes(d.iso3) &
//     (d.var === "4.3.1")
// ).map(d => ({
//       ...d,
//       zIndex: d.iso3 === "CHE" ? 1 : 0
//       }))
//       .sort((a, b) => a.zIndex - b.zIndex)
const df_htex = df_ht
  .filter(
    (d) => countries.includes(d.iso3) & (d.year_date > new Date("2016-01-01"))
  )
  .map((d) => ({
    ...d,
    zIndex: d.iso3 === "CHE" ? 1 : 0,
  }))
  .sort((a, b) => a.zIndex - b.zIndex);
const df_mht = df_eis_2017
  .filter((d) => countries.includes(d.iso3) & (d.var === "4.2.1"))
  .map((d) => ({
    ...d,
    zIndex: d.iso3 === "CHE" ? 1 : 0,
  }))
  .sort((a, b) => a.zIndex - b.zIndex);
const df_mht_unido = await FileAttachment("./data/df_unido_SDG_data.csv").csv({
  typed: true,
});

const df_serv = df_eis_2017
  .filter((d) => countries.includes(d.iso3) & (d.var === "4.2.2"))
  .map((d) => ({
    ...d,
    zIndex: d.iso3 === "CHE" ? 1 : 0,
  }))
  .sort((a, b) => a.zIndex - b.zIndex);
```

# Sustainability

## Resource and production-based CO&sup2; productivity

${colorLegend("CHE")}'s economy performs well on resource and production-based CO&sup2; productivity. It is becoming more efficient and ranks among the leaders of its innovation peers.

Resource productivity measures the total materials an economy uses directly (domestic material consumption, DMC) relative to its GDP (GDP per DMC in euros per kilogram). It shows how efficiently resources are used in production and whether economic growth is decoupling from natural-resource use. The OECD version used here excludes energy materials, unlike the EIS indicator. ${colorLegend("CHE")} performs even better when energy is included.

```js
// display(line_oecd(df_r_prod,"",false,"Eurostat","https://research-and-innovation.ec.europa.eu/statistics/performance-indicators/european-innovation-scoreboard_en", 1, false, true))
display(
  line_oecd(
    df_r_prod,
    "",
    false,
    "OECD Green Growth",
    "https://data-explorer.oecd.org/vis?df[ds]=DisseminateFinalDMZ&df[id]=DSD_GG%40DF_GREEN_GROWTH&df[ag]=OECD.ENV.EPI&dq=....&pd=%2C&to[TIME_PERIOD]=false",
    1,
    false,
    true
  )
);
```

<a href="./images/resource-productivity-live.png" download="resource-productivity.png">⤓ Download image</a>

Production-based CO&sup2; productivity tries to measure how efficiently an economy is generating value while limiting CO&sup2; emissions. ${colorLegend("CHE")}'s strong performance likely reflects its specialization in high-value goods and services, combined with its comparatively low-carbon energy mix.

```js
display(
  line_oecd(
    df_co2_prod,
    "",
    false,
    "OECD Green Growth",
    "https://data-explorer.oecd.org/vis?df[ds]=DisseminateFinalDMZ&df[id]=DSD_GG%40DF_GREEN_GROWTH&df[ag]=OECD.ENV.EPI&dq=....&pd=%2C&to[TIME_PERIOD]=false",
    1,
    false,
    true
  )
);
```

<a href="./images/co2-productivity-live.png" download="co2-productivity.png">⤓ Download image</a>

# High-value Exports

## Exports of high technology products as a share of total products exports

${colorLegend("CHE")} has very high share of high-tech exports. The pharmaceuticals industry is likely the most important factor for Switzerland's top position, next to the other sub-sectors included in the definition (computer, electronic and optical products as well as air, spacecraft and related machinery).

```js
display(
  line_oecd(
    df_htex,
    "Exports of high technology products as a share of total products exports",
    false,
    "European Commission",
    "https://data.europa.eu/data/datasets/vfajyjoirq3icsstf1zw?locale=en",
    0,
    true,
    true
  )
);
```

<a href="./images/hightech-exports-live.png" download="hightech-exports.png">⤓ Download image</a>

## Exports of medium and high technology products as a share of total products exports

${colorLegend("CHE")} performs markedly worse than competitors like ${colorLegend("KOR")} or ${colorLegend("SWE")} when the scope is widened to medium and high-tech exports. This is compounded by a steady decline in its relative performance since 2019. Medium-tech exports typically include chemical products, machinery, and medical and dental instruments.

This disparity may be due to confounding factors. The current metric compares tech products against total product exports; a high volume of non-tech exports could distort Switzerland’s relative value. We were not able to definitly conclude, whether high-value commodities, such as gold exports, are included in the denominator, which would significantly skew the results.

```js
display(
  line_oecd(
    df_mht,
    "Exports of medium and high technology products as a share of total products exports",
    false,
    "European Commission",
    "https://research-and-innovation.ec.europa.eu/statistics/performance-indicators/european-innovation-scoreboard_en",
    0,
    true,
    true
  )
);
```

<a href="./images/medium-hightech-exports-live.png" download="medium-hightech-exports.png">⤓ Download image</a>

Another indication that the results are indeed skewed is that the share of medium- and high-tech manufacturing value added is comparatively high. ${colorLegend("CHE")} has an 8 percentage point higher proportion of medium- and high-tech manufacturing value added than ${colorLegend("KOR")}, which leads in terms of export share shown above.

```js
display(
  line_oecd(
    df_mht_unido.filter(
      (d) => countries.includes(d.iso3) && d.measure == "NV_IND_TECH"
    ),
    "",
    false,
    "UNIDO",
    "https://stat.unido.org/data/download?dataset=sdg",
    0,
    true,
    true
  )
);
```

<a href="./images/medium-hightech-manufacturing-live.png" download="medium-hightech-manufacturing.png">⤓ Download image</a>

## Knowledge-intensive services exports

Similarly, it is notable that ${colorLegend("CHE")}'s share of knowledge-intensive services (KIS), as a percentage of total service exports, has become comparatively low. The KIS definition includes predictable areas—such as insurance, financial services, intellectual property charges, and IT—but also less obvious ones, including sea, air, and space transport. Remarkably, the United States, despite its domineering tech and software sector, sits at the lower end of this same spectrum.

```js
display(
  line_oecd(
    df_serv,
    "Knowledge-intensive services exports as a percentage of total services exports",
    false,
    "European Commission",
    "https://research-and-innovation.ec.europa.eu/statistics/performance-indicators/european-innovation-scoreboard_en",
    0,
    true,
    true
  )
);
```

<a href="./images/knowledge-intensive-services-live.png" download="knowledge-intensive-services.png">⤓ Download image</a>

```js
// Funktion, um die Jahresskala neu zu definieren. Die den rawdata angegebenen Daten des EIS beziehen sich auf das Jahr des SII nicht auf das letzte Jahr der Erhebung.
function subtractYears(date, years) {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() - years);
  return newDate;
}
```

#### Sources

- OECD ([2025](https://data-explorer.oecd.org/vis?df[ds]=DisseminateFinalDMZ&df[id]=DSD_GG%40DF_GREEN_GROWTH&df[ag]=OECD.ENV.EPI&dq=....&pd=%2C&to[TIME_PERIOD]=false)) Green Growth Database
- European Commission ([2024](https://research-and-innovation.ec.europa.eu/statistics/performance-indicators/european-innovation-scoreboard_en)) European Innovation Scoreboard
