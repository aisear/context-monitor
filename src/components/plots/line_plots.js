import * as Plot from "@observablehq/plot";
import { html } from "npm:htl";
import { occlusionY } from "../utils/occlusionY.js";
import * as aq from "arquero";
import { color_scale, color_range } from "../utils/colors.js"

export function line_oecd(
  data,
  remove = "% of GDP",
  wrap = false,
  source = "OECD Main Science and Technology Indicators (MSTI)",
  source_link = "https://oe.cd/msti",
  decimals = 1,
  percent = true,
  zero = true,
download_link = undefined)
{
  const pct = percent ? " %" : ""
  const label = data[0].var_axis === undefined ? data[0].measure_name + ", " + data[0].unit_name : data[0].var_axis

  return Plot.plot({
    caption: download_link === undefined ?
      html`Source: <a href="${source_link}" target="_blank">${source}</a>` :
      html`Source: <a href="${source_link}" target="_blank">${source}</a> • <a href="${download_link}" download>⤓ Download image</a>`,
    marginTop: 30,
    marginRight: 145,
     insetLeft: 7.5,
    color: color_scale,
    style: {fontSize: "11px"},
      x: { label: null, padding: 0.2},
      y: {
        label: label,
        ticks: 5,
        nice: true,
        zero: zero
      },
     marks: [
       Plot.line(data, {
         x: "year_date",
         y: "obs_value",
         z: "country",
         stroke: "iso3",
         strokeWidth: (d) => (d.iso3 === "CHE" ? 2 : 1.5),
         strokeOpacity: (d) => (d.iso3 === "CHE" ? 1 : 0.6),
         curve: "catmull-rom",
         marker: true
       }),
       Plot.tip(data, Plot.pointer({
        x: "year_date",
        y: "obs_value",
         z: "country", 
         title: (d) => `${d.country} (${d.year_date.getFullYear()}):\n${d.obs_value.toFixed(decimals)}${pct}`,
         strokeWidth: 0
      })),
       Plot.text(
         data,
         occlusionY()
           (Plot.selectLast({
           x: "year_date",
           y: "obs_value",
             z: "country",
             text: wrap ?
               (d) => d.year_date < new Date("2024") ? `${d.country}\n(${d.obs_value.toFixed(decimals)}${pct})` :
                 `${d.country} (${d.obs_value.toFixed(1)} %)` : (d) => `${d.country} (${d.obs_value.toFixed(decimals)}${pct})`,
           dx: 10, // Offset to the right
             dy: 0, // Vertical adjustment,
             textAnchor: "start",
             lineWidth: 14,
             textOverflow: "clip",
           stroke: "var(--plot-background)",
           fill: (d) => (d.country === "Switzerland" ? "black": "grey")
           //opacity: (d) => (d.country === "Switzerland" ? 1 : 0.6),
         }))
       ),
       ...(zero ? [Plot.ruleY([0])] : [])
     ]
   })
}

export function line_cis(data, measure = "pct_inno", domain_x, color_scale) {
    // Extract data from df
    const df_plot = data.filter(
      (d) => (d.measure === measure)
    ); // only for selected countries
  
    // Create Plot
    return Plot.plot({
      //title: 'Share of companies with successful product innovations',
      caption: "Source: Eurostat - Community Innovation Survey (CIS)",
      marginLeft: 45,
      marginRight: 95,
      marginBottom: 80,
      x: {
          tickRotate: -45,
        label: "",
        domain: domain_x
      },
      y: {
        label: `${df_plot[0].measure_name} in %`,
        domain: [0, 55],
        ticks: 6,
        //grid: true
      },
      color: color_scale, // take country colors from first plot
      style: { fontSize: "11px" },
      marks: [
        Plot.line(df_plot, {
          x: "years",
          y: "obs_value",
          z: "country",
          stroke: "iso3",
          strokeWidth: (d) => (d.iso3 === "CHE" ? 2 : 1.5),
          strokeOpacity: (d) => (d.iso3 === "CHE" ? 1 : 0.6),
          curve: "catmull-rom",
          marker: true
        }),
        Plot.tip(data, Plot.pointer({
          x: "years",
          y: "obs_value",
           z: "country", 
           title: (d) => `${d.country} (${d.years}):\n${d.obs_value.toFixed(0)} %`,
           strokeWidth: 0
        })),
        Plot.text(
          df_plot,
          occlusionY()(
            Plot.selectLast({
              x: "years",
              y: "obs_value",
              z: "country",
              text: (d) =>
                d.years === "2020–2022"
                  ? `${d.country} (${d.obs_value} %)`
                  : `${d.country}\n(${d.obs_value} %)`,
              dx: 10,
              textAnchor: "start",
              stroke: "var(--plot-background)",
              fill: (d) => (d.country === "Switzerland" ? "black" : "grey")
            })
          )
        ),
        [Plot.ruleY([0])]
      ]
    });
}

export function line_rank(
  data,
  indicator = "Innovationshemmnisse",
  percent = false,
  zero = true,
  domain = [0, 20]
) {
  const df_ie = data.filter((d) => d.indicator === indicator);

  // Assume data is an array of objects with date, value, and category fields
  const table = aq.from(df_ie);

  // Group by category, find the last date for each, and sort by value
  const lastValues = table
    .groupby("indicator_value_en")
    .filter((d) => d.years === "20–22") // Get max date for each category
    .orderby(aq.desc("obs_value")) // Sort by the last value in descending order
    .array("indicator_value_en"); // Just keep the categories in the sorted order

  const marginRight = 200;

  return Plot.plot({
    caption: html`Source: <a href="https://innovationserhebung.ch/innovationsbericht_2023/" target="_blank">KOF (2025)</a>`,
    height: 200,
    width: 320 + marginRight,
    marginTop: 25,
    marginRight: marginRight,
    color: {
      domain: lastValues,
      range: color_range
    },
    style: { fontSize: "11px" },
    x: {
      tickSize: 0,
      label: "",
      tickFormat: "%Y",
      domain: [new Date(2010, 0, 2), new Date(2022, 0, 2)],
      ticks: [
        new Date(1998, 0, 2),
        new Date(2002, 0, 2),
        new Date(2006, 0, 2),
        new Date(2010, 0, 2),
        new Date(2014, 0, 2),
        new Date(2018, 0, 2),
        new Date(2022, 0, 2)
      ],
      labelArrow: "none"
    },
    y: {
      grid: true,
      label: df_ie[0].indicator_en,
      tickFormat: percent ? (d) => `${d}%` : undefined,
      domain: domain,
      zero: zero,
      nice: 5
    },
    marks: [
      Plot.line(df_ie, {
        x: "date_end",
        y: "obs_value",
        stroke: "indicator_value_en",
        strokeWidth: 1.5,
        curve: "catmull-rom",
        marker: true
      }),
      Plot.tip(df_ie, Plot.pointer({
        x: "date_end",
        y: "obs_value",
        z: "indicator_value_en", 
        title: (d) => d.obs_value === null ? "" : `${d.indicator_value_en} (${d.date_end.getFullYear()}):\n${d.obs_value.toFixed(1)} %`,
        strokeWidth: 0
      })),
      Plot.text(
        df_ie,
        occlusionY()
          (Plot.selectLast({
            x: "date_end",
            y: "obs_value",
            text: "indicator_value_en",
            z: "indicator_value_en",
            textAnchor: "start",
            dx: 6,
            fill: "indicator_value_en"
          })
        )
      ),
      Plot.gridY([0])
    ]
  });
}