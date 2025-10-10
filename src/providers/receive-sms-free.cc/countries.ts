import { Country } from '../providers.js';

export enum Countries {
  Finland = 'Finland',
  Sweden = 'Sweden',
  Netherlands = 'Netherlands',
  UK = 'UK',
  USA = 'USA',
  Terroruzzia = 'Russia',
  Belgium = 'Belgium',
  Slovenia = 'Slovenia'
}

export const countries = Object.keys(Countries) as Country[];
