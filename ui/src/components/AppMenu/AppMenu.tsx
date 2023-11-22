import React from 'react';
import { GithubOutlined } from '@ant-design/icons';
import { Menu, MenuProps, Button, Flex } from 'antd';

const AppMenu: React.FC<MenuProps> = ({ items, ...props }) => (
  <Flex align="center">
    <Menu theme="dark" selectable={false} mode="horizontal" style={{ width: '100%' }} {...props} items={items} />
    <Button
      style={{ flexShrink: 'inherit' }}
      icon={<GithubOutlined />}
      href="https://github.com/Shelex/free-otp-api"
      target="_blank"
    >
      Github
    </Button>
  </Flex>
);

export default AppMenu;
