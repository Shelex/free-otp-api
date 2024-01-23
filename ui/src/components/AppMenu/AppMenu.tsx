import React from 'react';
import { Menu, MenuProps } from 'antd';

const AppMenu: React.FC<MenuProps> = ({ items, ...props }) => (
    <Menu theme="dark" selectable={false} mode="horizontal" {...props} items={items} />
);

export default AppMenu;
