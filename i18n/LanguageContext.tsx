import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, translations, Translations } from './translations';

interface LanguageContextType {
  lang: Language;
  t: Translations;
  toggleLanguage: () => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ar',
  t: translations.ar,
  toggleLanguage: () => {},
  isRTL: true,
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('ar');

  const toggleLanguage = () => {
    setLang(prev => {
      const next = prev === 'ar' ? 'en' : 'ar';
      document.documentElement.lang = next;
      document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
      return next;
    });
  };

  return (
    <LanguageContext.Provider value={{
      lang,
      t: translations[lang],
      toggleLanguage,
      isRTL: lang === 'ar',
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
