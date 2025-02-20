import { Country } from '../providers.js';

export enum Countries {
  Finland = 'Finland',
  Sweden = 'Sweden',
  Netherlands = 'Netherlands',
  UK = 'UK',
  USA = 'USA',
  Terroruzzia = 'Russia',
  Belgium = 'Belgium',
  Spain = 'Spain',
  Germany = 'Germany',
  Austria = 'Austria',
  Poland = 'Poland',
  Ukraine = 'Ukraine',
  Portugal = 'Portugal',
  Estonia = 'Estonia',
  Italy = 'Italy',
  Latvia = 'Latvia',
  Ireland = 'Ireland',
  Moldova = 'Moldova'
  //Philippines = 'Philippines',
  //Croatia = 'Croatia',
  //Kazakhstan = 'Kazakhstan',
  //Indonesia = 'Indonesia',
  //Malaysia = 'Malaysia',
  //Morocco = 'Morocco'
  //Poland = 'Poland',
  //Canada = 'Canada',
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
