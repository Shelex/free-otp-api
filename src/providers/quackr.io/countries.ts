import { Country } from '../providers.js';

export enum Countries {
  Australia = 'australia',
  Austria = 'austria',
  Belgium = 'belgium',
  Brazil = 'brazil',
  //Canada = 'canada',
  China = 'china',
  //Denmark = 'denmark',
  Finland = 'finland',
  France = 'france',
  Germany = 'germany',
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
  SouthAfrica = 'south-africa',
  Spain = 'spain',
  Sweden = 'sweden',
  Switzerland = 'switzerland',
  Thailand = 'thailand',
  Ukraine = 'ukraine',
  UK = 'united-kingdom',
  USA = 'united-states'
}

export const countries = Object.keys(Countries) as Country[];
