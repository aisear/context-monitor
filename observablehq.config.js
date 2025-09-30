// See https://observablehq.com/framework/config for documentation.
export default {
  // The app's title; used in the sidebar and webpage titles.
  title: "Innovation Ecosystem",

  // The pages and sections in the sidebar. If you don't specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  pages: [
    { name: "Research and Development", path: "/a_rnd" },
    { name: "Entrepreneurship and Start-ups", path: "/b_ens" },
    { name: "Innovation Activities", path: "/c_inno" },
    { name: "Knowledge and Technology Transfer", path: "/d_ktt" },
    { name: "Sustainability and High-tech Exports", path: "/e_snd" }
  ],

  // Content to add to the head of the page, e.g. for a favicon:
  head: '<link rel="icon" href="favicon-32x32.png" type="image/png" sizes="32x32">',

  // The path to the source root.
  root: "src",

  // Base path for GitHub Pages deployment
  base: "/context-monitor",

  // Some additional configuration options and their defaults:
  theme: "light", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  footer: ({path}) => `Authors: <a href="mailto:adrianriser@innosuisse.ch">Adrian Riser</a> and Adrian Berwert, Impact Analysis, Innosuisse • Last changes: 30.07.2025 • <a href="https://observablehq.com/framework/" target="_blank">Built with Observable.</a>`,

  // sidebar: true, // whether to show the sidebar
  // toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
  // search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  // typographer: false, // smart quotes and other typographic improvements
  // cleanUrls: true, // drop .html from URLs
};