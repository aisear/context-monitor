import * as Plot from "npm:@observablehq/plot";
import { color_range } from "../utils/colors.js"
import { html } from "htl";

export function lin_reg(
    data,
    indicator = "Umsatzanteil F&E-Ausgaben",
    percent = false,
    zero = true,
    domain = undefined
  ) {

    const df_ie = data.filter((d) => d.indicator === indicator);

    // Create an array of marks without the zero line
    const marks = [
      Plot.linearRegressionY(df_ie, {
        x: "date_end",
        y: "obs_value",
        stroke: "lightblue",
        dx: -10
      }),
      Plot.link(df_ie, {
        x1: "date_start",
        x2: "date_end",
        y1: "obs_value",
        y2: "obs_value",
        z: "years",
        stroke: "#53565A",
        strokeWidth: 1.5,
        opacity: 1
      }),
      Plot.text(
        df_ie,
        Plot.selectLast({
          x: "date_end",
          y: "obs_value",
          text: (d) => `${d.obs_value.toFixed(0)}%`,
          dx: 15,
          fill: "#53565A",
          opacity: 1
        })
      )
    ];
    // Conditionally add the zero line based on the zero parameter
    if (zero) {
      marks.push(Plot.gridY([0]));
    }
  
    // Set up the y configuration
    const yConfig = {
      grid: true,
      label: df_ie[0].indicator_en,
      tickFormat: percent ? (d) => `${d}%` : undefined
    };
  
    // Add domain to yConfig if it's provided
    if (domain !== undefined) {
      yConfig.domain = domain;
    }
  
    return Plot.plot({
      height: 200,
      width: 320,
      caption: html`Source: <a href="https://innovationserhebung.ch/innovationsbericht_2023/" target="_blank">KOF (2025)</a>`,
      marginTop: 25,
      marginRight: 35,
      color: { range: color_range },
      style: { fontSize: "11px" },
      x: {
        tickSize: 0,
        label: "",
        tickFormat: "%Y",
        domain: [new Date(1997, 0, 2), new Date(2022, 0, 2)],
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
      y: yConfig,
      marks: marks
    });
}