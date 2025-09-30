// Template for creating standardized PNG data loaders
// Copy this file and customize the sections marked with /* CUSTOMIZE */

import * as d3 from "d3";
import * as Plot from "@observablehq/plot";
import { parseHTML } from "linkedom";
import { Resvg } from "@resvg/resvg-js";
import fs from "fs";

// Import shared utilities (Node.js compatible versions)
import { countries, color_range, color_scale } from "./colors-node.js";

// Reusable PNG generation function - DO NOT MODIFY
function generatePlotPNG(plotFunction, data, args = [], options = {}) {
  const { scale = 3, background = "white", fontFamily = "Arial" } = options;
  
  const { document } = parseHTML("<a>");
  const chart = plotFunction(data, ...args, { document });
  
  chart.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  chart.style.fontFamily = fontFamily;
  
  return new Resvg(chart.outerHTML, {
    fitTo: {
      mode: "width",
      value: scale * chart.getAttribute("width"),
    },
    background,
  }).render().asPng();
}

/* CUSTOMIZE: Load your data */
const df_raw = d3.csvParse(
  await fs.promises.readFile("src/data/your-data.csv", "utf8"),
  d3.autoType
);

const df_processed = df_raw
  // Add your data processing here
  .filter(d => d.someCondition);

/* CUSTOMIZE: Define your plot function for PNG generation */
function your_plot_function_png(data, arg1, arg2, options = {}) {
  const { document } = options;
  
  return Plot.plot({
    document,
    // Your plot configuration here
    marks: [
      // Your plot marks here
    ]
  });
}

/* CUSTOMIZE: Generate PNG with your parameters */
const pngBuffer = generatePlotPNG(
  your_plot_function_png,
  df_processed,
  ["arg1_value", "arg2_value"], // Arguments for your plot function
  { scale: 3, background: "white", fontFamily: "Arial" }
);

process.stdout.write(pngBuffer);