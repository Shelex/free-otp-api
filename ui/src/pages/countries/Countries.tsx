import useFetch from 'use-http';
import { baseUrl, endpoints } from '../../api';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Country, CountryRecord } from '../../types';
import CountryCard from './components/CountryCard';
import { Flex } from 'antd';
import { uniqueId } from 'lodash';
import { transformCountryToCountryRecord } from './helpers';

const Countries: React.FC = () => {
  const [countries, setCountries] = useState<CountryRecord[]>([]);
  const { error, get, loading, response } = useFetch(baseUrl);

  const isFetching = useRef(false);

  const getCountries = useCallback(async () => {
    if (countries.length) {
      return;
    }
    isFetching.current = true;
    const countriesResponse: Country[] = await get(endpoints.countriesList);
    isFetching.current = false;
    if (!response.ok) {
      return;
    }
    const records = transformCountryToCountryRecord(countriesResponse);
    setCountries(records);
  }, [get, response, countries]);

  useEffect(() => {
    getCountries();
  }, [getCountries]);

  return (
    <Flex justify="center" wrap="wrap" gap="middle">
      {error && <p>Error: {error?.message}</p>}
      {(isFetching.current || loading ? Array.from({ length: 24 }) : countries).map((country) => (
        <CountryCard key={uniqueId()} country={country as CountryRecord} loading={isFetching.current || loading} />
      ))}
    </Flex>
  );
};

export default Countries;
