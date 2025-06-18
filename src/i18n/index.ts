import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { init, InitOptions } from 'i18next';

// Define supported languages
export const SUPPORTED_LANGUAGES = ['en', 'sw', 'fr'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Define namespaces
export const NAMESPACES = ['common', 'categories'] as const;
export type Namespace = typeof NAMESPACES[number];

// Initialize i18n with empty language
i18n
  .use(initReactI18next)
  .init({
    lng: '', // Start with empty language
    fallbackLng: false, // Don't use fallback until we have a language
    debug: false, // Disable debug logs
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
    defaultNS: 'common',
    react: {
      useSuspense: false, // Disable suspense while we handle initialization
      wait: true, // Wait for translations to load
      nsMode: 'fallback'
    },
    missingKeyHandler: (lngs, ns, key, fallbackValue) => {
      // Return empty string for missing keys during initialization
      return '';
    },
    saveMissing: true,
    load: 'languageOnly',
    detection: {
      order: ['localStorage'], // Only use localStorage
      caches: ['localStorage']
    }
  } as InitOptions);

// Get initial language from localStorage on server
export function getInitialLanguage() {
  // Return empty string on server side since we can't access localStorage
  return '';
}

// Initialize i18n with saved language on server
if (typeof window === 'undefined') {
  const initialLang = getInitialLanguage();
  i18n.changeLanguage(initialLang);
}

// Get current language from localStorage or default to English
export function getCurrentLanguage(): string {
  const lang = localStorage.getItem('language');
  if (lang && SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
    return lang;
  }
  // If no language is set, try to get from localStorage or fallback to 'en'
  const savedLang = localStorage.getItem('i18nextLng');
  if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang as SupportedLanguage)) {
    return savedLang;
  }
  return '';
}

// Set current language and persist it
export function setCurrentLanguage(lang: string) {
  if (SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
    localStorage.setItem('language', lang);
    localStorage.setItem('i18nextLng', lang); // Also set i18next's internal storage
    i18n.changeLanguage(lang);
  } else if (lang === '') {
    // If language is empty, try to get from localStorage or fallback to 'en'
    const storedLang = localStorage.getItem('language');
    if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang as SupportedLanguage)) {
      i18n.changeLanguage(storedLang);
    } else {
      i18n.changeLanguage('en');
    }
  }
};

// Initialize language on client side
export function initClientLanguage() {
  // Language initialization is handled by i18next's detection
  // We only need to ensure the language is properly set in localStorage
  const lang = getCurrentLanguage();
  if (lang && SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
    localStorage.setItem('i18nextLng', lang);
  }
}

// Export the i18n instance
export { i18n };

// Don't initialize i18n on client side until LanguageInitializer component mounts
// This prevents hydration mismatches by ensuring language is set after server render
if (typeof window !== 'undefined') {
  // Do nothing - language will be initialized by LanguageInitializer component
}
