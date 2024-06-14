import { Country } from '../providers.js';

export enum Countries {
  USA = 'usa',
  Canada = 'canada',
  //UK = 'united-kingdom',
  //France = 'france',
  Sweden = 'sweden',
  Finland = 'finland',
  //Denmark = 'denmark',
  Belgium = 'belgium',
  Netherlands = 'netherlands'
}

export const countries = Object.keys(Countries) as Country[];
