import { useState, useEffect, useCallback, useMemo } from 'react';
import { Language, getTranslations, detectBrowserLanguage, t as translate } from '@/i18n';

const LANGUAGE_STORAGE_KEY = 'sportpago-language';

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(() => {
    // Check localStorage first
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && ['es', 'en', 'fr', 'pt'].includes(stored)) {
      return stored as Language;
    }
    // Otherwise detect from browser
    return detectBrowserLanguage();
  });

  const translations = useMemo(() => getTranslations(language), [language]);

  const setLanguage = useCallback((newLanguage: Language) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
    setLanguageState(newLanguage);
  }, []);

  const t = useCallback((key: string) => translate(translations, key), [translations]);

  useEffect(() => {
    // Update document lang attribute
    document.documentElement.lang = language;
  }, [language]);

  return {
    language,
    setLanguage,
    translations,
    t,
  };
}
