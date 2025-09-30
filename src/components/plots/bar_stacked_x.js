import * as Plot from "@observablehq/plot";
import { html } from "npm:htl";
import { color_range } from "../utils/colors.js"

export function bar_stacked_x(data) {  

  const domain_y = data.filter(d => d.type === "Experimental development").sort((a, b) => a.share - b.share).map(item => item.country);

  return Plot.plot({
    caption: html`Source: <a href="https://oe.cd/msti" target="_blank">OECD Main Science and Technology Indicators (MSTI)</a>`,
    marginTop: 0,
    marginLeft: 100,
    color: {
      legend: true,
      domain: [
        "Basic research",
        "Applied research",
        "Experimental development"
      ],
      range: color_range
    },
    style: { fontSize: "11px" },
    x: { label: "in % of GERD", percent: true},
    y: {
      label: "",
      domain: domain_y,
      tickSize: 0
    },
    marks: [
      Plot.barX(data, {
        x: "share",
        y: "country",
        fill: "type",
        offset: "normalize",
        opacity: 0.8,
        order: [
          "Basic research",
          "Applied research",
          "Experimental development"
        ],
        sort: "x"
      }),
      Plot.text(
        data,
        Plot.stackX(
          {
            x: "share",
            y: "country", 
            z: "type",
            text: d => `${d.share.toFixed(0)} %`,
            offset: "normalize",
            order: [
              "Basic research",
              "Applied research", 
              "Experimental development"
            ],
            sort: "x"
        })
      )
    ]
});
}
