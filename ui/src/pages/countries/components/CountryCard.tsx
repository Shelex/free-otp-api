import { Button, Card, Row, Skeleton, Typography } from 'antd';
import ReactCountryFlag from 'react-country-flag';
import { IsoCode } from '../constants/iso';
import { CountryRecord } from '../../../types';
import { uniqueId } from 'lodash';
import { useNavigate } from 'react-router-dom';

interface Props {
  country?: CountryRecord;
  loading?: boolean;
}

const CountryCard: React.FC<Props> = ({ country, loading }) => {
  const navigate = useNavigate();
  const match = Object.keys(IsoCode).find((item) => item === country?.name) as keyof typeof IsoCode;
  const iso = IsoCode[match] ?? IsoCode.Unknown;

  return !!country || loading ? (
    <Card
      loading={loading}
      hoverable
      style={{ width: 240, height: 360, background: '#f5f5f5' }}
      title={
        <Typography.Title style={{ border: 'none' }} level={5}>
          {country?.name}
        </Typography.Title>
      }
      cover={
        country ? (
          <ReactCountryFlag
            loading="lazy"
            countryCode={iso}
            svg
            aria-label={country?.name}
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
      onClick={() => !loading && country && navigate(`/phones/${country?.name}`)}
    >
      <Row>
        {country?.sources?.map((source) => (
          <Button size="small" type="dashed" target="_blank" href={source.url} key={uniqueId()}>
            {source.name}
          </Button>
        ))}
      </Row>
    </Card>
  ) : null;
};

export default CountryCard;
