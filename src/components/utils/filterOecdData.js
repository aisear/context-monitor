/**
 * Filters OECD data by unit, measure, and countries
 * @param {Array} data - The OECD dataset
 * @param {string} unit - Unit type (default: "PT_B1GQ")
 * @param {string} measure - Measure type (default: "G")
 * @param {Array} countries - Array of ISO3 country codes (default: ["CHE"])
 * @returns {Array} Filtered and sorted data
 */
export function filter_oecd_data(data, unit = "PT_B1GQ", measure = "G", countries = ["CHE"]) {
  return data
    .filter((d) => d.unit === unit && d.measure === measure && countries.includes(d.iso3))
    .sort((a, b) => {
      // First sort by country: CHE comes first
      if (a.iso3 === "CHE" && b.iso3 !== "CHE") return 1;
      if (a.iso3 !== "CHE" && b.iso3 === "CHE") return -1;

      // Then sort by year
      return a.year - b.year;
    });
}
