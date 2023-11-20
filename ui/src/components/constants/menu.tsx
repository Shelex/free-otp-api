import { NavLink } from 'react-router-dom';
import routes from '../../routes/routes';

export const menuItems = routes
  .filter((route) => route.path === '/')
  .map((route) => ({
    key: route.name,
    path: {
      path: route.path
    },
    label: <NavLink to={route.path}>{route.name}</NavLink>,
    icon: <route.icon />
  }));
