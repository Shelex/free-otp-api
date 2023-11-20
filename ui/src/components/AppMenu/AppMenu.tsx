import React from 'react';

import { Menu, MenuProps } from 'antd';

const AppMenu: React.FC<MenuProps> = ({ items, ...props }) => (
  <Menu theme="dark" mode="horizontal" style={{ width: '100%' }} {...props} items={items} />
);

export default AppMenu;
