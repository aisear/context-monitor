import * as Plot from "@observablehq/plot";
import * as aq from "arquero";
import { color_scale } from "../utils/colors.js";
import { html } from "htl";

export function arrow_eis(
  df_filtered,
  year_start = 2021,
  year_end = 2025,
  later_greater = true
) {
  const yearStartNum = Number(year_start);
  const yearEndNum = Number(year_end);
  const df_pivoted = aq
    .from(df_filtered)
    .filter(aq.escape((d) => d.year === yearEndNum || d.year === yearStartNum))
    .groupby("country", "iso3")
    .pivot("year", "obs_value")
    .orderby(aq.desc(String(year_end)))
    .objects();
  const df_sorted = df_pivoted.map((d) => d.country);
  const anchor_early = later_greater ? "end" : "start";
  const anchor_late = later_greater ? "start" : "end";

  return Plot.plot({
    height: (250 * df_sorted.length) / 11,
    marginLeft: 100,
    marginTop: 35,
    marginRight: 50,
    caption:
      df_filtered[0].var_axis === "Global Innovation Index Score"
        ? `Source: WIPO (${year_end})`
        : `Source: European Commission (${year_end})`,
    color: color_scale,
    x: {
      label: `${df_filtered[0].var_axis} ${year_start}–${year_end}`,
      labelAnchor: "left",
      grid: true,
      axis: "top",
      labelOffset: 35,
      tickPadding: 5,
      tickSize: 0,
      ticks: 4,
      nice: 4,
    },
    y: {
      label: null,
      tickSize: 0,
      domain: df_sorted,
    },
    marks: [
      Plot.arrow(df_pivoted, {
        x1: year_start,
        y1: "country",
        x2: year_end,
        y2: "country",
        headLength: 5,
        stroke: "iso3",
      }),
      Plot.dot(df_pivoted, {
        x: year_start,
        y: "country",
        fill: "iso3",
        r: 2,
      }),
      Plot.text(
        df_pivoted.filter((d) => d.country === "Switzerland"),
        {
          x: year_start,
          y: "country",
          text: [year_start],
          textAnchor: anchor_early,
          dx: later_greater ? -5 : 5,
        }
      ),
      Plot.text(
        df_pivoted.filter((d) => d.country === "Switzerland"),
        {
          x: year_end,
          y: "country",
          text: [year_end],
          textAnchor: anchor_late,
          dx: later_greater ? 5 : -5,
        }
      ),
    ],
  });
}

export function arrow_unicorns(data, color_range) {
  const df = data;
  const sectorCounts = aq
    .from(df)
    .groupby("sector")
    .count() // This creates a count column automatically
    .orderby(aq.desc("count")); // Sort by count descending
  // return Array.from(
  //   d3.group(df_u, (d) => d.sector),
  //   ([sector, rows]) => rows[0]
  // );
  // Extract just the ordered sectors as an array
  const orderedSectors = sectorCounts.select("sector").array("sector");

  // Now get the companies ordered by sector count, then sector name, then year_u
  const sorted = aq
    .from(df)
    // Join with the sector counts to get the count for each row
    .join_left(sectorCounts, "sector")
    // Sort by the sector count, then sector name, then year_u
    .orderby(
      aq.desc("count"),
      "sector",
      aq.desc("year_unicorn"),
      aq.desc("year_founding")
    );

  const firstCompanies = sorted
    .groupby("sector")
    .slice(0, 1) // Takes the first row from each group
    .ungroup()
    .select("company")
    .join_left(aq.from(df));

  const sortedCompanies = sorted.select("company").array("company");

  return Plot.plot({
    caption: html`Source:
      <a href="https://www.sictic.ch/swiss-startup-unicorns/" target="_blank"
        >SICTIC</a
      >,
      <a href="https://www.startupticker.ch/" target="_blank">Startupticker</a>
      and own research`,
    marginLeft: 80,
    marginTop: 40,
    marginRight: 200,
    x: {
      axis: "top",
      label: "top-left",
      labelAnchor: "left",
      label: "Year of founding and 1B USD valuation",
      grid: true,
      domain: [new Date("1984"), new Date("2028")],
      ticks: 10,
    },
    y: { domain: sortedCompanies, tickSize: 0, axis: "right", label: "" },
    color: {
      //legend: true,
      //columns: 1,
      domain: orderedSectors,
      range: color_range,
    },
    style: { fontSize: "11px" },
    marks: [
      Plot.arrow(df, {
        x1: "year_founding",
        y1: "company",
        x2: "year_unicorn",
        y2: "company",
        stroke: "sector",
      }),
      Plot.dot(df, {
        x: "year_founding",
        y: "company",
        fill: "sector",
      }),
      Plot.text(
        [
          {
            year_founding: new Date("2009"),
            company: "Scandit",
            text: "Founded",
          },
        ],
        {
          x: "year_founding",
          y: "company",
          text: "text",
          textAnchor: "end",
          dx: -7,
        }
      ),
      Plot.text(
        [
          {
            year_founding: new Date("2022"),
            company: "Scandit",
            text: "1B USD\nvaluation",
          },
        ],
        {
          x: "year_founding",
          y: "company",
          text: "text",
          textAnchor: "start",
          dx: 5,
        }
      ),
      Plot.text(firstCompanies, {
        x: new Date("1976"),
        y: "company",
        text: "sector",
        textAnchor: "start",
        fill: "sector",
        stroke: "white",
        strokeWidth: 3,
      }),
    ],
  });
}
