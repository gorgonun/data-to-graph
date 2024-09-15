import { PropsWithChildren } from "react";
import { useRouter } from "next/router";
import I18nProvider from "next-translate/I18nProvider";
import { i18nConfig } from "../../i18n";
import { getLanguageFile } from "@/utils/language.util";
import { Locale } from "@/types/i18n.type";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@emotion/react";
import theme from "../theme";
import { LanguageProvider, useLanguage } from "./LanguageContext";

interface IRootProvider extends PropsWithChildren {}

/**
 * RootProvider component.
 *
 * This component is responsible for providing the root context for the application.
 * It wraps the children components with the necessary providers and sets the language based on the router query.
 *
 * @component
 * @param props - The component props.
 * @param props.children - The children components to be wrapped.
 * @returns The wrapped children components.
 */
export const RootProvider = ({ children }: IRootProvider) => {
  const router = useRouter();
  const { currentLocale, languageContextIsReady } = useLanguage();

  const lang = i18nConfig.locales.includes(router.query.locale as Locale)
    ? (router.query.locale as Locale)
    : i18nConfig.defaultLocale;

  return (
    <I18nProvider
      lang={currentLocale}
      namespaces={getLanguageFile(currentLocale)}
    >
      <AppRouterCacheProvider>
        <ThemeProvider theme={theme}>
          {languageContextIsReady && <div id="root">{children}</div>}
        </ThemeProvider>
      </AppRouterCacheProvider>
    </I18nProvider>
  );
};
