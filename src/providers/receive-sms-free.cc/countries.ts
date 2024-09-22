import { Country } from '../providers.js';

export enum Countries {
  Finland = 'Finland',
  Netherlands = 'Netherlands',
  Sweden = 'Sweden',
  USA = 'USA',
  Terroruzzia = 'Russia',
  Spain = 'Spain',
  Germany = 'Germany',
  Belgium = 'Belgium',
  Austria = 'Austria',
  Poland = 'Poland',
  Portugal = 'Portugal',
  Latvia = 'Latvia',
  Indonesia = 'Indonesia',
  Malaysia = 'Malaysia',
  Moldova = 'Moldova'
  //Estonia = 'Estonia',
  //Philippines = 'Philippines',
  //Ukraine = 'Ukraine',
  //Morocco = 'Morocco'
  //Poland = 'Poland',
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
  //TimorLeste = 'TimorLeste'
}

export const countries = Object.keys(Countries) as Country[];
