import { Route, Routes } from 'react-router-dom';
import routes from './routes';
import NotFound from '../pages/404';
import AppLayout from '../components/layout/AppLayout';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {routes.map((route) => (
          <Route key={route.name} path={route.path} element={<route.component />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
