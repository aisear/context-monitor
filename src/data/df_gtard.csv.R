library(readr)
library(tidyverse)

df <- read.csv(
  "https://sdmx.oecd.org/public/rest/data/OECD.STI.STP,DSD_RDTAX@DF_RDTAX,1.0/.A.DF_GTARD.PT_B1GQ..?startPeriod=2018&format=csvfilewithlabels"
)

df <- df |>  select(
  iso3 = REF_AREA,
  country = Reference.area,
  measure = MEASURE,
  measure_name = Measure,
  unit = UNIT_MEASURE,
  year = TIME_PERIOD,
  obs_value = OBS_VALUE
) |> 
  mutate(
    country = case_when(
      iso3 == "CHN" ~ "China",
      iso3 == "KOR" ~ "South Korea",
      TRUE ~ country),
    year_date = paste0(year,"-01-01")
  )

cat(format_csv(df))