import * as Plot from "@observablehq/plot";
import { html } from "npm:htl";
import { color_scale } from "../utils/colors.js"

export function plot_rank_bump(data, domain_fx, reverse = true, caption, download_link = undefined, options = {}) {
    const { document } = options;

    const df = data.filter((d) => domain_fx.includes(d.index) && d.year !== "Change");

    return Plot.plot({
        document,
        caption: document === undefined ? (download_link === undefined ? caption : 
            html`${caption} • <a href="${download_link}" download>⤓ Download image</a>`) : undefined,
        marginTop: 45,
        marginLeft: 45,
        marginRight: 100,
        height: 3/domain_fx.length * 450,
        width: 240 + domain_fx.length / 3 * 400,
        style: {fontSize: "11px"},
        color: color_scale,
        x: {
            interval: "year",
            axis: "top",
            tickSize: 0,
            ticks: 3,
            label: "",
            labelArrow: "none"
        },
        y: {
            axis: null,
            insetBottom: 15,
            insetTop: 15,
            reverse: true
        },
        fx: { padding: 0.6, reverse: reverse, label: "", axis: "top", tickPadding: 30 },
        marks: [
            Plot.line(df, {
                x: "year_date",
                y: "rank",
                z: "country",
                fx: "index_name",
                curve: "bump-x",
                stroke: "iso3",
                strokeOpacity: d => d.iso3 === "CHE" ? 1 : 0.6,
                strokeWidth: 5
            }),
            Plot.dot(df, {
                x: "year_date",
                y: "rank",
                z: "country",
                fx: "index_name",
                fill: "iso3",
                //fillOpacity: d => d.iso3 === "CHE" ? 1 : 0.6,
                r: 8.5
            }),
            Plot.text(df, {
                x: "year_date",
                y: "rank",
                z: "country",
                fx: "index_name",
                fill: "black",
                text: "rank"
            }),
            Plot.text(df, Plot.selectMaxX({
                x: "year_date",
                y: "rank",
                z: "country",
                fx: "index_name",
                fill: "black",
                textAnchor: "start",
                text: "country",
                lineWidth: 7,
                dx: 20
            }))
        ]
    });
}

export function plot_rank(data, domain_y, domain_fx, caption, reverse_fx = false) {  

    const df = data.filter((d) => domain_fx.includes(d.index));
    const domain_x = new Set(df.map((d) => d.year));

    return Plot.plot({
        //title: "Switzerland's position in innovation rankings",
        caption: caption,
        marginTop: 40,
        marginLeft: 100,
        x: {
            label: "",
            type: "band",
            domain: ["2022", "2023", "2024", "Change"],
            ticks: ["2022", "2023", "2024"],
            tickSize: 0,
            tickFormat: "~f",
            tickPadding: 5,
            axis: "top",
            domain: domain_x,
            labelArrow: "none"
        },
        color: { legend: null, scheme: "Blues", domain: [0, 30], reverse: true },
        y: {
            domain: domain_y,
            label: "",
            tickSize: 0,
            tickPadding: 0,
        },
        fx: {
            label: null,
            tickPadding: 20,
            axis: "top",
            reverse: reverse_fx
        },
        marks: [
            Plot.cell(
                df,
                {
                    x: "year",
                    y: "country",
                    fill: "rank",
                    fx: "index_name",
                    sort: { y: "fill" },
                }
            ),
            Plot.cell(
                df.filter((d) => d.year === "Change"),
                {
                    x: "year",
                    y: "country",
                    fill: (d) => {
                        if (d.rank > 2) return "#006837";
                        if (d.rank > 0) return "#85CB67";
                        if (d.rank < -2) return "#A50026";
                        if (d.rank < 0) return "#F88D52";
                        return "white";
                    },
                    fx: "index_name",
                    sort: { y: "fill" },
                }
            ),
            Plot.text(
                df,
                {
                    x: "year",
                    y: "country",
                    fx: "index_name",
                    fill: (d) => (d.year === "Change" || d.rank > 10 ? "black" : "white"),
                    fontSize: (d) => (d.year === "Change" ? 14 : 10),
                    text: (d) => {
                        if (d.year === "Change") {
                            if (d.rank > 2) return `↑`;
                            if (d.rank > 0) return `↗`;
                            if (d.rank < -2) return `↓`;
                            if (d.rank < 0) return `↘`;
                            return "–";
                        } else return d.rank;
                    },
                }
            ),
        ],
    });
}

