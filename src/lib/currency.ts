export const countryCurrencyMap: Record<string, { symbol: string; code: string }> = {
  US: { symbol: '$', code: 'USD' },
  GB: { symbol: '£', code: 'GBP' },
  CA: { symbol: '$', code: 'CAD' },
  AU: { symbol: '$', code: 'AUD' },
  NZ: { symbol: '$', code: 'NZD' },
  EU: { symbol: '€', code: 'EUR' },
  DE: { symbol: '€', code: 'EUR' },
  FR: { symbol: '€', code: 'EUR' },
  ES: { symbol: '€', code: 'EUR' },
  IT: { symbol: '€', code: 'EUR' },
  JP: { symbol: '¥', code: 'JPY' },
  CN: { symbol: '¥', code: 'CNY' },
  IN: { symbol: '₹', code: 'INR' },
  BR: { symbol: 'R$', code: 'BRL' },
  MX: { symbol: '$', code: 'MXN' },
  ZA: { symbol: 'R', code: 'ZAR' },
  KR: { symbol: '₩', code: 'KRW' },
  SG: { symbol: '$', code: 'SGD' },
  CH: { symbol: 'CHF', code: 'CHF' },
  SE: { symbol: 'kr', code: 'SEK' },
  NO: { symbol: 'kr', code: 'NOK' },
  DK: { symbol: 'kr', code: 'DKK' },
  PL: { symbol: 'zł', code: 'PLN' },
  TR: { symbol: '₺', code: 'TRY' },
  RU: { symbol: '₽', code: 'RUB' },
  AE: { symbol: 'د.إ', code: 'AED' },
  SA: { symbol: '﷼', code: 'SAR' },
};

export const getCurrencySymbol = (countryCode: string): string => {
  return countryCurrencyMap[countryCode]?.symbol || '$';
};
