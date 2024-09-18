import { PropsWithChildren } from "react";
import I18nProvider from "next-translate/I18nProvider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@emotion/react";
import theme from "../theme";
import { useLanguage } from "./LanguageContext";
import { getLanguageFile } from "@/libs/language";
import { DrawerProvider } from "./DrawerContext";

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
  const { currentLocale, languageContextIsReady } = useLanguage();

  return (
    <I18nProvider
      lang={currentLocale}
      namespaces={getLanguageFile(currentLocale)}
    >
      <AppRouterCacheProvider>
        <ThemeProvider theme={theme}>
          <DrawerProvider>
            {languageContextIsReady && <div id="root">{children}</div>}
          </DrawerProvider>
        </ThemeProvider>
      </AppRouterCacheProvider>
    </I18nProvider>
  );
};
