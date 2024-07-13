import { Country } from '../providers.js';

export enum Countries {
  USA = 'united-states',
  UK = 'united-kingdom',
  Ukraine = 'ukraine',
  Germany = 'germany',
  Australia = 'australia',
  Austria = 'austria',
  Belgium = 'belgium',
  Brazil = 'brazil',
  //Canada = 'canada',
  China = 'china',
  //Denmark = 'denmark',
  Finland = 'finland',
  France = 'france',
  Hungary = 'hungary',
  India = 'india',
  Indonesia = 'indonesia',
  // Ireland = 'ireland',
  Israel = 'israel',
  //Italy = 'italy',
  SouthKorea = 'korea',
  Latvia = 'latvia',
  Mexico = 'mexico',
  Morocco = 'morocco',
  Netherlands = 'netherlands',
  //Norway = 'norway',
  Pakistan = 'pakistan',
  Poland = 'poland',
  Terroruzzia = 'russia',
  Thailand = 'thailand',
  SouthAfrica = 'south-africa',
  Spain = 'spain',
  Sweden = 'sweden',
  Switzerland = 'switzerland'
}

export const countries = Object.keys(Countries) as Country[];
