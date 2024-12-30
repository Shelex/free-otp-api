import { Country } from '../providers.js';

export enum Countries {
  Finland = 'Finland',
  Netherlands = 'Netherlands',
  Sweden = 'Sweden',
  USA = 'USA',
  Terroruzzia = 'Russia',
  Croatia = 'Croatia',
  Spain = 'Spain',
  // Germany = 'Germany',
  Belgium = 'Belgium',
  Austria = 'Austria',
  Poland = 'Poland',
  Portugal = 'Portugal',
  Philippines = 'Philippines',
  Ukraine = 'Ukraine',
  Estonia = 'Estonia',
  Italy = 'Italy',
  Latvia = 'Latvia',
  Kazakhstan = 'Kazakhstan',
  Indonesia = 'Indonesia',
  Malaysia = 'Malaysia',
  Ireland = 'Ireland',
  Moldova = 'Moldova'
  //Morocco = 'Morocco'
  //Poland = 'Poland',
  //Canada = 'Canada',
  //UK = 'UK',
  //France = 'France',
  //Austria = 'Austria',
  //China = 'China',
  //Romania = 'Romania',
  //Switzerland = 'Switzerland',
  //Mexico = 'Mexico',
  //HongKong = 'HongKong',
  //Myanmar = 'Myanmar',
  //Denmark = 'Denmark',
  //Israel = 'Israel',
  //India = 'India',
  //CzechRepublic = 'CzechRepublic',
  //SouthAfrica = 'SouthAfrica',
  //Macao = 'Macao',
  //Japan = 'Japan',
  //SouthKorea = 'Korea',
  //Serbia = 'Serbia',
  //Nigeria = 'Nigeria',
  //Australia = 'Australia',
  //Norway = 'Norway',
  //Vietnam = 'Vietnam'
  //NewZealand = 'NewZealand',
  //Thailand = 'Thailand'
  //TimorLeste = 'TimorLeste'
}

export const countries = Object.keys(Countries) as Country[];
