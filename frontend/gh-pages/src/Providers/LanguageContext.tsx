import React, { useEffect } from "react";
import { D2gLocale, i18nConfig } from "../../i18n";
import { useRouter } from "next/router";
import { languageDetector } from "@/helpers/languageDetector";

export const LanguageContext = React.createContext<{
  currentLocale: D2gLocale;
  availableLocales: D2gLocale[];
  globalLocales: D2gLocale[];
  setLocale: ((newLocale: D2gLocale) => void) | undefined;
  setAvailableLocales: ((newLocales: D2gLocale[]) => void) | undefined;
}>({
  currentLocale: i18nConfig.defaultLocale,
  availableLocales: i18nConfig.locales,
  globalLocales: i18nConfig.locales,
  setLocale: undefined,
  setAvailableLocales: undefined,
});

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [lang, setLang] = React.useState<null | D2gLocale>(null);
  const [availableLocales, setAvailableLocales] = React.useState(
    i18nConfig.locales
  );
  const router = useRouter();

  const handleLocaleChange = (newLocale: D2gLocale) => {
    languageDetector.cache ? languageDetector.cache(newLocale) : {};
    setLang(newLocale);
  };

  useEffect(() => {
    if (!router.isReady) return;

    const {
      query: { locale },
    } = router;
    
    const stringLocale = typeof locale === "string" ? locale : null;

    if (!(stringLocale === lang) && lang) {
      router.replace(
        {
          pathname: router.pathname,
          query: { locale: lang },
        },
        undefined,
        { locale: lang ?? i18nConfig.defaultLocale }
      );
    }
  }, [lang]);

  useEffect(() => {
    const detectedLng = (
      i18nConfig.locales.includes(router.query.locale as D2gLocale)
        ? String(router.query.locale)
        : languageDetector.detect()
    ) as D2gLocale | undefined;

    setLang(detectedLng ?? i18nConfig.defaultLocale);
  }, []);

  useEffect(() => {
    if (!router.isReady) return;

    const {
      query: { locale },
    } = router;

    if (typeof locale === "string") {
      if (locale !== lang && i18nConfig.locales.includes(locale as D2gLocale)) {
        setLang(locale as D2gLocale);
      } else if (!i18nConfig.locales.includes(locale as D2gLocale)) {
        router.replace({ pathname: router.pathname, query: { locale: lang } }, undefined, { locale: lang ?? i18nConfig.defaultLocale });
      }
    }  
  }, [router])

  return (
    <LanguageContext.Provider
      value={{
        currentLocale: lang ?? i18nConfig.defaultLocale,
        availableLocales: availableLocales,
        globalLocales: i18nConfig.locales,
        setLocale: handleLocaleChange,
        setAvailableLocales,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => React.useContext(LanguageContext);
