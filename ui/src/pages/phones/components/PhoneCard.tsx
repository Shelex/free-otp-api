import { Button, Card, Skeleton, Typography } from 'antd';
import ReactCountryFlag from 'react-country-flag';
import { PhoneRecord } from '../../../types';
import { uniqueId } from 'lodash';
import { IsoCode } from '../../countries/constants/iso';
import { useNavigate } from 'react-router-dom';

interface Props {
  phone?: PhoneRecord;
  loading?: boolean;
  countryName?: string;
}

const PhoneCard: React.FC<Props> = ({ countryName, phone, loading }) => {
  const navigate = useNavigate();
  const match = Object.keys(IsoCode).find((item) => item === countryName) as keyof typeof IsoCode;
  const iso = IsoCode[match] ?? IsoCode.Unknown;
  const isAvailable = countryName && phone;

  const isUSA = phone?.value && countryName === 'USA';
  const phoneEdited = isUSA ? `+1   ${phone.value}` : phone?.value;

  return isAvailable || loading ? (
    <Card
      key={uniqueId()}
      loading={loading}
      hoverable
      style={{ width: 240, height: 280, background: '#f5f5f5' }}
      title={<Typography.Title level={5}>{phoneEdited}</Typography.Title>}
      bordered={true}
      cover={
        phone ? (
          <ReactCountryFlag
            loading="lazy"
            countryCode={iso}
            svg
            aria-label={countryName}
            style={{
              width: '10em',
              height: '10em'
            }}
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
      onClick={() =>
        navigate(
          `/messages/${countryName}/${phone?.source}/${(isUSA ? `1${phone?.value}` : phone?.value)
            ?.replace('+', '')
            ?.trim()}?url=${phone?.url}`
        )
      }
    >
      <Button size="small" type="dashed" target="_blank" href={phone?.url} key={uniqueId()}>
        {phone?.source}
      </Button>
    </Card>
  ) : null;
};

export default PhoneCard;
