import { Country } from '../providers.js';

export enum Countries {
  //Canada = 'Canada',
  USA = 'United-States',
  //UK = 'United-Kingdom',
  //Poland = 'Poland',
  PuertoRico = 'Puerto-Rico',
  //France = 'France',
  //Lithuania = 'Lithuania',
  //Estonia = 'Estonia',
  //Netherlands = 'Netherlands',
  Belgium = 'Belgium',
  //Sweden = 'Sweden',
  //Australia = 'Australia',
  //TimorLeste = 'Timor-Leste',
  //Finland = 'Finland',
  //Denmark = 'Denmark',
  Spain = 'Spain',
  Ukraine = 'Ukraine',
  Romania = 'Romania',
  Morocco = 'Morocco',
  Bulgaria = 'Bulgaria',
  Ireland = 'Ireland',
  //Italy = 'Italy',
  CzechRepublic = 'Czech',
  Philippines = 'Philippines',
  Germany = 'Germany',
  Indonesia = 'Indonesia',
  Kazakhstan = 'Kazakhstan',
  Malaysia = 'Malaysia',
  //HongKong = 'Hong-Kong',
  Austria = 'Austria',
  Latvia = 'Latvia',
  Portugal = 'Portugal'
}

export const countries = Object.keys(Countries) as Country[];
