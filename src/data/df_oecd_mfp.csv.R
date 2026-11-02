library(readr)
library(tidyverse)

df <- read.csv("https://sdmx.oecd.org/public/rest/data/OECD.SDD.TPS,DSD_PDB@DF_PDB,2.0/.A.MFPH._T......?startPeriod=2015&format=csvfilewithlabels") # nolint: line_length_linter.

df <-  df |>
  select(
    iso3 = REF_AREA,
    country = Reference.area,
    measure = Measure,
    year = TIME_PERIOD,
    obs_value = OBS_VALUE,
    Transformation,
    Unit.of.measure,
    BASE_PER,
    Price.base
  ) |>
  mutate(
        country = case_when(
      iso3 == "CHN" ~ "China",
      iso3 == "KOR" ~ "South Korea",
      TRUE ~ country),
    var_axis = paste0(measure, ", ", Transformation),
    year_date = as.Date(paste0(year, "-01-01")),
    obs_value = as.numeric(obs_value)
  ) |>
  select(iso3, country, measure, var_axis, year, year_date, obs_value)

cat(format_csv(df))
