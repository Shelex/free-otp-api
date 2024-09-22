import { Country } from '../providers.js';

export enum Countries {
  USA = 'united-states',
  UK = 'united-kingdom',
  Georgia = 'georgia',
  //Ukraine = 'ukraine',
  Germany = 'germany',
  // Terroruzzia = 'russia',
  Netherlands = 'netherlands',
  Spain = 'spain'
}

export const countries = Object.keys(Countries) as Country[];
