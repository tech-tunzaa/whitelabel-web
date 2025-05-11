export const COUNTRIES = [
  {
    code: 'TZ',
    name: 'Tanzania',
    currency: 'TZS',
    currencySymbol: 'TSh',
  },
  {
    code: 'KE',
    name: 'Kenya',
    currency: 'KES',
    currencySymbol: 'KSh',
  },
  {
    code: 'UG',
    name: 'Uganda',
    currency: 'UGX',
    currencySymbol: 'USh',
  },
];

export const COUNTRY_CODES = COUNTRIES.map((country) => country.code);

export const CURRENCY_CODES = COUNTRIES.map((country) => country.currency);

export const DEFAULT_COUNTRY = 'TZ';
export const DEFAULT_CURRENCY = 'TZS';
