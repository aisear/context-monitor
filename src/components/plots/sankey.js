import * as d3 from "d3"
import * as d3Sankey from "npm:d3-sankey@0.12.3";

export function rnd_ch_sankey(data) {
 function graph() {
        const keys = data.columns.slice(0, -1);
        let index = -1;
        const nodes = [];
        const nodeByKey = new d3.InternMap([], JSON.stringify);
        const indexByKey = new d3.InternMap([], JSON.stringify);
        const links = [];
    
        for (let k of keys) {
            for (let d of data) {
                const key = [k, d[k]];
                if (nodeByKey.has(key)) continue;
                const node = {name: d[k]};
                nodes.push(node);
                nodeByKey.set(key, node);
                indexByKey.set(key, ++index);
            }
        }
    
        for (let i = 1; i < keys.length; ++i) {
            const a = keys[i - 1];
            const b = keys[i];
            const prefix = keys.slice(0, i + 1);
            const linkByKey = new d3.InternMap([], JSON.stringify);
            for (let d of data) {
                const names = prefix.map(k => d[k]);
                const value = d.value || 1;
                let link = linkByKey.get(names);
                if (link) { link.value += value; continue; }
                link = {
                    source: indexByKey.get([a, d[a]]),
                    target: indexByKey.get([b, d[b]]),
                    names,
                    value
                };
                links.push(link);
                linkByKey.set(names, link);
            }
        }
    
        return {nodes, links};
}

const graphData = graph();    
    
function chart() {
        const width = 700;
        const height = 440;
    
        const sankey = d3Sankey.sankey()
            .nodeSort(null)
            .linkSort(null)
            .nodeWidth(10)
            .nodePadding(17)
            .extent([
                [0, 30],
                [width - 230, height - 5]
            ]);
    
        const color = d3
            .scaleOrdinal(
                [
                    "Business enterprise sector",
                    "Confederation",
                    "Cantons",
                    "Higher education and PNP sectors",
                    "Abroad"
                ],
                [
                    "#0571b0",
                    "#06F7DA",
                    "#06F7DA",
                    "#FCE300",
                    "#FF8774"
                ]
            )
            .unknown("#ccc");
    
        const svg = d3
            .create("svg")
            .attr("viewBox", [0, 0, width, height])
            .attr("width", width)
            .attr("height", height)
            .attr("style", "max-width: 100%; height: auto;");
    
        const { nodes, links } = sankey({
            nodes: graphData.nodes.map((d) => Object.create(d)),
            links: graphData.links.map((d) => Object.create(d))
        });
    
        svg
            .append("g")
            .selectAll("rect")
            .data(nodes)
            .join("rect")
            .attr("x", (d) => (d.x0 > 0 ? d.x0 + 1 : d.x0 - 1))
            .attr("y", (d) => d.y0)
            .attr("height", (d) => d.y1 - d.y0)
            .attr("width", (d) => d.x1 - d.x0)
            .attr("fill", (d) => color(d.name))
            .append("title")
            .text((d) => `${d.name}\n${d.value.toLocaleString()}`);
    
        // Create a tooltip div (hidden by default)
        const tooltip = d3
            .select("body")
            .append("div")
            .style("position", "absolute")
            .style("background", "white")
            .style("border-radius", "5px")
            .style("padding", "5px 10px")
            .style("font", "12px sans-serif")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("text-align", "center")
            .style("box-shadow", "2px 2px 5px rgba(0,0,0,0.2)");
    
        svg
            .append("g")
            .attr("fill", "none")
            .selectAll("g")
            .data(links)
            .join("path")
            .attr("d", d3Sankey.sankeyLinkHorizontal())
            .attr("stroke", (d) => color(d.names[0]))
            .attr("stroke-width", (d) => d.width)
            .attr("stroke-opacity", "0.5")
            .style("mix-blend-mode", "multiply")
            .on("mouseover", function (event, d) {
                d3.select(this).attr("stroke-opacity", "1"); // Highlight link
                tooltip
                    .style("opacity", 1)
                    .html(
                        `<b>${d.names.join(" → ")}</b><br>CHF ${d.value.toLocaleString()} bn`
                    );
            })
            .on("mousemove", function (event) {
                const tooltipWidth = tooltip.node().offsetWidth;
                const tooltipHeight = tooltip.node().offsetHeight;
    
                tooltip
                    .style("left", `${event.pageX - tooltipWidth / 2}px`) // Center horizontally
                    .style("top", `${event.pageY - tooltipHeight - 10}px`); // Position above cursor
            })
            .on("mouseout", function () {
                d3.select(this).attr("stroke-opacity", "0.5"); // Reset opacity
                tooltip.style("opacity", 0); // Hide tooltip
            });
    
        svg
            .append("g")
            .style("font", "12px sans-serif")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("x", (d) => d.x1 + 6)
            .attr("y", (d) => (d.y1 + d.y0 - 5) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "start")
            .selectAll("tspan")
            .data((d) => [d.name, `CHF ${d.value.toLocaleString()} bn`])
            .join("tspan")
            .attr("x", (d, i, nodes) => nodes[i].parentNode.getAttribute("x"))
            .attr("dy", (d, i) => (i === 0 ? "0" : "1.2em"))
            .attr("font-weight", (d, i) => (i === 0 ? "bold" : "normal"))
            .attr("stroke", "white")
            .attr("stroke-width", "0.5px")
            .attr("stroke-opacity", "0.5")
            .attr("paint-order", "stroke fill")
            .text((d) => d);
    
        svg
            .append("text")
            .style("font", "16px sans-serif")
            .attr("x", 0) // Adjust x position as needed
            .attr("y", 20) // Adjust y position as needed
            .style("font-weight", "bold")
            .style("text-anchor", "start")
            .text("R&D Funding");
    
        // Add "Performance" text in the top-right corner
        svg
            .append("text")
            .style("font", "16px sans-serif")
            .attr("x", width - 240) // Adjust x position as needed
            .attr("y", 20) // Adjust y position as needed
            .style("font-weight", "bold")
            .style("text-anchor", "start")
            .text("R&D Expenditure");
    
return svg.node();
}

return chart();
}