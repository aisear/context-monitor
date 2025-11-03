library(readr)
library(tidyverse)

df <- read.csv("https://ec.europa.eu/eurostat/api/dissemination/sdmx/3.0/data/dataflow/ESTAT/tin00140/1.0?compress=false&format=csvdata&formatVersion=2.0&lang=en&labels=name")
df_iso <- read.csv("https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/refs/heads/master/all/all.csv")


df <- df |>  select(
  country = Geopolitical.entity..reporting.,
  unit = Unit.of.measure,
  geo = geo,
  year = TIME_PERIOD,
  obs_value = OBS_VALUE
) |>
  mutate(
    var_axis = "Exports of high technology products as a share of total products exports",
    year_date = paste0(year, "-01-01")
  )

df <- df |>
  left_join(
    df_iso |> select(iso2 = alpha.2, iso3 = alpha.3), # nolint
    by = c("geo" = "iso2"))

cat(format_csv(df))