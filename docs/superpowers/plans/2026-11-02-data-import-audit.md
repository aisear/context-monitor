# Data Import Audit & 2026 Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the data layer internally consistent for the 2026 refresh — finish the rankings-file and EIS-file cutovers, remove dead/broken data-loader debris discovered during the audit, stop one OECD loader from silently going stale year to year, and produce a reference doc listing every remaining static dataset that still needs a human to go fetch a new edition.

**Architecture:** Observable Framework resolves two kinds of data: (a) `.csv.R` files in `src/data/` are data loaders — Framework runs them with Rscript at build time and caches the stdout as `<name>.csv`, so anything they pull from a live API (OECD SDMX, Eurostat) refreshes automatically on every build with no manual step; (b) plain `.csv`/`.txt` files in `src/data/` are static snapshots that only change when someone replaces the file and updates whichever `.md` page's `FileAttachment(...)` call points at it. This plan does not change that architecture — it fixes places where the two got out of sync (stale filename references, abandoned loaders, one loader with a hardcoded year) and documents the static files that are still waiting on new source data.

**Tech Stack:** Observable Framework 1.12 (`observable build`/`observable preview`), R 4.5.1 (`Rscript`, tidyverse/readr) for data loaders, arquero/d3 in the browser layer (untouched by this plan).

**Spec:** No separate spec doc — scope was established by direct repo investigation (file-by-file audit of every `FileAttachment` call against every file in `src/data/`, plus live checks against the OECD/Eurostat APIs) and a short clarification exchange with the user. The findings and the user's decisions are recorded in Global Constraints below; this plan *is* the spec.

**Baseline:** All pre-existing uncommitted work (the `.md` page rewrites, the API-loader conversions, `rankings_2026.csv`, `eis_raw_data_2026.csv`, etc.) was committed to `main` as commit `32822bf` before this plan's branch (`data-import-2026`) was cut from it. Every task below starts from that commit.

## Global Constraints

- `rankings_2026.csv` is the canonical rankings file going forward. Every page must reference it; `rankings_2025.csv` is removed once nothing points at it (user decision).
- `eis_raw_data_2026.csv` (same schema as `eis_raw_data_2025.csv`, 9527 rows vs 8736) was dropped into `src/data/` during this session and confirmed by the user to be the new EIS edition, ready to wire in now — same cutover pattern as rankings, not a "wait for new data" item (user decision, superseding the plan's original assumption that no new EIS data existed).
- No new source data exists yet for the remaining static, year-named datasets (`gii_2021_2025_score.csv`, `df_gem_tea_2018_2024.csv`, `switt_startup_2024.csv`, `rnd_ch_2023.csv`). Do not fabricate, extrapolate, or guess updated figures for these — only document what exists and what to look for next (user decision).
- Treat the large rewrite committed in `32822bf` (`a_rnd.md`, `b_ens.md`, `c_inno.md`, `d_ktt.md`, `e_snd.md`, `images.md`, `index.md`, and the `.R` loader conversions) as content-correct. This plan only touches mechanical breakage surfaced by the audit (dead references, broken/orphaned loaders, one hardcoded year, the two stale-filename cutovers) — it does not re-review or rewrite prose/chart logic in those files (user decision).
- R is installed and network-reachable to `sdmx.oecd.org` and `ec.europa.eu/eurostat` from this environment (verified live during investigation) — loader verification steps below should actually run, not just be read.
- `.observablehq/cache/` is gitignored (confirmed in `.gitignore`); a loader that only "works" because of a stale local cache entry (e.g. `df.csv`, `iso3_country.csv` both have cache hits today) must still be judged on whether it would succeed from a clean checkout.
- Don't commit without being asked, and don't push. The task-level "Commit" steps below stage a logical unit of work locally; an explicit push/PR step is intentionally not part of this plan.

## Review Focus

- A page silently renders stale or mismatched data because a `FileAttachment` path doesn't match the intended file (this is exactly how `images.md` ended up still reading `rankings_2025.csv` after `index.md` moved to `rankings_2026.csv`, and how every EIS-reading page still read `eis_raw_data_2025.csv` even after `eis_raw_data_2026.csv` landed in the repo) — Tasks 1 and 2 fix the two known cases, Task 6 re-checks *every* `FileAttachment` call in `src/*.md` against `src/data/`, not just those two.
- Deleting `rankings_2025.csv`/`eis_raw_data_2025.csv` (or the two dead loaders in Task 3) before every reference is actually gone would break a future build invisibly today because the gitignored `.observablehq/cache/` directory still has old output cached — Tasks 1–3 all grep first, delete second, and then verify against a build, not just a grep.
- `df_rnd_type.csv.R`'s auto-picked "latest year" could land on a year where only a handful of early-reporting countries have data (confirmed live: the API already has partial 2024 rows for other countries while Switzerland itself only has 2023) — Task 4's test asserts the chosen year is the latest year for which Switzerland specifically has data, not merely the latest year present in the API response at all.
- An OECD/Eurostat endpoint timing out or changing shape would fail the whole static build with an opaque R error buried in Observable's build log — Task 5's verification runs each loader standalone first precisely so a failure is attributed to one named loader instead of discovered later as a generic `npm run build` failure.
- Removing `df.csv.R` / `iso3_country.csv.R` could break something if Framework does anything with `.csv.R` files beyond the `FileAttachment` calls already audited (e.g. sitemap/build manifest) — Task 3's last step is a full `npm run build`, not just the targeted grep, specifically to catch that class of breakage.

---

## Audit summary (for context, not a task)

**API-backed loaders (`.csv.R`), auto-refresh on every build — no manual action needed today:**

| Loader | Source | Notes |
|---|---|---|
| `df_gtard.csv.R` | OECD SDMX `DF_RDTAX` | `startPeriod=2018`, no end bound — smoke-tested live, returns through 2024 |
| `df_oecd_msti.csv.R` | OECD SDMX `DF_MSTI` | `startPeriod=2017`, no end bound |
| `df_oecd_mfp.csv.R` | OECD SDMX `DF_PDB_GR` | `startPeriod=2015`, no end bound |
| `df_oecd_vc.csv.R` | OECD SDMX `DF_VC_INV` | `startPeriod=2017`, no end bound |
| `df_oecd_gg.csv.R` | OECD SDMX `DF_GREEN_GROWTH` | `startPeriod=2017`, no end bound |
| `df_ht.csv.R` | Eurostat `tin00140` + GitHub ISO lookup | no period bound at all |
| `iso3_country.csv.R` *(name is misleading — see Task 3)* | n/a | **broken**, not what the name implies |

**Broken/dead, discovered during audit (fixed in Task 3):**
- `df.csv.R` is a near-duplicate of `df_oecd_msti.csv.R` (same OECD MSTI query, missing the Korea-naming fix) whose only consumer is an unused `const df` in `d_ktt.md:18`.
- `iso3_country.csv.R` does not build a country/ISO3 mapping at all — it `setwd()`s to a machine-specific absolute path and reads a local `20241029_rankings.txt` that no longer exists in the repo. Its output is referenced nowhere; the app actually gets ISO3↔country from the static `src/data/iso3_country_csv.csv` via `src/components/utils/countries.js`.

**API-backed but silently year-pinned (fixed in Task 4):**
- `df_rnd_type.csv.R` queries `DF_GERD_TORD` with `startPeriod=2023&endPeriod=2023` — a hardcoded single year. Verified live: Switzerland (`CHE`) still only has 2023 data for this measure today, so the current hardcode happens to be correct, but there's no mechanism to notice when `CHE`'s 2024/2025 figures land — someone has to remember to bump it by hand.

**Static files cut over to a newer edition in this plan:**
- `rankings_2025.csv` → `rankings_2026.csv` (Task 1).
- `eis_raw_data_2025.csv` → `eis_raw_data_2026.csv` (Task 2).

**Static files still needing a newer edition (documented, not fetched, in Task 7 — no new source data available yet):**
`gii_2021_2025_score.csv`, `df_gem_tea_2018_2024.csv`, `switt_startup_2024.csv`, `rnd_ch_2023.csv`, plus undated-but-static snapshots `innovationserhebung.csv`, `eurostat_pct_rd.txt`, `20241024_vc.txt`, `df_startupticker_vc.csv`, `df_epo.csv`, `df_unicorns_ch.csv`, `df_unicorns_country.csv`, `df_unido_SDG_data.csv`.

---

### Task 1: Finish the rankings_2025 → rankings_2026 cutover

**Files:**
- Modify: `src/images.md:35`
- Delete: `src/data/rankings_2025.csv` (only after the grep check below is clean)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing other tasks depend on — `rankings_2026.csv` is already in place and already the only thing `index.md` reads.

- [ ] **Step 1: Confirm current state before touching anything**

Run: `grep -rn "rankings_2025\|rankings_2026" src/*.md`
Expected output (one stale line, everything else already on 2026):
```
src/images.md:35:const df_rank = await FileAttachment("data/rankings_2025.csv").csv({
src/index.md:17:const df_rank = await FileAttachment("data/rankings_2026.csv").csv({
```

- [ ] **Step 2: Fix the stale reference**

In `src/images.md`, change line 35 from:
```js
const df_rank = await FileAttachment("data/rankings_2025.csv").csv({
```
to:
```js
const df_rank = await FileAttachment("data/rankings_2026.csv").csv({
```

- [ ] **Step 3: Verify no reference to the old filename remains anywhere in the app**

Run: `grep -rn "rankings_2025" src/ --include="*.md" --include="*.js"`
Expected: no output (exit code 1 / empty match).

- [ ] **Step 4: Delete the now-unreferenced file**

```bash
git rm src/data/rankings_2025.csv
```

- [ ] **Step 5: Build the two affected pages and confirm no FileAttachment error**

Run: `npx observable build --root src 2>&1 | grep -i "rankings\|error" || echo "no rankings/error lines"`
Expected: `no rankings/error lines` (or any build log lines mentioning `rankings` must reference `rankings_2026.csv`, never `rankings_2025.csv`).

- [ ] **Step 6: Commit**

```bash
git add src/images.md
git commit -m "$(cat <<'EOF'
Finish rankings_2025 -> rankings_2026 cutover

images.md was the last page still reading the old filename after
index.md had already moved to rankings_2026.csv. Removes the now-dead
rankings_2025.csv.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Wire in the EIS 2026 edition

**Files:**
- Modify: `src/index.md:35`, `src/e_snd.md:19`, `src/d_ktt.md:20`, `src/images.md:54`
- Delete: `src/data/eis_raw_data_2025.csv` (only after the grep check below is clean)

**Interfaces:**
- Consumes: nothing from Task 1 (disjoint files).
- Produces: nothing other tasks depend on.

`eis_raw_data_2026.csv` has the same columns as `eis_raw_data_2025.csv` (`iso2, iso3, country, var, var_long, var_axis, var_question, year, obs_value, year_date`) and more rows (9527 vs 8736), so this is a pure filename cutover — no downstream filter/column logic in any consuming page needs to change.

- [ ] **Step 1: Confirm current state before touching anything**

Run: `grep -rn "eis_raw_data_2025\|eis_raw_data_2026" src/*.md`
Expected: four hits, all on `eis_raw_data_2025.csv` (`index.md:35`, `e_snd.md:19`, `d_ktt.md:20`, `images.md:54`), zero on `eis_raw_data_2026.csv`.

- [ ] **Step 2: Point every consuming page at the new file**

In each of `src/index.md`, `src/e_snd.md`, `src/d_ktt.md`, `src/images.md`, change the `eis_raw_data_2025.csv` FileAttachment call to `eis_raw_data_2026.csv`. For example in `src/index.md:35`:
```js
const df_eis = await FileAttachment("data/eis_raw_data_2025.csv").csv({
```
becomes:
```js
const df_eis = await FileAttachment("data/eis_raw_data_2026.csv").csv({
```
(Same edit, same pattern, in the other three files — each already has the identical `FileAttachment("data/eis_raw_data_2025.csv")` or `FileAttachment("./data/eis_raw_data_2025.csv")` call shape; only the filename changes.)

- [ ] **Step 3: Verify no reference to the old filename remains anywhere in the app**

Run: `grep -rn "eis_raw_data_2025" src/ --include="*.md" --include="*.js"`
Expected: no output (exit code 1 / empty match).

- [ ] **Step 4: Delete the now-unreferenced file**

```bash
git rm src/data/eis_raw_data_2025.csv
```

- [ ] **Step 5: Build the four affected pages and confirm no FileAttachment error**

Run: `npx observable build --root src 2>&1 | grep -i "eis_raw_data\|error" || echo "no eis_raw_data/error lines"`
Expected: `no eis_raw_data/error lines`.

- [ ] **Step 6: Commit**

```bash
git add src/index.md src/e_snd.md src/d_ktt.md src/images.md
git commit -m "$(cat <<'EOF'
Wire in EIS 2026 edition, retire eis_raw_data_2025.csv

eis_raw_data_2026.csv landed in src/data/ with the same schema and
9527 rows (vs 8736 in the 2025 edition) but no page had been switched
over to it yet. Points index.md, e_snd.md, d_ktt.md and images.md at
the new file and removes the now-dead 2025 edition.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Remove dead/broken data-loader debris

**Files:**
- Delete: `src/data/df.csv.R`
- Delete: `src/data/iso3_country.csv.R`
- Modify: `src/d_ktt.md:18`

**Interfaces:**
- Consumes: nothing from Tasks 1–2.
- Produces: nothing other tasks depend on — both deleted loaders are confirmed dead ends (see Audit summary above and the grep in Step 1).

- [ ] **Step 1: Re-confirm both loaders are genuinely unreferenced**

Run:
```bash
grep -rn "data/df\.csv\b" src/ --include="*.md" --include="*.js"
grep -rn "data/iso3_country\.csv\b" src/ --include="*.md" --include="*.js"
```
Expected for the first: exactly one hit, `src/d_ktt.md:18:const df = await FileAttachment("data/df.csv").csv({ typed: true });` — and nothing else in the file uses the `df` variable (confirm with `grep -n "\bdf\b" src/d_ktt.md`, which must show only that one line).
Expected for the second: no output at all.

- [ ] **Step 2: Remove the dead FileAttachment line from d_ktt.md**

In `src/d_ktt.md`, delete line 18:
```js
const df = await FileAttachment("data/df.csv").csv({ typed: true });
```
(It was declared and never read anywhere in the file.)

- [ ] **Step 3: Delete both dead loaders**

```bash
git rm src/data/df.csv.R src/data/iso3_country.csv.R
```

- [ ] **Step 4: Clear the cache so a stale cached CSV can't mask a problem**

```bash
npm run clean
```

- [ ] **Step 5: Full build to confirm nothing implicitly depended on either loader**

Run: `npx observable build --root src`
Expected: build completes with exit code 0 and no error mentioning `df.csv` or `iso3_country.csv`.

- [ ] **Step 6: Commit**

```bash
git add src/d_ktt.md
git commit -m "$(cat <<'EOF'
Remove dead df.csv.R and broken iso3_country.csv.R loaders

df.csv.R duplicated df_oecd_msti.csv.R and fed an unused variable in
d_ktt.md. iso3_country.csv.R didn't build a country mapping at all —
it setwd() into a machine-specific path and read a local file that no
longer exists in the repo; its output was never consumed anywhere
(the app gets ISO3<->country from the static iso3_country_csv.csv via
components/utils/countries.js).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Stop df_rnd_type.csv.R from silently going stale

**Files:**
- Modify: `src/data/df_rnd_type.csv.R`

**Interfaces:**
- Consumes: nothing from Tasks 1–3.
- Produces: `df_rnd_type.csv` with columns `iso3, country, type, year, obs_value, total, share` (same shape as today's output — consumed by `a_rnd.md:38`/`a_rnd.md:138` and `images.md:79`/`images.md:179`, neither of which needs to change).

**Current behavior (the bug):** the loader hardcodes `startPeriod=2023&endPeriod=2023`, and separately computes each country's "total R&D" by grouping only on `iso3` (not also on year). That second part means if the query window is ever widened to more than one year, the "total" would silently sum multiple years together and the `share` column would be wrong. That's why it was pinned to a single year instead of being left open-ended like the other six OECD loaders — but nothing flags it when that pinned year falls behind.

**The fix:** widen the query window, group totals by `(iso3, year)` so multiple years in the response stay correct, then pick — per country — the most recent year that actually has data, instead of a hardcoded calendar year.

- [ ] **Step 1: Confirm today's "correct" answer before changing anything**

Run:
```bash
curl -s -m 25 "https://sdmx.oecd.org/public/rest/data/OECD.STI.STP,DSD_RDS_GERD@DF_GERD_TORD,1.0/.A.._T...ED+AR+BR+_T...USD_PPP.Q?startPeriod=2021&dimensionAtObservation=AllDimensions&format=csvfilewithlabels" -o /tmp/gerd_check.csv
Rscript -e 'df <- read.csv("/tmp/gerd_check.csv"); print(sort(unique(df[df$REF_AREA=="CHE","TIME_PERIOD"])))'
```
Expected today: `[1] 2023` (if a newer year now appears for `CHE`, that's fine — it only proves the fix below picks it up without a manual edit).

- [ ] **Step 2: Rewrite the loader to pick the latest year with Swiss data, instead of a hardcoded year**

Replace the full contents of `src/data/df_rnd_type.csv.R` with:

```r
library(readr)
library(tidyverse)

df <- read.csv("https://sdmx.oecd.org/public/rest/data/OECD.STI.STP,DSD_RDS_GERD@DF_GERD_TORD,1.0/.A.._T...ED+AR+BR+_T...USD_PPP.Q?startPeriod=2019&dimensionAtObservation=AllDimensions&format=csvfilewithlabels") # nolint: line_length_linter.

df_selected <- df |> select(
  iso3 = REF_AREA,
  country = Reference.area,
  type = Type.of.R.D,
  year = TIME_PERIOD,
  obs_value = OBS_VALUE
) |>
  mutate(
    country = case_when(
      iso3 == "CHN" ~ "China",
      iso3 == "KOR" ~ "South Korea",
      TRUE ~ country),
    year_date = paste0(year, "-01-01")
  )

latest_year_che <- df_selected |>
  filter(iso3 == "CHE") |>
  pull(year) |>
  max()

df_selected <- df_selected |> filter(year == latest_year_che)

df_joined <- left_join(
  df_selected |> # nolint
    filter(type != "Total") |>
    group_by(iso3, country, type, year = year_date) |>
    summarise(obs_value = sum(obs_value)),
  df_selected |>
    filter(type == "Total") |>
    group_by(iso3, year = year_date) |>
    summarise(total = sum(obs_value)),
  by = c("iso3", "year")) |>
  mutate(share = round(obs_value / total * 100, 1)) # nolint

cat(format_csv(df_joined))
```

Key changes from the original: `startPeriod` widened from `2023` (single year) to `2019` (rolling window, no end bound); `latest_year_che` is computed from the response instead of hardcoded; the total-per-country `group_by` now includes `year`, matching the per-type `group_by`, so the join is correct even though the window now spans several years; the join explicitly keys on `c("iso3", "year")` instead of an implicit `by` guess.

- [ ] **Step 3: Run the loader standalone and verify it reproduces the current correct answer**

Run:
```bash
cd src/data && Rscript -e 'suppressMessages(suppressWarnings(source("df_rnd_type.csv.R")))' > /tmp/rnd_type_out.csv 2>/tmp/rnd_type_err.txt
echo "exit $?"
Rscript -e 'df <- read.csv("/tmp/rnd_type_out.csv"); print(unique(df[df$iso3=="CHE", c("year")])); print(nrow(df[df$iso3=="CHE",]))'
```
Expected: exit 0, `year` prints `2023-01-01` (matching Step 1's finding), and Switzerland has more than zero rows (the three non-Total `type` values).

- [ ] **Step 4: Verify the share column still sums sensibly for Switzerland**

Run: `Rscript -e 'df <- read.csv("/tmp/rnd_type_out.csv"); che <- df[df$iso3=="CHE",]; print(che[, c("type","obs_value","total","share")]); print(sum(che$share))'`
Expected: `sum(che$share)` is close to 100 (within rounding) — confirms the three R&D types' shares add up, which they would not if the total/year join were broken.

- [ ] **Step 5: Full build of the page that consumes this loader**

Run: `npx observable build --root src 2>&1 | grep -i "rnd_type\|error" || echo "no rnd_type/error lines"`
Expected: `no rnd_type/error lines`.

- [ ] **Step 6: Commit**

```bash
git add src/data/df_rnd_type.csv.R
git commit -m "$(cat <<'EOF'
Make df_rnd_type.csv.R pick the latest year automatically

The loader was hardcoded to startPeriod=endPeriod=2023, so it would
silently go stale the moment OECD published a newer Swiss figure for
this measure, with nothing to flag it. It now queries a rolling
window and picks the latest year that has Swiss (CHE) data, fixing
the total-per-country grouping (now keyed on iso3+year, not iso3
alone) so a multi-year response stays correct.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Verify the remaining API-backed loaders run cleanly end-to-end

**Files:** none expected to change — this is a verification task. If a loader fails, fix it inline in this task and note the fix in the commit message instead of opening a new task.

**Interfaces:**
- Consumes: nothing from Tasks 1–4.
- Produces: confidence that `npm run build` (Task 6) won't fail on a loader-level issue, with each failure (if any) already attributed to a specific named loader.

- [ ] **Step 1: Run each remaining loader standalone and capture exit code + row count**

```bash
cd src/data
for f in df_oecd_msti df_oecd_mfp df_oecd_vc df_ht df_oecd_gg; do
  echo "=== $f ==="
  Rscript -e "suppressMessages(suppressWarnings(source('$f.csv.R')))" > "/tmp/${f}_out.csv" 2>"/tmp/${f}_err.txt"
  echo "exit $?"
  wc -l < "/tmp/${f}_out.csv"
done
```
Expected: every loader prints `exit 0` and a row count greater than 1 (header + at least one data row). (`df_gtard.csv.R` was already smoke-tested live during this plan's investigation — 407 rows, latest year 2024 — so it's not repeated here.)

- [ ] **Step 2: Spot-check that each output has a recent year, not frozen historical data**

```bash
for f in df_oecd_msti df_oecd_mfp df_oecd_vc df_ht df_oecd_gg; do
  echo "=== $f ==="
  Rscript -e "df <- read.csv('/tmp/${f}_out.csv'); print(max(df\$year, na.rm = TRUE))"
done
```
Expected: each prints a year within the last 2–3 years (these are live API pulls, so "recent" depends on each dataset's actual publication lag — the point is confirming it's not stuck on some old cached value, not that every dataset has 2025/2026 data yet).

- [ ] **Step 3: If any loader fails or errors, read its `/tmp/<name>_err.txt` and fix the loader file directly, then re-run Steps 1–2 for that loader until it passes.**

(No placeholder here because the fix is data-dependent — if this step is needed, the actual R error message dictates the actual fix. If all five loaders pass in Steps 1–2, skip this step entirely.)

- [ ] **Step 4: Commit (only if Step 3 required a code change; otherwise skip — there's nothing to commit for a clean verification pass)**

```bash
git add src/data/<fixed-loader>.csv.R
git commit -m "$(cat <<'EOF'
Fix <loader> data loader

<one-line description of what the standalone run surfaced>

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Full-site build verification and FileAttachment audit

**Files:** none expected to change unless this step surfaces something Tasks 1–5 missed.

**Interfaces:**
- Consumes: the fixes from Tasks 1–5.
- Produces: confidence that every `FileAttachment` call across the whole app resolves to a real file and that `npm run build` succeeds end to end.

- [ ] **Step 1: Mechanically verify every FileAttachment target exists**

```bash
cd /Users/antigone/Documents/Observable/wirkungsmonitoring/context-monitor
grep -rnoE 'FileAttachment\("\.?/?(data/[^"]+)"' src/*.md src/components/**/*.js | \
  sed -E 's/.*FileAttachment\("\.?\/?(data\/[^"]+)"/\1/' | sort -u | while read -r rel; do
    # loader-backed files (name.csv) are produced by name.csv.R, not present as a plain file
    if [ -f "src/$rel" ] || [ -f "src/${rel}.R" ]; then
      echo "OK   $rel"
    else
      echo "MISSING $rel"
    fi
  done
```
Expected: every line printed is `OK ...`; zero `MISSING` lines.

- [ ] **Step 2: Clear the cache and run a full production build**

```bash
npm run clean
npm run build
```
Expected: exit code 0, build output in `dist/`, no error/warning mentioning a missing `FileAttachment` or a failed data loader.

- [ ] **Step 3: Confirm the built index and images pages reference 2026 rankings and EIS data, not the old 2025 filenames**

```bash
grep -o "rankings_202[0-9]\.csv\|eis_raw_data_202[0-9]\.csv" dist/index.html dist/images.html 2>/dev/null | sort -u
```
Expected: only `rankings_2026.csv` and `eis_raw_data_2026.csv` entries for those two files — no `rankings_2025.csv` or `eis_raw_data_2025.csv` anywhere in the built output. (If the build inlines data rather than the filename, instead confirm via row counts: `wc -l src/data/rankings_2026.csv src/data/eis_raw_data_2026.csv` should match what the rendered page's data reflects, not the row counts of the deleted 2025 files.)

- [ ] **Step 4: Commit (only if Step 1–3 surfaced and required a fix; otherwise there's nothing new to commit — this task is a gate, not a change)**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Fix FileAttachment path surfaced by full-site build audit

<describe the specific missing/mismatched reference found>

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Document the static datasets still waiting on a new edition

**Files:**
- Create: `src/data/DATA_SOURCES.md`

**Interfaces:**
- Consumes: the audit performed while writing this plan (see "Audit summary" above) — no code dependency on Tasks 1–6.
- Produces: a reference doc a human (or a future Claude session) reads before going to fetch new source data, so "what do I update manually" never has to be re-derived from scratch again.

- [ ] **Step 1: Write the reference doc**

Create `src/data/DATA_SOURCES.md` with this content:

```markdown
# Data sources reference

Updated 2026-11-02. See `docs/superpowers/plans/2026-11-02-data-import-audit.md` for how this was derived.

## Auto-refreshing (live API loaders — `*.csv.R`, no manual action)

These re-fetch on every `npm run build`. Nothing to do here unless the build
fails or the API's dimension codes change.

| File | API | Query window |
|---|---|---|
| `df_gtard.csv.R` | OECD SDMX `DF_RDTAX` (R&D tax incentives) | `startPeriod=2018`, open-ended |
| `df_oecd_msti.csv.R` | OECD SDMX `DF_MSTI` (main science & tech indicators) | `startPeriod=2017`, open-ended |
| `df_oecd_mfp.csv.R` | OECD SDMX `DF_PDB_GR` (multifactor productivity) | `startPeriod=2015`, open-ended |
| `df_oecd_vc.csv.R` | OECD SDMX `DF_VC_INV` (venture capital investment) | `startPeriod=2017`, open-ended |
| `df_oecd_gg.csv.R` | OECD SDMX `DF_GREEN_GROWTH` | `startPeriod=2017`, open-ended |
| `df_ht.csv.R` | Eurostat `tin00140` (high-tech exports) + GitHub ISO-3166 lookup | no bound |
| `df_rnd_type.csv.R` | OECD SDMX `DF_GERD_TORD` (R&D by type) | rolling window, auto-picks latest year with Swiss (`CHE`) data — see Task 4 of the plan above |

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
```

- [ ] **Step 2: Cross-check the "Used in" column against the live codebase**

Run: `grep -l "gii_2021_2025_score\|df_gem_tea_2018_2024\|switt_startup_2024\|rnd_ch_2023\|innovationserhebung\|eurostat_pct_rd\|20241024_vc\|df_startupticker_vc\|df_epo\|df_unicorns_ch\|df_unicorns_country\|df_unido_SDG_data" src/*.md`
Expected: the set of files returned matches exactly what's listed in each row's "Used in" column in Step 1 — fix any row that's drifted before committing.

- [ ] **Step 3: Commit**

```bash
git add src/data/DATA_SOURCES.md
git commit -m "$(cat <<'EOF'
Add data source reference doc for the 2026 refresh

Documents which data loaders auto-refresh via live APIs versus which
static datasets still need a human to go fetch a new edition, so this
doesn't have to be re-derived from scratch next year.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
