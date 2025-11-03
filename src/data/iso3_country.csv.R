library(readr)
library(dplyr)
library(stringr)
library(tidyr)

setwd("~/Documents/Observable/wirkungsmonitoring/context-monitor/src/data")
df <- read_tsv("20241029_rankings.txt")

df2 <- df |>
  mutate(
    date = parse_date(year, format = "%d.%m.%Y"),
    year = str_sub(year, 7, 10)
  ) |>
  filter(year == "2024") |> 
  select(iso3, country, index, rank) |> 
  pivot_wider(names_from = index, values_from = rank) |> 
  filter(iso3 != "NA")

df3 = df2 |> arrange(GII)

cat(format_csv(df3))
