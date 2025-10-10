import { Country } from '../providers.js';

export enum Countries {
  USA = 'United States',
  Canada = 'Canada',
  Germany = 'Germany',
  UK = 'United Kingdom',
  Netherlands = 'Netherlands',
  Spain = 'Spain',
  Ukraine = 'Ukraine',
  Israel = 'Israel',
  India = 'India',
  Croatia = 'Croatia',
  Mexico = 'Mexico',
  Portugal = 'Portugal',
  Brazil = 'Brazil',
  Nigeria = 'Nigeria'
}

export const countries = Object.keys(Countries) as Country[];
