library(readr)
library(dplyr)
library(stringr)
library(tidyr)

setwd("~/Documents/Observable/wirkungsmonitoring/context-monitor/src/data")

df <- read_tsv("20241029_rankings.txt")

df <- df |>
  mutate(
    date = parse_date(year, format = "%d.%m.%Y"),
    year = str_sub(year, 7, 10)
  )

df_bind <- df |>
  group_by(country, index) |>
  slice_max(order_by = year, n = 2) |>
  ungroup() |>
  group_by(country, index) |>
  arrange(desc(year)) |>
  mutate(rank_change = nth(rank, 2) - first(rank)) |>
  select(iso3, country, index, index_name, rank = rank_change) |>
  distinct() |>
  mutate(year = "Change")

result <- df_bind |> bind_rows(df)

cat(format_csv(result))