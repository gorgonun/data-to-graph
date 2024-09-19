import React, { PropsWithChildren, useEffect, useMemo } from "react";
import { D2gLocale, i18nConfig } from "../../i18n";
import { useRouter } from "next/router";
import { languageDetector } from "@/helpers/languageDetector";
import { useAlert } from "./AlertContext";
import { pathsWithAllowedLanguages } from "@/paths-with-allowed-languages";

export const LanguageContext = React.createContext<{
  currentLocale: D2gLocale;
  availableLocales: D2gLocale[];
  globalLocales: D2gLocale[];
  /**
   * This is a flag that indicates whether the language was detected by the language detector.
   * This is useful to avoid FOUC (Flash of Unstyled Content) when the language is detected after the page is rendered (and will redirect the user).
   * WARNING: Use this flag to conditionally render the page content only when the language was detected or it will cause FOUC.
   */
  languageContextIsReady: boolean;
  setLocale: ((newLocale: D2gLocale) => void) | undefined;
  setAvailableLocales: ((newLocales: D2gLocale[]) => void) | undefined;
}>({
  currentLocale: i18nConfig.defaultLocale,
  availableLocales: i18nConfig.locales,
  globalLocales: i18nConfig.locales,
  languageContextIsReady: false,
  setLocale: undefined,
  setAvailableLocales: undefined,
});

export default function LanguageProvider({ children }: PropsWithChildren) {
  const [lang, setLang] = React.useState<null | D2gLocale>(null);
  const [availableLocales, setAvailableLocales] = React.useState(
    i18nConfig.locales
  );
  const [languageWasDetected, setLanguageWasDetected] = React.useState(false);
  const [alertsWherePushed, setAlertsWherePushed] = React.useState(false);
  const languageContextIsReady = useMemo(() => languageWasDetected && alertsWherePushed, [languageWasDetected, alertsWherePushed]);
  const router = useRouter();
  const { pushAlert } = useAlert();

  const handleLocaleChange = (newLocale: D2gLocale) => {
    languageDetector.cache ? languageDetector.cache(newLocale) : {};
    setLang(newLocale);
  };

  const getAvailableLanguagesForPath = (path: string) => {
    for (const { expression, allowedLanguages } of Object.values(
      pathsWithAllowedLanguages
    )) {
      if (path.match(new RegExp(expression))) {
        return allowedLanguages;
      }
    }

    return i18nConfig.locales;
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
          query: { ...router.query, locale: lang },
        },
        undefined,
        { locale: lang ?? i18nConfig.defaultLocale }
      );

    }
    
    // I could find no other way to change the lang tag in HTML with export.
    document.documentElement.setAttribute("lang", lang ?? i18nConfig.defaultLocale);
  }, [lang]);

  useEffect(() => {
    const detectedLng = (
      i18nConfig.locales.includes(router.query.locale as D2gLocale)
        ? String(router.query.locale)
        : languageDetector.detect()
    ) as D2gLocale | undefined;

    setLang(detectedLng ?? i18nConfig.defaultLocale);
    setLanguageWasDetected(true);
  }, []);

  useEffect(() => {
    if (!router.isReady) return;

    const {
      query: { locale },
    } = router;

    if (typeof locale === "string") {
      if (locale !== lang && i18nConfig.locales.includes(locale as D2gLocale)) {
        setLang(locale as D2gLocale);
        document.documentElement.setAttribute("lang", locale); 
        return;
      } else if (!i18nConfig.locales.includes(locale as D2gLocale)) {
        router.replace(
          { pathname: router.pathname, query: { ...router.query, locale: lang } },
          undefined,
          { locale: lang ?? i18nConfig.defaultLocale }
        );

        // I could find no other way to change the lang tag in HTML with export.
        document.documentElement.setAttribute("lang", lang ?? i18nConfig.defaultLocale); 
        return;
      }
    }

    const allowedLanguages = getAvailableLanguagesForPath(router.pathname);
    if (lang && !allowedLanguages.includes(lang)) {
      pushAlert({
        message: `The language "${lang}" is not available in this page.`,
        severity: "info",
      });

      document.documentElement.setAttribute("lang", allowedLanguages[0]); 
    }

    setAlertsWherePushed(true);
  }, [router]);

  return (
    <LanguageContext.Provider
      value={{
        currentLocale: lang ?? i18nConfig.defaultLocale,
        availableLocales: availableLocales,
        globalLocales: i18nConfig.locales,
        languageContextIsReady,
        setLocale: handleLocaleChange,
        setAvailableLocales,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => React.useContext(LanguageContext);
