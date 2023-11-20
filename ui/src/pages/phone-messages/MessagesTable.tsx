import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Message } from '../../types';

const columns: ColumnsType<Message> = [
  {
    title: 'Time',
    dataIndex: 'agoText',
    width: '20%',
    sorter: (a, b) => a.ago - b.ago,
    defaultSortOrder: 'descend'
  },
  {
    title: 'Message',
    dataIndex: 'message',
    width: '80%'
  }
];

interface Props {
  messages?: Message[];
  loading?: boolean;
}

const MessagesTable: React.FC<Props> = ({ messages, loading }) => (
  <Table loading={loading} columns={columns} dataSource={messages} pagination={{ pageSize: 100 }} />
);

export default MessagesTable;
