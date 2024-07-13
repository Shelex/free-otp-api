import { Country } from '../providers.js';

export enum Countries {
  Finland = 'Finland',
  Netherlands = 'Netherlands',
  Sweden = 'Sweden',
  USA = 'USA',
  Terroruzzia = 'Russia',
  Germany = 'Germany',
  Belgium = 'Belgium',
  Poland = 'Poland',
  Philippines = 'Philippines',
  Spain = 'Spain',
  Ukraine = 'Ukraine',
  Portugal = 'Portugal',
  Estonia = 'Estonia',
  Latvia = 'Latvia',
  Malaysia = 'Malaysia',
  Morocco = 'Morocco'
  //Canada = 'Canada',
  //UK = 'UK',
  //France = 'France',
  //Austria = 'Austria',
  //China = 'China',
  //Romania = 'Romania',
  //Switzerland = 'Switzerland',
  //Croatia = 'Croatia',
  //Mexico = 'Mexico',
  //HongKong = 'HongKong',
  //Myanmar = 'Myanmar',
  //Italy = 'Italy',
  //Denmark = 'Denmark',
  //Israel = 'Israel',
  //Kazakhstan = 'Kazakhstan',
  //India = 'India',
  //CzechRepublic = 'CzechRepublic',
  //SouthAfrica = 'SouthAfrica',
  //Macao = 'Macao',
  //Indonesia = 'Indonesia',
  //Japan = 'Japan',
  //SouthKorea = 'Korea',
  //Serbia = 'Serbia',
  //Nigeria = 'Nigeria',
  //Australia = 'Australia',
  //Norway = 'Norway',
  //Vietnam = 'Vietnam'
  //NewZealand = 'NewZealand',
  //Thailand = 'Thailand'
  //Ireland = 'Ireland',
  //Moldova = 'Moldova',
  //TimorLeste = 'TimorLeste'
}

export const countries = Object.keys(Countries) as Country[];
