import * as Plot from "@observablehq/plot";
import { iso3_country } from "../utils/countries.js";
import { html } from "npm:htl";
//import { color_range } from "../utils/colors.js"

const color_range = [
  "#0571b0",
"#06F7DA",
"#FCE300",
"#FF8774"
]

export function bar_stacked_y(data, source, source_link) {
  
  const df = data.filter((d) => d.year > 2016)
  
  return Plot.plot({
    marginTop: 25,
    color: { legend: true, columns: 1, range: color_range },
    style: { fontSize: "11px" },
    caption: html`Source: <a href="${source_link}" target="_blank">${source}</a>`,
    x: { label: null, tickFormat: "", tickSize: 0 },
    y: {
      label: "number of start-ups created",
      domain: [0, 100]
    },
    marks: [
      Plot.barY(
        df,
        { x: "year", y2: "obs_value", fill: "type" }
      ),
      //Plot.text(df_switt, {x: "year_date", y: "obs_value", text: "obs_value", dy: -15, dx: 10}),
      Plot.text(
        df,
        {
          x: "year",
          y: "obs_value",
          text: "obs_value",
          dy: -10,
          fill: (d) => (d.type === "new start-ups" ? "black" : "white")
        }
      ),
      Plot.ruleY([0])
    ]
  })
}

export function bar_stacked_y_normalized(data, normalize = true, domain = undefined, order = undefined) { 
  return Plot.plot({
    // Titel, Untertitel, Quelle
    //   title: 'Gross Domestic Expenditure on Research and Development (R&D) as a Percentage of GDP 2021',
    //  subtitle: 'Breakdown by Funding Source: Higher Education, Government, and Business Enterprise',
    caption:html`Source: <a href="https://oe.cd/msti">OECD Main Science and Technology Indicators (MSTI)</a>`,
    // Achsenbenennung
    marginBottom: 65,
    marginTop: 25,
    y: {
      label: normalize ? "in % of GERD" : "in % of GDP",
      percent: normalize ? true : false,
    },
    x: {
      tickSize: 0,
      tickRotate: -30,
      type: "band",
      domain: normalize ? domain : undefined
    },
    // Legende
    color: {
      legend: true,
      columns: 1, 
      width: 300,
      //reverse: true,
      range: color_range
    },
    style: { fontSize: "11px" },
    // Plot
    marks: [
      Plot.barY(data, {
        x: (d) => iso3_country.get(d.iso3),
        y: "obs_value",
        fill: "measure_name",
        order: order,
        insetLeft: 10,
        insetRight: 10,
        offset: normalize ? "normalize" : undefined,
        sort: { x: { value: "-y", reverse: "true" } },
        title: (d) => `${d.obs_value.toFixed(2)} % of GDP\n${d.measure_name}`,
      }),
      Plot.ruleY([0]),
    ],
  });

}

export function area_stacked_y_gerd_ch(data) {
  return Plot.plot({
        // Titel, Untertitel, Quelle
        //  title: 'Switzerland\'s Gross Domestic Expenditure on Research and Development (R&D) as a Percentage of GDP 2017–2021',
        //  subtitle: 'Breakdown by Funding Source: Higher Education, Government, and Business Enterprise',
    caption: html`Source: <a href="https://oe.cd/msti">
        OECD Main Science and Technology Indicators (MSTI)
        </a>`,
        // Achsenbenennung
        y: { label: "in % of GDP", ticks: [], domain: [0, 3.4] },
        x: {
          tickSize: 0,
          label: "",
          type: "band",
        },
        // Legende
        color: {
          legend: true,
          width: 300,
          reverse: true,
        },
        // Plot
        marks: [
          Plot.areaY(data, {
            x: "year_date",
            y: "obs_value",
            sort: { x: "y" },
            fill: "measure_name",
            order: [
              "Business Enterprise Expenditure on R&D (BERD)",
              "Government Intramural Expenditure on R&D (GOVERD)",
              "Higher Education Expenditure on R&D (HERD)",
            ],
          }),
          Plot.text(
            data.filter((d) => d.year === 2017),
            Plot.stackY({
              x: "year_date",
              y: "obs_value",
              z: "measure_name",
              text: (d) => `${d.obs_value.toFixed(2)} %`,
              dx: -25,
              sort: { x: "y" },
              order: [
                "Business Enterprise Expenditure on R&D (BERD)",
                "Government Intramural Expenditure on R&D (GOVERD)",
                "Higher Education Expenditure on R&D (HERD)",
              ],
            })
          ),
          Plot.text(
            data.filter((d) => d.year === 2021),
            Plot.stackY({
              x: "year_date",
              y: "obs_value",
              z: "measure_name",
              text: (d) => `${d.obs_value.toFixed(2)} %`,
              dx: 25,
              sort: { x: "y" },
              order: [
                "Business Enterprise Expenditure on R&D (BERD)",
                "Government Intramural Expenditure on R&D (GOVERD)",
                "Higher Education Expenditure on R&D (HERD)",
              ],
            })
          ),
        ],
      })
  }