import { Empty, Tabs, notification } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import useFetch from 'use-http';
import { baseUrl, endpoints } from '../../api';
import { PhoneRecord, PhonesResponse } from '../../types';
import { uniq } from 'lodash';
import PhonesTab from './components/PhonesTab';

const HEADER_HEIGHT = 64;
const ALL_SOURCES_TAB = 'all';

const filterBySource = (phones: PhoneRecord[], selectedSource: string) =>
  phones.filter((phone) => (selectedSource !== ALL_SOURCES_TAB ? phone.source === selectedSource : phone));

const PhoneNumbers: React.FC = () => {
  const country = useParams().country ?? '';
  const [phones, setPhones] = useState<PhoneRecord[]>([]);
  const { error, get, loading, response } = useFetch(baseUrl);
  const isFetching = useRef(false);

  const getSourceOptions = (phones: PhoneRecord[]) => {
    const sources = uniq(phones.map((p) => p.source));
    return sources.length > 1 ? [ALL_SOURCES_TAB, ...sources] : sources;
  };

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

  const tabItems = useCallback(() => {
    const items = getSourceOptions(phones).map((source, index) => ({
      label: source,
      key: `${index}`,
      children: (
        <PhonesTab
          phones={filterBySource(phones, source)}
          country={country}
          loading={loading || isFetching.current}
          headerHeight={HEADER_HEIGHT}
        />
      )
    }));
    if (!items.length && isFetching.current) {
      return [
        {
          label: 'loading',
          key: `${0}`,
          children: (
            <PhonesTab
              phones={filterBySource(phones, ALL_SOURCES_TAB)}
              country={country}
              loading={loading || isFetching.current}
              headerHeight={HEADER_HEIGHT}
            />
          )
        }
      ];
    }
    return items;
  }, [country, loading, phones, isFetching]);

  if (error) {
    notification.error(error);
  }

  return !phones.length && !response.ok ? (
    <Tabs
      defaultActiveKey="1"
      centered
      size="large"
      items={tabItems()}
      tabBarStyle={{
        backgroundColor: 'InfoBackground',
        borderColor: 'InfoBackground',
        position: 'sticky',
        top: HEADER_HEIGHT,
        zIndex: 1,
        marginBottom: 0
      }}
    />
  ) : (
    <Empty style={{ marginTop: 100 }} description="Phone numbers not found" />
  );
};

export default PhoneNumbers;
