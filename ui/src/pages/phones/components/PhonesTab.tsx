import { Flex, Input, Pagination } from 'antd';
import { useCallback, useState } from 'react';
import { PhoneRecord, PhoneRecordCard } from '../../../types';
import PhoneCard from './PhoneCard';
import { uniqBy, uniqueId } from 'lodash';
import { transformPhoneRecords } from './helpers';
import { SearchOutlined } from '@ant-design/icons';

interface Props {
  tabName?: string;
  phones: PhoneRecord[];
  country: string;
  loading: boolean;
  headerHeight: number;
}

const PAGE_SIZE_OPTIONS = [20, 40, 80, 120];
const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS.at(1) ?? 40;

const PhonesTab: React.FC<Props> = ({ phones, country, loading, headerHeight, tabName }) => {
  const [showPhones, setShowPhones] = useState<PhoneRecord[]>([]);
  const [paginationInfo, setPaginationInfo] = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE });
  const [queryPhones, setQueryPhones] = useState<PhoneRecord[]>([]);
  const [queryFailed, setQueryFailed] = useState(false);

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

  const onSearch = (query?: string) => {
    const queried = query ? phones.filter((p) => p.value.replace('+', '').includes(query.replace('+', ''))) : [];
    setQueryFailed(!!query && !queried.length);
    setQueryPhones(queried);
  };

  const getCardRecords = useCallback(() => {
    if (loading) {
      return Array.from({ length: 24 });
    }

    if (!!queryPhones.length !== queryFailed) {
      return transformPhoneRecords(queryPhones);
    }

    const phonesPerPage = showPhones.length ? showPhones : phones.slice(0, paginationInfo.pageSize);
    return transformPhoneRecords(phonesPerPage);
  }, [loading, paginationInfo, phones, queryFailed, queryPhones, showPhones]);

  return (
    <>
      {phones.length ? (
        <Flex
          justify="center"
          gap={10}
          style={{
            padding: 3,
            position: 'sticky',
            top: headerHeight + 46,
            backgroundColor: 'InfoBackground',
            zIndex: 1
          }}
        >
          <Input
            status={queryFailed ? 'error' : ''}
            style={{ width: '20%', minWidth: '130px' }}
            placeholder="Search"
            allowClear
            addonBefore={<SearchOutlined onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} />}
            onChange={(e) => onSearch(e.target.value ?? '')}
          />
          <Pagination
            total={uniqBy(phones, 'value').length}
            showTotal={(total, range) =>
              total <= paginationInfo.pageSize
                ? `${total} phones`
                : `${range[0]}-${range[1]} of ${total} phones`
            }
            defaultPageSize={DEFAULT_PAGE_SIZE}
            defaultCurrent={1}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            {...paginationInfo}
            disabled={loading || !!queryPhones.length || queryFailed}
            onChange={onSetPage}
            responsive
          />
        </Flex>
      ) : null}
      <Flex justify="center" wrap="wrap" gap="large">
        {getCardRecords()?.map((phone) => (
          <PhoneCard key={uniqueId()} phone={phone as PhoneRecordCard} loading={loading} countryName={country} />
        ))}
      </Flex>
    </>
  );
};

export default PhonesTab;
