import { Flex, Typography } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import useFetch from 'use-http';
import { baseUrl, endpoints } from '../../api';
import { PhoneRecord, PhonesResponse } from '../../types';
import PhoneCard from './components/PhoneCard';
import { uniqueId } from 'lodash';

const PhoneNumbers: React.FC = () => {
  const country = useParams().country ?? '';
  const [phones, setPhones] = useState<PhoneRecord[]>([]);
  const { error, get, loading, response } = useFetch(baseUrl);
  const isFetching = useRef(false);

  const getPhones = useCallback(async () => {
    if (phones.length) {
      return;
    }
    isFetching.current = true;
    const phonesResponse: PhonesResponse = await get(endpoints.countryPhones(country));
    isFetching.current = false;
    if (response.ok) {
      setPhones(phonesResponse?.phones);
    }
  }, [country, get, response, phones]);

  useEffect(() => {
    if (!country) {
      return;
    }
    getPhones();
  }, [country, getPhones]);

  return (
    <>
      {<Typography.Text>{`${phones?.length ?? 0} Phone numbers found!`}</Typography.Text>}
      <Flex justify="center" wrap="wrap" gap="middle">
        {error && <p>Error: {error?.message}</p>}
        {(isFetching.current || loading ? Array.from({ length: 24 }) : phones)?.map((phone) => (
          <PhoneCard
            key={uniqueId()}
            phone={phone as PhoneRecord}
            loading={isFetching.current || loading}
            countryName={country}
          />
        ))}
      </Flex>
    </>
  );
};

export default PhoneNumbers;
