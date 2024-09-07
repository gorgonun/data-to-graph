import { I18nConfig } from "next-translate";

/**
 * Defines the configuration for internationalization (i18n) in a Next.js application.
 */

export enum D2gLocale {
  ptBr = "pt-BR",
  en = "en",
}

export const i18nConfig = {
  locales: [D2gLocale.ptBr, D2gLocale.en],
  defaultLocale: D2gLocale.en,
  loader: false,
  pages: {
    "*": ["common"],
  },
  defaultNS: "common",
} satisfies I18nConfig;
