import React from 'react';
import { GithubOutlined } from '@ant-design/icons';
import { Col, Menu, MenuProps, Row, Button } from 'antd';

const AppMenu: React.FC<MenuProps> = ({ items, ...props }) => (
  <Row style={{ width: '100%' }}>
    <Col span={22}>
      <Menu theme="dark" selectable={false} mode="horizontal" style={{ width: '100%' }} {...props} items={items} />
    </Col>
    <Col span={2}>
      <Button icon={<GithubOutlined />} href="https://github.com/Shelex/free-otp-api" target="_blank">
        Github
      </Button>
    </Col>
  </Row>
);

export default AppMenu;
