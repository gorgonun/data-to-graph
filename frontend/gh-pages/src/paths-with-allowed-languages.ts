import { D2gLocale } from "../i18n";

export const pathsWithAllowedLanguages = {
  documentation: {
    allowedLanguages: [D2gLocale.en],
    expression: "/documentation(/)?.*",
  },
  blog: {
    allowedLanguages: [D2gLocale.en],
    expression: "/blog(/)?.*",
  },
};
