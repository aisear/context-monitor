# Data sources reference

Updated 2026-11-02. See `docs/superpowers/plans/2026-11-02-data-import-audit.md` for how this was derived.

## Auto-refreshing (live API loaders — `*.csv.R`, no manual action)

These re-fetch on every `npm run build`. Nothing to do here unless the build
fails or the API's dimension codes change.

| File | API | Query window |
|---|---|---|
| `df_gtard.csv.R` | OECD SDMX `DF_RDTAX` (R&D tax incentives) | `startPeriod=2018`, open-ended |
| `df_oecd_msti.csv.R` | OECD SDMX `DF_MSTI` (main science & tech indicators) | `startPeriod=2017`, open-ended |
| `df_oecd_mfp.csv.R` | OECD SDMX `DF_PDB_GR` (multifactor productivity) | `startPeriod=2015`, open-ended — **currently failing as of 2026-11-02: OECD's `DF_PDB_GR` dataflow returns HTTP 500 for every query shape, including the bare `/all` query. Confirmed external/OECD-side, not a bug in this loader. Check `curl -s -o /dev/null -w "%{http_code}" "https://sdmx.oecd.org/public/rest/data/OECD.SDD.TPS,DSD_PDB@DF_PDB_GR/all?startPeriod=2022&format=csvfilewithlabels"` before assuming anything else is wrong.** |
| `df_oecd_vc.csv.R` | OECD SDMX `DF_VC_INV` (venture capital investment) | `startPeriod=2017`, open-ended |
| `df_oecd_gg.csv.R` | OECD SDMX `DF_GREEN_GROWTH` | `startPeriod=2017`, open-ended — version pin was removed 2026-11-02 after OECD superseded the pinned `1.1` (started 404ing); if this loader starts failing with "Could not find Dataflow and/or DSD", check whether OECD pinned a breaking structure change and whether the query needs adjusting |
| `df_ht.csv.R` | Eurostat `tin00140` (high-tech exports) + GitHub ISO-3166 lookup | no bound |
| `df_rnd_type.csv.R` | OECD SDMX `DF_GERD_TORD` (R&D by type) | rolling window, auto-picks latest year with Swiss (`CHE`) data — see Task 4 of the plan above |

**Lesson from the `df_oecd_gg.csv.R` bug:** loaders that pin an exact OECD
dataflow version (e.g. `DF_GREEN_GROWTH,1.1`) will eventually 404 when OECD
publishes a new version. The other loaders above deliberately omit the
version segment so they always resolve to whatever is current — prefer that
pattern over pinning a version number.

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
