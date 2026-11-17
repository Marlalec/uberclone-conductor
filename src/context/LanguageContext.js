import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LANGUAGE, LOCALES, translate } from '../i18n';
import { getLanguage, saveLanguage } from '../services/storageService';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    getLanguage().then((stored) => {
      if (LOCALES[stored]) {
        setLanguage(stored);
      }
    });
  }, []);

  const changeLanguage = useCallback(async (nextLanguage) => {
    if (!LOCALES[nextLanguage]) {
      return;
    }
    setLanguage(nextLanguage);
    await saveLanguage(nextLanguage);
  }, []);

  const value = useMemo(
    () => ({
      language,
      locale: LOCALES[language],
      changeLanguage,
      t: (message, params) => translate(language, message, params),
    }),
    [language, changeLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
