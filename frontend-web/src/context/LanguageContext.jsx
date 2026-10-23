import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export const STORAGE_KEY_LANG = 'spct_language';

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_LANG) || 'id';
  });

  const setLanguage = useCallback((newLang) => {
    if (newLang !== 'id' && newLang !== 'en') return;
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY_LANG, newLang);
    // Dispatch custom event to notify any listeners
    window.dispatchEvent(new Event('spct_language_change'));
  }, []);

  // Listen to storage changes across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY_LANG && (e.newValue === 'id' || e.newValue === 'en')) {
        setLangState(e.newValue);
      }
    };
    const handleCustomChange = () => {
      const stored = localStorage.getItem(STORAGE_KEY_LANG);
      if (stored && (stored === 'id' || stored === 'en')) {
        setLangState(stored);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('spct_language_change', handleCustomChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('spct_language_change', handleCustomChange);
    };
  }, []);

  // Translation helper function
  const t = useCallback((key, fallback) => {
    const currentDict = translations[lang] || translations.id;
    if (currentDict && currentDict[key] !== undefined) {
      return currentDict[key];
    }
    const defaultDict = translations.id;
    if (defaultDict && defaultDict[key] !== undefined) {
      return defaultDict[key];
    }
    return fallback !== undefined ? fallback : key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback if used outside provider
    const fallbackLang = localStorage.getItem(STORAGE_KEY_LANG) || 'id';
    return {
      lang: fallbackLang,
      setLanguage: () => {},
      t: (key, fallback) => {
        const dict = translations[fallbackLang] || translations.id;
        return dict?.[key] ?? (fallback ?? key);
      }
    };
  }
  return context;
}
