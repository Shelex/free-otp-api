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
  Portugal = 'Portugal',
  Thailand = 'Thailand',
  Morocco = 'Morocco',
  Mexico = 'Mexico',
  Bulgaria = 'Bulgaria',
  Brazil = 'Brazil',
  Nigeria = 'Nigeria'
}

export const countries = Object.keys(Countries) as Country[];
