import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import de from "./locales/de.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import pt from "./locales/pt.json";
import ja from "./locales/ja.json";
import zh from "./locales/zh.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
] as const;

const SUPPORTED_CODES: string[] = SUPPORTED_LANGUAGES.map((l) => l.code);

/** Detect initial language: localStorage > browser language > fallback "en" */
function detectLanguage(): string {
  const saved = localStorage.getItem("language");
  if (saved && SUPPORTED_CODES.includes(saved)) return saved;

  // Check browser language (e.g. "de-DE" → "de")
  const browserLang = navigator.language.split("-")[0];
  if (browserLang && SUPPORTED_CODES.includes(browserLang)) return browserLang;

  return "en";
}

const savedLanguage = detectLanguage();

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    de: { translation: de },
    es: { translation: es },
    fr: { translation: fr },
    pt: { translation: pt },
    ja: { translation: ja },
    zh: { translation: zh },
  },
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes
  },
});

/** Change language and persist to localStorage */
export function changeLanguage(lang: string) {
  void i18n.changeLanguage(lang);
  localStorage.setItem("language", lang);
}

export default i18n;
