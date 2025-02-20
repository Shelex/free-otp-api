import { Country } from '../providers.js';

export enum Countries {
  USA = 'United States',
  Canada = 'Canada',
  // Lithuania = 'Lithuania',
  UK = 'United Kingdom',
  // Denmark = 'Denmark',
  // Philippines = 'Philippines',
  // HongKong = 'Hong Kong',
  Spain = 'Spain',
  // Ukraine = 'Ukraine',
  Israel = 'Israel',
  Mauritius = 'Mauritius',
  India = 'India',
  Croatia = 'Croatia',
  Serbia = 'Serbia',
  // Morocco = 'Morocco',
  Mexico = 'Mexico',
  Portugal = 'Portugal',
  // Thailand = 'Thailand',
  //Bulgaria = 'Bulgaria',
  Brazil = 'Brazil',
  Nigeria = 'Nigeria'
}

export const countries = Object.keys(Countries) as Country[];
