"use client"

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { i18n, SUPPORTED_LANGUAGES, SupportedLanguage } from './core';

export function I18nClientInit({ children }: { children: React.ReactNode }) {
  const { ready } = useTranslation();

  useEffect(() => {
    initClientLanguage();
  }, []);

  return ready ? <>{children}</> : null;
}

// Get current language from localStorage or default to English
export const getCurrentLanguage = (): string => {
  const savedLang = typeof window !== 'undefined' 
    ? localStorage.getItem('i18nextLng') 
    : undefined;
  
  if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang as SupportedLanguage)) {
    return savedLang;
  }
  return 'en';
};

// Set current language and persist it
export const setCurrentLanguage = (lang: string) => {
  if (SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', lang);
    }
    i18n.changeLanguage(lang);
  }
};

// Initialize language on client side
export function initClientLanguage() {
  if (typeof window !== 'undefined') {
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang as SupportedLanguage)) {
      i18n.changeLanguage(savedLang);
    }
  }
}
