import { ReactNode, useEffect, useMemo, useState } from "react";
import { NextRouter, useRouter } from "next/router";
import { languageDetector } from "@/helpers/languageDetector";
import { D2gLocale, i18nConfig } from "../../i18n";
import { Locale } from "@/types/i18n.type";
import { pathsWithAllowedLanguages } from "@/paths-with-allowed-languages";
import { useLanguage } from "@/Providers/LanguageContext";

interface LanguageWrapperProps {
  children: ReactNode;
}

/**
 * LanguageWrapper component.
 *
 * This component is responsible for handling the language detection and redirection logic.
 *
 * Props:
 * - children: ReactNode - The child components to be rendered.
 *
 * Usage:
 * ```tsx
 * <LanguageWrapper>
 *   // Child components
 * </LanguageWrapper>
 * ```
 */
export const LanguageWrapper = ({ children }: LanguageWrapperProps) => {
  const [detectedLng, setDetectedLng] = useState("");
  const {
    availableLocales,
    globalLocales,
    currentLocale,
    setAvailableLocales,
    setLocale,
  } = useLanguage();
  const router = useRouter();

  // Check if current path includes locale
  const isLocaleInThePath = useMemo(
    () =>
      (router.query.locale &&
        i18nConfig.locales.includes(router.query.locale as Locale)) ||
      router.asPath.includes(detectedLng ?? i18nConfig.defaultLocale),
    [detectedLng, router.asPath, router.query.locale]
  );

  const getAvailableLanguagesForPath = (path: string, locale?: string) => {
    for (const { expression, allowedLanguages } of Object.values(
      pathsWithAllowedLanguages
    )) {
      if (path.match(new RegExp(("/" + locale ?? "") + expression))) {
        return allowedLanguages;
      }
    }

    return globalLocales;
  };

  // Set detected language
  useEffect(() => {
    const detected = languageDetector.detect();
    if (detected) {
      setDetectedLng(detected);
    }
  }, []);

  // handle redirection
  useEffect(() => {
    const {
      query: { locale },
      asPath,
      isReady,
    } = router;

    // aspath will be /[locale]
    if (!isReady) return;

    const contextLocale = typeof locale === "string" ? locale : undefined;

    const isValidLocale = i18nConfig.locales.includes(contextLocale as Locale);

    const availableLanguagesForPath = getAvailableLanguagesForPath(
      asPath,
      contextLocale
    );

    setAvailableLocales?.(availableLanguagesForPath);

    const newPathName = router.pathname === '/' ? '/[locale]/' : router.pathname;

    const localeInAllowedLanguages = contextLocale
      ? availableLanguagesForPath.includes(contextLocale as D2gLocale)
      : false;

    // Check if the current route has accurate locale
    if (
      // isReady &&
      !isValidLocale
    ) {
      // console.log({ availableLanguagesForPath, detectedLng})
      const newLocale = availableLanguagesForPath.includes(
        currentLocale as D2gLocale
      )
        ? currentLocale
        : availableLocales[0];

      if (asPath.startsWith("/" + newLocale) && router.route === "/404") {
        // router.push({
        //   pathname: "/404",
        //   query: { locale },
        // });
        return;
      }

      setLocale?.(newLocale as D2gLocale);
      router.replace(
        { pathname: newPathName, query: { locale: newLocale } },
        undefined,
        { locale: newLocale }
      );
    } else if (
      !localeInAllowedLanguages &&
      availableLanguagesForPath.length > 0
    ) {
      const newPath = "/[locale]/" + newPathName.replace("/[locale]/", "");
      router.replace(
        { pathname: newPath, query: { locale: availableLanguagesForPath[0] } },
        undefined,
        { locale: availableLanguagesForPath[0] }
      );
    }
  }, [router, currentLocale, availableLocales]);

  return isLocaleInThePath ? <>{children}</> : <></>;
};
