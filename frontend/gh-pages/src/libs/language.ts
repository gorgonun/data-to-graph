import commonPT from "../../locales/pt/common.json";
import commonEN from "../../locales/en/common.json";
import mainPT from "../../locales/pt/main.json";
import mainEN from "../../locales/en/main.json";
import globalCommon from "../../locales/global/common.json";
import { Locale } from "@/types/i18n.type";

/**
 * Retrieves the language file based on the specified language.
 *
 * @param lang - The language code.
 * @returns The language file containing common and dynamic translations.
 */
export const getLanguageFile = (lang: Locale) => {
  switch (lang) {
    case "pt-BR":
      return {
        common: commonPT,
        main: mainPT,
        globalCommon,
      };
    case "en":
      return {
        common: commonEN,
        main: mainEN,
        globalCommon
      };
    default:
      return {
        common: commonEN,
        main: mainEN,
        globalCommon
      };
  }
};
