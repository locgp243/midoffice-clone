import en from "@/i18n/locales/en";
import vi from "@/i18n/locales/vn";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    vi: {
      translation: vi,
    },
    en: {
      translation: en,
    },
  },
  lng: "vi",
  fallbackLng: "vi",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
