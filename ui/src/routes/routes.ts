import countries from '../pages/countries';
import PhoneNumbers from '../pages/phones';
import PhoneMessages from '../pages/phone-messages';
import { HomeOutlined, PhoneOutlined, MessageOutlined } from '@ant-design/icons';

const routes = [
  { name: 'otp.shelex.dev', path: '/', component: countries, icon: HomeOutlined },
  { name: 'phones', path: '/phones/:country', component: PhoneNumbers, icon: PhoneOutlined },
  { name: 'messages', path: '/messages/:country/:source/:phone', component: PhoneMessages, icon: MessageOutlined }
];

export default routes;
