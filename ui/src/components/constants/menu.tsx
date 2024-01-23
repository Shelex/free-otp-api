import { NavLink } from 'react-router-dom';
import { Typography } from 'antd';
import { GithubOutlined, ExperimentOutlined } from '@ant-design/icons';
import routes from '../../routes/routes';


const githubRepoUrl = "https://github.com/Shelex/free-otp-api";
const swaggerUrl = "https://otp.shelex.dev/docs";

const externalRoutes = [
  {
    key: 'github',
    path: {
      path: githubRepoUrl
    },
    label: <Typography.Link href={githubRepoUrl} target="_blank">Github</Typography.Link>,
    icon: <GithubOutlined />
  },
  {
    key: 'swagger',
    path: {
      path: swaggerUrl
    },
    label: <Typography.Link href={swaggerUrl} target="_blank">Swagger</Typography.Link>,
    icon: <ExperimentOutlined />
  }
];

export const menuItems = routes
  .filter((route) => route.path === '/')
  .map((route) => ({
    key: route.name,
    path: {
      path: route.path
    },
    label: <NavLink to={route.path}>{route.name}</NavLink>,
    icon: <route.icon />
  })).concat(externalRoutes);
