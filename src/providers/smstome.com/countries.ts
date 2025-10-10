import { Country } from '../providers.js';

export enum Countries {
  Slovenia = 'slovenia',
  Sweden = 'sweden',
  Finland = 'finland',
  Belgium = 'belgium',
  Netherlands = 'netherlands'
  // USA = 'usa',
  // Canada = 'canada',
  //UK = 'united-kingdom',
  //France = 'france',
  //Denmark = 'denmark',
}

export const countries = Object.keys(Countries) as Country[];
