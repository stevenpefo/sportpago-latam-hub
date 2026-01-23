import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Language, getTranslations, detectBrowserLanguage, t as translate } from '@/i18n';

const LANGUAGE_STORAGE_KEY = 'sportpago-language';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: ReturnType<typeof getTranslations>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored && ['es', 'en', 'fr', 'pt'].includes(stored)) {
        return stored as Language;
      }
    } catch {
      // localStorage might not be available
    }
    return detectBrowserLanguage();
  });

  const translations = useMemo(() => getTranslations(language), [language]);

  const setLanguage = useCallback((newLanguage: Language) => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
    } catch {
      // localStorage might not be available
    }
    setLanguageState(newLanguage);
  }, []);

  const t = useCallback((key: string) => translate(translations, key), [translations]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    translations,
    t,
  }), [language, setLanguage, translations, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
