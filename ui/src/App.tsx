import React from 'react';
import { ConfigProvider } from 'antd';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/Router';

const App: React.FC = () => (
  <React.StrictMode>
    <div className="App">
      <BrowserRouter basename={'/'}>
        <ConfigProvider
          theme={{
            components: {
              Card: {
                headerHeight: 16
              }
            }
          }}
        >
          <AppRoutes />
        </ConfigProvider>
      </BrowserRouter>
    </div>
  </React.StrictMode>
);

export default App;
