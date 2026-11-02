library(readr)
library(tidyverse)

df <- read.csv("https://sdmx.oecd.org/public/rest/data/OECD.ENV.EPI,DSD_GG@DF_GREEN_GROWTH/..DMC_PROD+CO2_PBPROD..?startPeriod=2017&format=csvfilewithlabels") # nolint: line_length_linter.

df <- df |>  select(
  iso3 = REF_AREA,
  country = Reference.area,
  measure = MEASURE,
  measure_name = Measure,
  unit = UNIT_MEASURE,
  unit_name = Unit.of.measure,
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

cat(format_csv(df))