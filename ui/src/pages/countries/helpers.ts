import { Country, CountryRecord } from '../../types';

export const transformCountryToCountryRecord = (countries?: Country[]) =>
  countries?.reduce((records, country) => {
    const countryIndex = records.findIndex((record) => record.name === country.country);
    if (countryIndex > -1) {
      records[countryIndex].sources.push({
        name: country.source,
        url: country.url,
        count: country.count
      });
      return records;
    }
    records.push({
      name: country.country,
      sources: [{ name: country.source, url: country.url, count: country.count }]
    });
    return records;
  }, [] as CountryRecord[]) ?? [];
