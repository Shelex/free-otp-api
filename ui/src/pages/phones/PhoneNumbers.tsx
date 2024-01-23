import { Empty, Menu, notification } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import useFetch from 'use-http';
import { baseUrl, endpoints } from '../../api';
import { PhoneRecord, PhonesResponse } from '../../types';
import { uniq } from 'lodash';
import PhonesTab from './components/PhonesTab';
import { ALL_SOURCES_TAB, HEADER_HEIGHT } from './constants';

const filterBySource = (phones: PhoneRecord[], selectedSource: string) =>
  phones.filter((phone) => (selectedSource !== ALL_SOURCES_TAB ? phone.source === selectedSource : phone));

const loadingMenuItem = { label: 'loading', key: 'loading', disabled: true };

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

  const getMenuItems = useCallback(() => {
    const items = getSourceOptions(phones).map((source) => ({
      label: source,
      key: source
    }));

    if (!items.length && isFetching.current) {
      return [loadingMenuItem];
    }

    return items;
  }, [phones]);

  const [selectedItem, setSelectedItem] = useState(getMenuItems().at(0)?.key ?? ALL_SOURCES_TAB);

  const contentPerSource = useCallback(() => {
    if (!selectedItem && selectedItem === 'loading') {
      return (
        <PhonesTab
          phones={filterBySource(phones, ALL_SOURCES_TAB)}
          country={country}
          loading={loading || isFetching.current}
          headerHeight={HEADER_HEIGHT}
        />
      );
    }

    return (
      <PhonesTab
        tabName={selectedItem}
        phones={filterBySource(phones, selectedItem)}
        country={country}
        loading={loading || isFetching.current}
        headerHeight={HEADER_HEIGHT}
      />
    );
  }, [country, loading, phones, selectedItem]);

  const tabItems = useCallback(() => {
    const items = getSourceOptions(phones).map((source) => ({
      label: source,
      key: source
    }));
    if (!items.length && isFetching.current) {
      return [loadingMenuItem];
    }
    return items;
  }, [phones, isFetching]);

  if (error) {
    notification.error(error);
  }

  if (!phones.length && response.ok && !isFetching.current) {
    return <Empty style={{ marginTop: 100 }} description="Phone numbers not found" />;
  }

  return (
    <>
      <Menu
        onSelect={(e) => setSelectedItem(e.key)}
        mode="horizontal"
        selectedKeys={[selectedItem]}
        items={tabItems()}
        style={{
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: 'InfoBackground',
          borderColor: 'InfoBackground',
          position: 'sticky',
          top: HEADER_HEIGHT,
          zIndex: 1,
          marginLeft: 10,
          marginBottom: 0
        }}
      />
      {contentPerSource()}
    </>
  );
};

export default PhoneNumbers;
