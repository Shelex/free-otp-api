import { Card, Skeleton, Tabs, Typography } from 'antd';
import ReactCountryFlag from 'react-country-flag';
import { PhoneRecordCard } from '../../../types';
import { uniqueId } from 'lodash';
import { IsoCode } from '../../countries/constants/iso';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface Props {
  phone?: PhoneRecordCard;
  loading?: boolean;
  countryName?: string;
}

const PhoneCard: React.FC<Props> = ({ countryName, phone, loading }) => {
  const navigate = useNavigate();
  const match = Object.keys(IsoCode).find((item) => item === countryName) as keyof typeof IsoCode;
  const iso = IsoCode[match] ?? IsoCode.Unknown;
  const isAvailable = countryName && phone;

  const isUSA = phone?.value && countryName === 'USA';
  const phoneEdited = isUSA ? `+1${phone.value}` : phone?.value;

  const [activeSourceTab, setActiveSourceTab] = useState(phone?.sources?.at(0)?.name);
  const activeTabSource = phone?.sources.find((source) => source.name === activeSourceTab);

  const sourceTabs =
    (phone?.sources?.length ?? 0) > 1
      ? phone?.sources.map((source) => ({
          key: source.name,
          label: source.name,
          tab: source.name
        }))
      : [];

  return isAvailable || loading ? (
    <Card
      key={uniqueId()}
      loading={loading}
      hoverable
      style={{ width: 260, background: '#f5f5f5' }}
      bodyStyle={sourceTabs?.length ? { height: 52 } : { height: 90 }}
      title={
        <>
          <Typography.Title copyable={!loading} level={5}>
            {phoneEdited}
          </Typography.Title>
          <Tabs activeKey={activeSourceTab} onChange={setActiveSourceTab} size="small" items={sourceTabs} />
        </>
      }
      bordered={true}
      cover={
        phone ? (
          <ReactCountryFlag
            loading="lazy"
            countryCode={iso}
            svg
            aria-label={countryName}
            style={{
              width: '12em',
              height: '10em'
            }}
            onClick={() =>
              phone &&
              !loading &&
              navigate(
                `/messages/${countryName}/${activeTabSource?.name ?? ''}/${(isUSA ? `1${phone?.value}` : phone?.value)
                  ?.replace('+', '')
                  ?.trim()}?url=${activeTabSource?.url}`
              )
            }
          />
        ) : (
          <Skeleton
            active
            loading={loading}
            avatar={{
              shape: 'square',
              style: {
                width: '12em',
                height: '10em'
              }
            }}
          />
        )
      }
      actions={[
        <Typography.Link target="_blank" href={activeTabSource?.url} key={uniqueId()}>
          {activeTabSource?.name ?? ''}
        </Typography.Link>
      ]}
    />
  ) : null;
};

export default PhoneCard;
