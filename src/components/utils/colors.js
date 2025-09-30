import * as Plot from "npm:@observablehq/plot";
import { iso3_country } from "./countries.js"
import { html } from "npm:htl";

// const df_rank = await FileAttachment("../../data/df_rank.csv").csv({ typed: true });

// const countries_list = new Map(
//   df_rank
//     .filter((d) => d.index === "GII" && d.year === 2024)
//     .sort((a, b) => a.rank - b.rank)
//     .map((d) => [d.country, d.iso3])
// );

export const countries = [
      "CHE",
      "SWE",
      "USA",
      "SGP",
      "GBR",
      "KOR",
      "FIN",
      "NLD",
      "CHN",
      "DNK",
      "ISR",
    ]

export const color_range1 = [
    "#0571b0",
    "#06F7DA",
    "#A2AFE9",
    "#FCE300",
    "#FF8774",
    "#77C0FD",
    "#A4FD77",
    "#53565A",
    "#9AFCF0",
    "#D9DEF6",
    "#FFCEC7"
]

export const color_range = [
  "#0571b0",
  "#06F7DA",
  "#A2AFE9",
  "#FCE300",
  "#FF8774",
  "#77C0FD",
  "rgb(117, 119, 121)",
  "rgb(150, 152, 152)",
  "rgb(184, 184, 183)",
  "rgb(217, 217, 214)",
  "rgb(235, 235,235)",
]
  
export const color_scale1 = Plot.scale({
    color: {
      type: "ordinal",
      domain: countries,
      range: color_range
    }
})

export const color_scale = Plot.scale({
  color: {
    type: "ordinal",
    domain: countries,
    range: color_range
  }
})

export const black_innosuisse = "#53565A";
export const grey_innosuisse = "#D9D9D6";
//export const colorRange = d3.quantize(d3.interpolate(black_innosuisse, grey_innosuisse), 5);

export function colorLegend(y) {
  return html`<span style="border-bottom: solid 2px ${color_scale.apply(`${y}`)};">${iso3_country.get(y)}</span>`;
}