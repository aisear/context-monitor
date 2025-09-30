// Data import
import { FileAttachment } from "observablehq:stdlib";

export const countries = [
    "CHE",
    "SWE",
    "USA",
    "SGP",
    "GBR",
    "KOR",
    "FIN",
    "NLD",
    "DEU",
    "DNK",
    "ISR",
];

const df_iso3_country = await FileAttachment("../../data/iso3_country_csv.csv").csv({ typed: true });

export const country_list = df_iso3_country.map((d) => d.iso3);
export const country_iso3 = new Map(df_iso3_country.map((d) => [d.country, d.iso3]));
export const iso3_country = new Map(df_iso3_country.map((d) => [d.iso3, d.country]));