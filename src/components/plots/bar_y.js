import * as Plot from "npm:@observablehq/plot";
import { color_scale, countries } from "../utils/colors.js"
import {html} from "npm:htl";

export function bar_vc_ch(data) {
    // Create Plot
    return Plot.plot({
      width: 320,
      height: 320,
      marginTop: 45,
      caption: html`Source: <a href="https://www.startupticker.ch/en/swiss-venture-capital-report">Startupticker: Venture Capital Report</a>`,
      x: { label: "", tickSize: 0, tickFormat: "" },
      y: {
          label: `${data[0].measure} in ${data[0].unit}`,
        ticks: 6,
        grid: true,
        nice: true,
        tickFormat: (d) => d.toLocaleString("fr-CH")
      },
      color: color_scale, // take country colors from first plot
      style: { fontSize: "11px" },
      marks: [
        Plot.barY(data, {
          x: "year",
          y: "obs_value",
          fill: "iso3"
        }),
        Plot.text(data, {
          x: "year",
          y: "obs_value",
          text: (d) => d.obs_value.toLocaleString("fr-CH"),
          dy: -10 // Vertical adjustment
        }),
        Plot.ruleY([0])
      ]
    });
  }