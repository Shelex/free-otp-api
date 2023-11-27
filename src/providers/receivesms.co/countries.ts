import { Country } from '../providers.js';

export enum Countries {
  //Canada = 'canadian-phone-numbers/ca'
  // Germany = 'german-phone-numbers/de',
  // Spain = 'spanish-phone-numbers/es',
  // UK = 'uk-phone-numbers/gb',
  // Georgia = 'georgian-phone-numbers/ge',
  // HongKong = 'hong-kong-phone-numbers/hk',
  // Indonesia = 'indonesian-phone-numbers/id',
  // Kenya = 'kenyan-phone-numbers/ke',
  // Kazakhstan = 'kazakhstani-phone-numbers/kz',
  // Mauritius = 'mauritian-phone-numbers/mu',
  // Mexico = 'mexican-phone-numbers/mx',
  // Netherlands = 'dutch-phone-numbers/nl',
  // PuertoRico = 'puerto-rican-phone-numbers/pr',
  // Romania = 'romanian-phone-numbers/ro',
  // Sweden = 'swedish-phone-numbers/se',
  // Thailand = 'thai-phone-numbers/th',
  USA = 'us-phone-numbers/us'
  // Uzbekistan = 'uzbek-phone-numbers/uz'
}

export const countries = Object.keys(Countries) as Country[];
