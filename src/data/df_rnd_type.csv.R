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
