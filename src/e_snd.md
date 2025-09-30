---
title: Sustainability and High-tech Exports
style: styles.css
---

```js
import { line_oecd } from "./components/plots/line_plots.js"
import { color_range, color_scale, colorLegend, countries } from "./components/utils/colors.js"

// OECD ENV Daten
const df_ht = await FileAttachment("data/df_ht.csv").csv({ typed: true });
// EU European Innovation Scoreboard Daten laden
const df_eis = await FileAttachment("data/eis_raw_data_2025.csv").csv({
  typed: true,
});
const df_r_prod= df_eis.filter(
  (d) =>
    countries.includes(d.iso3) &
    (d.var === "4.3.1")
).map(d => ({
      ...d,
      zIndex: d.iso3 === "CHE" ? 1 : 0
      }))
      .sort((a, b) => a.zIndex - b.zIndex)
const df_co2_prod= df_eis.filter(
  (d) =>
    countries.includes(d.iso3) &
    (d.var === "4.3.2")
).map(d => ({
      ...d,
      zIndex: d.iso3 === "CHE" ? 1 : 0
      }))
      .sort((a, b) => a.zIndex - b.zIndex)
const df_htex = df_ht.filter((d) => countries.includes(d.iso3) & (d.year_date > new Date("2016-01-01")))
.map(d => ({
      ...d,
      zIndex: d.iso3 === "CHE" ? 1 : 0
      }))
      .sort((a, b) => a.zIndex - b.zIndex);
const df_mht = df_eis.filter((d) => countries.includes(d.iso3) & (d.var === "4.2.1"))
  .map(d => ({
      ...d,
      zIndex: d.iso3 === "CHE" ? 1 : 0
      }))
      .sort((a, b) => a.zIndex - b.zIndex);
const df_serv = df_eis.filter((d) => countries.includes(d.iso3) & (d.var === "4.2.2"))
  .map(d => ({
      ...d,
      zIndex: d.iso3 === "CHE" ? 1 : 0
      }))
      .sort((a, b) => a.zIndex - b.zIndex);


```
# Sustainability and High-tech Exports
## Resource productivity

${colorLegend("CHE")} has a comparably low share of green technologies in percent of all patents and the share has been declining. Of the top innovators, ${colorLegend("DNK")} has a clear focus on environment-related technologies and its importance has grown over time.

```js
display(line_oecd(df_r_prod,"",false,"Eurostat","https://research-and-innovation.ec.europa.eu/statistics/performance-indicators/european-innovation-scoreboard_en", 1, false, true))
```
!!! ToDo: <a href="./images/green-technology-patents-live.png" download="green-technology-patents.png">⤓ Download image</a>

## CO2 productivity


```js
display(line_oecd(df_co2_prod,"",false,"Eurostat","https://research-and-innovation.ec.europa.eu/statistics/performance-indicators/european-innovation-scoreboard_en", 1, false, true))
```
!!! ToDo: <a href="./images/green-technology-patents-live.png" download="green-technology-patents.png">⤓ Download image</a>

## Exports of high technology products as a share of total products exports

${colorLegend("CHE")} has very high share of high-tech exports. The pharmaceuticals industry is likely the most important factor for Switzerland's top position, next to the other sub-sectors ("computer, electronic and optical products" and "air and spacecraft and related machinery").

```js
display(line_oecd(df_htex,"Exports of high technology products as a share of total products exports",false,"European Commission","https://data.europa.eu/data/datasets/vfajyjoirq3icsstf1zw?locale=en", 1, false, true))
```
<a href="./images/hightech-exports-live.png" download="hightech-exports.png">⤓ Download image</a>


## Exports of medium and high technology products as a share of total products exports

Interestingly enough, if we widen the scope to medium and high-tech exports, ${colorLegend("CHE")} fares not nearly as well, compared to countries such as ${colorLegend("KOR")} or ${colorLegend("DEU")}. Additionally, there has been a steady decline since 2019.

Medium-tech exports are – among others – chemical products, machinery, medical and dental instruments, etc.

```js
display(line_oecd(df_mht, "Exports of medium and high technology products as a share of total products exports", false, "European Commission","https://research-and-innovation.ec.europa.eu/statistics/performance-indicators/european-innovation-scoreboard_en", 1, false, true))
```

!!! ToDo: <a href="./images/medium-hightech-exports-live.png" download="medium-hightech-exports.png">⤓ Download image</a>

## Knowledge-intensive services exports

```js
display(line_oecd(df_serv, "Knowledge-intensive services exports as a percentage of total services exports", false, "European Commission","https://research-and-innovation.ec.europa.eu/statistics/performance-indicators/european-innovation-scoreboard_en", 1, false, true))
```

!!! ToDo: <a href="./images/medium-hightech-exports-live.png" download="medium-hightech-exports.png">⤓ Download image</a>


```js
// Funktion, um die Jahresskala neu zu definieren. Die den rawdata angegebenen Daten des EIS beziehen sich auf das Jahr des SII nicht auf das letzte Jahr der Erhebung.
function subtractYears(date, years) {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() - years);
  return newDate;
}
```

#### Source
- European Commission ([2024](https://research-and-innovation.ec.europa.eu/statistics/performance-indicators/european-innovation-scoreboard_en)) European Innovation Scoreboard