import React, { useEffect } from "react";
import { i18nConfig } from "../../i18n";
import { Locale } from "@/types/i18n.type";
import { useRouter } from "next/router";
import { languageDetector } from "@/helpers/languageDetector";

export const LanguageContext = React.createContext(
  i18nConfig.defaultLocale as string
);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [lang, setLang] = React.useState(i18nConfig.defaultLocale as string);
  const router = useRouter();

  useEffect(() => {
    const detectedLng = i18nConfig.locales.includes(
      router.query.locale as Locale
    )
      ? String(router.query.locale)
      : languageDetector.detect();

    setLang(detectedLng ?? i18nConfig.defaultLocale);
  }, [router.query.locale]);

  return (
    <LanguageContext.Provider value={lang}>{children}</LanguageContext.Provider>
  );
};

export const useLanguage = () => React.useContext(LanguageContext);
