import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import jaCommon from "./locales/ja/common.json";
import ukCommon from "./locales/uk/common.json";
import deCommon from "./locales/de/common.json";
import plCommon from "./locales/pl/common.json";
import koCommon from "./locales/ko/common.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      ja: { common: jaCommon },
      uk: { common: ukCommon },
      de: { common: deCommon },
      pl: { common: plCommon },
      ko: { common: koCommon },
    },
    ns: ["common"],
    defaultNS: "common",
    fallbackLng: "en",
    supportedLngs: ["en", "ja", "uk", "de", "pl", "ko"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "habitflow_lang",
    },
  });

export default i18n;
