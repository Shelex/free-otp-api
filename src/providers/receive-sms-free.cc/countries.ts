import { Country } from '../providers.js';

export enum Countries {
  USA = 'USA',
  UK = 'UK',
  //Australia = 'Australia',
  //Austria = 'Austria',
  Belgium = 'Belgium',
  //Canada = 'Canada',
  //China = 'China',
  //Croatia = 'Croatia',
  //CzechRepublic = 'CzechRepublic',
  Denmark = 'Denmark',
  Estonia = 'Estonia',
  Finland = 'Finland',
  France = 'France',
  //Germany = 'Germany',
  //HongKong = 'HongKong',
  //India = 'India',
  //Indonesia = 'Indonesia',
  //Ireland = 'Ireland',
  //Israel = 'Israel',
  //Italy = 'Italy',
  //Japan = 'Japan',
  //Kazakhstan = 'Kazakhstan',
  //SouthKorea = 'Korea',
  //Latvia = 'Latvia',
  //Macao = 'Macao',
  //Malaysia = 'Malaysia',
  //Mexico = 'Mexico',
  //Moldova = 'Moldova',
  //Morocco = 'Morocco',
  //Myanmar = 'Myanmar',
  Netherlands = 'Netherlands',
  //NewZealand = 'NewZealand',
  //Nigeria = 'Nigeria',
  //Norway = 'Norway',
  //Philippines = 'Philippines',
  //Poland = 'Poland',
  //Portugal = 'Portugal',
  Romania = 'Romania',
  //Terroruzzia = 'Russia',
  //Serbia = 'Serbia',
  //SouthAfrica = 'SouthAfrica',
  Spain = 'Spain',
  Sweden = 'Sweden',
  //Switzerland = 'Switzerland',
  //Thailand = 'Thailand',
  //TimorLeste = 'TimorLeste',
  Ukraine = 'Ukraine'
  //Vietnam = 'Vietnam'
}

export const countries = Object.keys(Countries) as Country[];
