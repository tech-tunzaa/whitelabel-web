import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Define supported languages
export const SUPPORTED_LANGUAGES = ['en', 'sw', 'fr'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Define namespaces
export const NAMESPACES = ['common', 'categories'] as const;
export type Namespace = typeof NAMESPACES[number];

// Initialize i18n with default language
i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        common: require('./locales/en/common.json'),
        categories: require('./locales/en/categories.json')
      },
      sw: {
        common: require('./locales/sw/common.json'),
        categories: require('./locales/sw/categories.json')
      },
      fr: {
        common: require('./locales/fr/common.json'),
        categories: require('./locales/fr/categories.json')
      }
    },
    ns: NAMESPACES,
    defaultNS: 'common'
  });

// Export the i18n instance
export { i18n };
