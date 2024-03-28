import { Country } from '../providers.js';

export enum Countries {
  Australia = 'au',
  //Azerbaijan = 'az',
  Belgium = 'be',
  Canada = 'caicc',
  UK = 'gb',
  Libya = 'ly',
  Morocco = 'ma',
  Poland = 'pl',
  //TimorLeste = 'tl',
  USA = 'usicc'
  //Zimbabwe = 'zw'
}

export const countries = Object.keys(Countries) as Country[];
