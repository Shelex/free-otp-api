import { Country } from '../providers.js';

export enum Countries {
  USA = 'united-states',
  UK = 'united-kingdom',
  Georgia = 'georgia',
  //Ukraine = 'ukraine',
  Germany = 'germany'
}

export const countries = Object.keys(Countries) as Country[];
