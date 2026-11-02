# Data sources reference

Updated 2026-11-02. See `docs/superpowers/plans/2026-11-02-data-import-audit.md` for how this was derived.

**Note:** this file is Markdown under `src/`, so Observable Framework builds
it as a page (`dist/data/DATA_SOURCES.html`) even though it isn't listed in
`observablehq.config.js`'s `pages` — confirmed by a full `npm run build`.
It's an internal maintenance doc, not meant for the public dashboard;
consider moving it outside `src/` (e.g. to `docs/`) if that matters.

## Auto-refreshing (live API loaders — `*.csv.R`, no manual action)

These re-fetch on every `npm run build`. Nothing to do here unless the build
fails or the API's dimension codes change.

| File | API | Query window |
|---|---|---|
| `df_gtard.csv.R` | OECD SDMX `DF_RDTAX` (R&D tax incentives) | `startPeriod=2018`, open-ended |
| `df_oecd_msti.csv.R` | OECD SDMX `DF_MSTI` (main science & tech indicators) | `startPeriod=2017`, open-ended |
| `df_oecd_mfp.csv.R` | OECD SDMX `DF_PDB` v2.0, measure `MFPH`, `ACTIVITY=_T` (multifactor productivity, hours-based, whole economy) | `startPeriod=2015`, open-ended — **migrated 2026-11-02.** The old `DF_PDB_GR` dataflow was retired by OECD (`isExternalReference="true"` / `NonProductionDataflow`; its `/public/rest/` endpoint now 500s on every query, confirmed down to a bare `/all`). `DF_PDB` v2.0 is the live replacement and has data through 2025, but **it currently has no `MFPH` row for Switzerland (`CHE`) at all** — checked directly against the full dataflow dump, CHE has many other PDB measures (GDP, employment, labour costs, …) but not multifactor productivity. The user chose to move to the current data and accept that Switzerland drops off this one chart rather than stay frozen on the old dataflow's archive mirror (`https://sdmx.oecd.org/archive/rest/data/OECD.SDD.TPS,DSD_PDB@DF_PDB_GR,1.0/...`, which still works and has CHE but is frozen at 2015–2022). The new dataflow also changed what's published: it's a year-over-year growth rate (`Transformation = "Growth rate, over 1 year"`), not an index level, so `var_axis` now reads "Multifactor productivity (hour based), Growth rate, over 1 year" instead of an index-level label — the chart titles/source links in `c_inno.md:134` and `images.md:461` were updated to match; if Switzerland's MFPH ever reappears in `DF_PDB`, this loader needs no further change, it'll just start showing up. |
| `df_oecd_vc.csv.R` | OECD SDMX `DF_VC_INV` (venture capital investment) | `startPeriod=2017`, open-ended |
| `df_oecd_gg.csv.R` | OECD SDMX `DF_GREEN_GROWTH` | `startPeriod=2017`, open-ended — version pin was removed 2026-11-02 after OECD superseded the pinned `1.1` (started 404ing); if this loader starts failing with "Could not find Dataflow and/or DSD", check whether OECD pinned a breaking structure change and whether the query needs adjusting |
| `df_ht.csv.R` | Eurostat `tin00140` (high-tech exports) + GitHub ISO-3166 lookup | no bound |
| `df_rnd_type.csv.R` | OECD SDMX `DF_GERD_TORD` (R&D by type) | rolling window, auto-picks latest year with Swiss (`CHE`) data — see Task 4 of the plan above |

**Lesson from the `df_oecd_gg.csv.R` bug:** loaders that pin an exact OECD
dataflow version (e.g. `DF_GREEN_GROWTH,1.1`) will eventually 404 when OECD
publishes a new version, or — worse, per `df_oecd_mfp.csv.R` above — the
whole dataflow can be retired under them (exactly what happened to the old
`DF_PDB_GR` version `df_oecd_mfp.csv.R` used to pin). Only `df_oecd_msti.csv.R`
and (after this fix) `df_oecd_gg.csv.R` omit the version segment; `df_gtard.csv.R`
and `df_oecd_vc.csv.R` still pin `,1.0`, `df_rnd_type.csv.R` still pins `,1.0`,
and `df_oecd_mfp.csv.R` now pins `,2.0` — all four carry the same latent
risk. Dropping the pin isn't free, though:
confirm the unpinned query still returns the expected shape before changing
any of them, the same way the `df_oecd_gg.csv.R` fix was verified live
before it was committed.

**Known manual follow-up (not fixed in this round):** `df_rnd_type.csv.R`
now auto-picks the latest year with Swiss data, but the pages that render
it don't follow along automatically — `images.md` hardcodes Switzerland's
share values (currently 37.9/27.2/34.9) instead of reading them from the
loader's output, and `a_rnd.md`/`images.md` hardcode the year "2023" in
chart headings/captions. When `df_rnd_type.csv.R` picks up a newer year
(e.g. once CHE reports 2025 data), those pages will keep showing the 2023
figures under a "2023" label even though every other country on the same
chart has moved to the new year. Fixing this means editing chart logic in
those pages, which was out of scope for this round (see the plan's Global
Constraints) — flagging it here so it isn't lost.

## Static — needs a human to fetch a new edition and swap the file

No new source data was available for any of these as of 2026-11-02. When a
newer edition is published, replace the file, update every
`FileAttachment(...)` call that names it (grep for the old filename across
`src/*.md`), and update this table.

| File | What it is | Used in | Next edition to watch for |
|---|---|---|---|
| `gii_2021_2025_score.csv` | Global Innovation Index scores, 2021–2025 | `index.md`, `images.md` | GII is published annually, typically autumn — watch for the 2026 edition extending the range to 2026 |
| `df_gem_tea_2018_2024.csv` | Global Entrepreneurship Monitor, Total early-stage Entrepreneurial Activity, 2018–2024 | `b_ens.md`, `images.md` | GEM publishes its annual report (typically spring) — watch for a 2025 data point |
| `switt_startup_2024.csv` | Swiss startup ecosystem data (startupticker/SWITT), 2024 edition | `d_ktt.md`, `images.md` | Published annually — watch for a 2025 edition |
| `rnd_ch_2023.csv` | Swiss R&D survey (BFS/KOF), 2023 edition | `a_rnd.md`, `images.md` | The Swiss R&D survey runs roughly every two years — watch for a 2025 edition |
| `innovationserhebung.csv` | KOF Innovation Survey (Switzerland) | `c_inno.md` | Check `innovationserhebung.ch` for a newer report than "innovationsbericht_2023" |
| `eurostat_pct_rd.txt` | Eurostat % R&D expenditure series | `c_inno.md` | No fixed cadence observed — re-pull from Eurostat if the chart looks stale |
| `20241024_vc.txt` | Venture capital / GDP snapshot dated 2024-10-24 | `b_ens.md` | Filename is a pull date, not a dataset vintage — re-pull from its original source and rename with the new pull date |
| `df_startupticker_vc.csv` | Swiss VC investment data (startupticker) | `b_ens.md` | Published periodically by startupticker.ch — re-pull if stale |
| `df_epo.csv` | European Patent Office filing data | `b_ens.md`, `images.md` | EPO publishes annual statistics — re-pull if stale |
| `df_unicorns_ch.csv` | Swiss unicorn company list | `b_ens.md`, `images.md` | No fixed cadence observed — re-pull if a new Swiss unicorn is known to be missing |
| `df_unicorns_country.csv` | Unicorn counts by country | `b_ens.md`, `images.md` | No fixed cadence observed — re-pull if stale |
| `df_unido_SDG_data.csv` | UNIDO SDG-related industrial data | `e_snd.md`, `images.md` | Check UNIDO's SDG data portal for a newer release |

## Removed/cut over in the 2026 audit

- `rankings_2025.csv` → `rankings_2026.csv` (same shape, newer data). See Task 1.
- `eis_raw_data_2025.csv` → `eis_raw_data_2026.csv` (same shape, newer data). See Task 2.
- `df.csv.R` — dead duplicate of `df_oecd_msti.csv.R`, fed an unused variable. See Task 3.
- `iso3_country.csv.R` — broken, unused; the real ISO3<->country mapping is the static `iso3_country_csv.csv`. See Task 3.
