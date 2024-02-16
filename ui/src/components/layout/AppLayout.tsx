import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import OutletTransaction from './OutletTransaction';
import AppMenu from '../AppMenu';
import { menuItems } from '../constants/menu';

const { Content } = Layout;

export const AppLayout: React.F = () => (
  <Layout className="app-layout-container">
    <Layout.Header
      style={{
        display: 'flex',
        color: 'white',
        gap: 50,
        justifyContent: 'start',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        width: '100%'
      }}
    >
      <AppMenu items={menuItems} />
    </Layout.Header>
    <Layout className="app">
      <Content className="app-layout-content-container">
        <OutletTransaction>
          <Outlet />
        </OutletTransaction>
      </Content>
      <Layout.Footer style={{ textAlign: 'center' }}>Oleksandr Shevtsov ©2023-2024</Layout.Footer>
    </Layout>
  </Layout>
);
export default AppLayout;
