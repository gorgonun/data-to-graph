import React, { useEffect } from "react";
import { D2gLocale, i18nConfig } from "../../i18n";
import { useRouter } from "next/router";
import { languageDetector } from "@/helpers/languageDetector";

export const LanguageContext = React.createContext<{
  currentLocale: D2gLocale;
  locales: D2gLocale[];
  setLocale: ((newLocale: D2gLocale) => void) | undefined;
}>({
  currentLocale: i18nConfig.defaultLocale,
  locales: i18nConfig.locales,
  setLocale: undefined,
});

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [lang, setLang] = React.useState(i18nConfig.defaultLocale);
  const router = useRouter();

  const handleLocaleChange = (newLocale: D2gLocale) => {
    languageDetector.cache ? languageDetector.cache(newLocale) : {};
    setLang(newLocale);
  };

  useEffect(() => {
    const detectedLng = (
      i18nConfig.locales.includes(router.query.locale as D2gLocale)
        ? String(router.query.locale)
        : languageDetector.detect()
    ) as D2gLocale | undefined;

    setLang(detectedLng ?? i18nConfig.defaultLocale);
  }, [router.query.locale]);

  return (
    <LanguageContext.Provider
      value={{
        currentLocale: lang,
        locales: i18nConfig.locales,
        setLocale: handleLocaleChange,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => React.useContext(LanguageContext);
