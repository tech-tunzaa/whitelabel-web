"use client"

import { useEffect, useState } from "react";
import { initClientLanguage } from "@/src/i18n";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "@/src/i18n";
import { i18n } from "@/src/i18n";

export function LanguageInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize language on mount
    const currentLang = localStorage.getItem('language') || localStorage.getItem('i18nextLng');
    
    // Only set language if we have a valid value from localStorage
    if (currentLang && SUPPORTED_LANGUAGES.includes(currentLang as SupportedLanguage)) {
      i18n.changeLanguage(currentLang);
    } else {
      // If no valid language in localStorage, default to English
      i18n.changeLanguage('en');
      localStorage.setItem('language', 'en');
      localStorage.setItem('i18nextLng', 'en');
    }

    // Listen for language changes
    const onLanguageChanged = (lng: string) => {
      if (SUPPORTED_LANGUAGES.includes(lng as SupportedLanguage)) {
        localStorage.setItem('language', lng);
      }
    };

    i18n.on('languageChanged', onLanguageChanged);

    // Mark as initialized after a short delay to ensure proper hydration
    setTimeout(() => setIsInitialized(true), 100);

    // Cleanup
    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, []);

  return <>{children}</>; // Always render children to maintain hydration
}
