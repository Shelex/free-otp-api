const host = process.env.REACT_APP_API_HOST;
const protocol = process.env.REACT_APP_API_PROTOCOL;
export const root = `${protocol}://${host}`;
export const baseUrl = `${root}/api`;

export const endpoints = {
  countriesList: '/countries',
  countryPhones: (country: string) => `/list/${country}`,
  phoneMessages: (country: string, phone: string, source: string) => `/${country}/${phone}?since=1&source=${source}`
};
