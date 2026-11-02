library(readr)
library(tidyverse)

df <- read.csv("https://sdmx.oecd.org/public/rest/data/OECD.SDD.TPS,DSD_VC@DF_VC_INV,1.0/...PT_B1GQ.A?startPeriod=2017&format=csvfilewithlabels") # nolint: line_length_linter.

df <- df |>
  select(
    iso3 = REF_AREA,
    country = Reference.area,
    measure = MEASURE,
    measure_name = Measure,
    year = TIME_PERIOD,
    obs_value = OBS_VALUE,
    unit = UNIT_MEASURE,
    unit_name = Unit.of.measure,
    bds = BUSINESS_DEVELOPMENT_STAGE
  ) |>
  mutate(
        country = case_when(
      iso3 == "CHN" ~ "China",
      iso3 == "KOR" ~ "South Korea",
      TRUE ~ country),
    year_date = as.Date(paste0(year, "-01-01")),
    obs_value = as.numeric(obs_value)
  ) |>
  select(iso3, country, measure, measure_name, unit, unit_name, year, year_date, bds, obs_value)

cat(format_csv(df))