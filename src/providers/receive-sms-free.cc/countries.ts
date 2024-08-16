import { Country } from '../providers.js';

export enum Countries {
  Finland = 'Finland',
  Netherlands = 'Netherlands',
  Sweden = 'Sweden',
  USA = 'USA',
  Terroruzzia = 'Russia',
  Poland = 'Poland',
  Estonia = 'Estonia',
  Latvia = 'Latvia',
  Belgium = 'Belgium',
  Philippines = 'Philippines',
  Spain = 'Spain',
  Portugal = 'Portugal',
  Indonesia = 'Indonesia',
  Malaysia = 'Malaysia'
  //Ukraine = 'Ukraine',
  //Morocco = 'Morocco'
  //Germany = 'Germany',
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
  //Moldova = 'Moldova',
  //TimorLeste = 'TimorLeste'
}

export const countries = Object.keys(Countries) as Country[];
