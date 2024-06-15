import { Country } from '../providers.js';

export enum Countries {
  USA = 'United States',
  Canada = 'Canada',
  UK = 'United Kingdom',
  Denmark = 'Denmark',
  Philippines = 'Philippines',
  Spain = 'Spain',
  Ukraine = 'Ukraine',
  Israel = 'Israel',
  Mauritius = 'Mauritius',
  India = 'India',
  Croatia = 'Croatia',
  Mexico = 'Mexico',
  Thailand = 'Thailand',
  Morocco = 'Morocco',
  Bulgaria = 'Bulgaria',
  Portugal = 'Portugal',
  Brazil = 'Brazil',
  Nigeria = 'Nigeria'
}

export const countries = Object.keys(Countries) as Country[];
