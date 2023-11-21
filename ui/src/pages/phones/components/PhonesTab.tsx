import { Flex, Pagination } from 'antd';
import { useCallback, useState } from 'react';
import { PhoneRecord } from '../../../types';
import PhoneCard from './PhoneCard';
import { uniqueId } from 'lodash';

interface Props {
  phones: PhoneRecord[];
  country: string;
  loading: boolean;
  headerHeight: number;
}

const PAGE_SIZE_OPTIONS = [20, 40, 80, 120];
const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS.at(1) ?? 40;

const PhonesTab: React.FC<Props> = ({ phones, country, loading, headerHeight }) => {
  const [showPhones, setShowPhones] = useState<PhoneRecord[]>([]);
  const [paginationInfo, setPaginationInfo] = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE });

  const onSetPage = useCallback(
    (page: number, pageSize: number) => {
      setPaginationInfo((prev) => ({
        ...prev,
        current: page,
        pageSize: pageSize
      }));
      const startIndex = (page - 1) * pageSize;
      setShowPhones(phones.slice(startIndex, startIndex + pageSize));
    },
    [phones]
  );

  const getCardRecords = useCallback(() => {
    if (loading) {
      return Array.from({ length: 24 });
    }
    return showPhones.length ? showPhones : phones.slice(0, paginationInfo.pageSize);
  }, [loading, paginationInfo, phones, showPhones]);

  return (
    <>
      {phones.length ? (
        <Pagination
          total={phones.length}
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} phone numbers`}
          defaultPageSize={DEFAULT_PAGE_SIZE}
          defaultCurrent={1}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          {...paginationInfo}
          disabled={loading}
          onChange={onSetPage}
          style={{
            padding: 3,
            position: 'sticky',
            top: headerHeight + 57,
            backgroundColor: 'InfoBackground',
            zIndex: 1
          }}
        />
      ) : null}
      <Flex justify="center" wrap="wrap" gap="large">
        {getCardRecords()?.map((phone) => (
          <PhoneCard key={uniqueId()} phone={phone as PhoneRecord} loading={loading} countryName={country} />
        ))}
      </Flex>
    </>
  );
};

export default PhonesTab;
