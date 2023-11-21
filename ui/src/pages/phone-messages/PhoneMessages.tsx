import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useFetch, { CachePolicies } from 'use-http';
import { baseUrl, endpoints } from '../../api';
import { Message, PhoneMessagesResponse } from '../../types';
import MessagesTable from './MessagesTable';
import { Button, Flex } from 'antd';
import { StepForwardOutlined, StepBackwardOutlined, RedoOutlined } from '@ant-design/icons';

const PhoneMessages: React.FC = () => {
  const navigate = useNavigate();
  const country = useParams().country ?? '';
  const phone = useParams().phone ?? '';
  const source = useParams().source ?? '';

  const location = useLocation();
  const sourceUrl = new URLSearchParams(location.search).get('url');

  const [messages, setMessages] = useState<Message[]>([]);

  const { error, get, loading, response } = useFetch(baseUrl, { cachePolicy: CachePolicies.NO_CACHE });
  const isFetching = useRef(false);

  const noMessages = response.ok && !messages.length;

  const getMessages = useCallback(
    async (refresh: boolean = false) => {
      if (noMessages) {
        return;
      }

      if (messages.length && !refresh) {
        return;
      }

      if (messages.length && refresh) {
        setMessages([]);
      }
      isFetching.current = true;
      const messagesResponse: PhoneMessagesResponse = await get(endpoints.phoneMessages(country, phone, source));
      isFetching.current = false;
      if (response.ok) {
        setMessages(messagesResponse?.results);
      }
    },
    [noMessages, messages, get, country, phone, source, response]
  );

  useEffect(() => {
    if (!country || !phone) {
      return;
    }
    getMessages();
  }, [country, phone, getMessages]);

  return (
    <>
      {error && <p>Error: {error?.message}</p>}
      <Flex justify="center" wrap="wrap" gap="large">
        <Button icon={<StepBackwardOutlined />} onClick={() => navigate(`/phones/${country}`)}>
          To Phone Numbers
        </Button>
        {messages.length ? (
          <Button icon={<RedoOutlined />} onClick={async () => await getMessages(true)}>
            Refresh
          </Button>
        ) : null}
        <Button icon={<StepForwardOutlined />} href={messages?.at(0)?.url ?? sourceUrl ?? ''} target="_blank">
          To {source}
        </Button>
      </Flex>
      <MessagesTable loading={isFetching.current || loading} messages={messages} />
    </>
  );
};

export default PhoneMessages;
