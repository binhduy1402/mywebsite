import { watch } from "vue";
import { loadTranslations } from "../utils/load";
import { locale, translations } from "../store";
import { LOCALE_DEFAULT } from "../constants";

import type { Locale } from "../types";

export const useTranslations = () => {
  const loadLocale = async (newLocale: Locale) => {
    const loadedTranslations = await loadTranslations("common", newLocale);

    if (loadedTranslations) {
      translations.value = loadedTranslations;
    }
  };

  // Always start with the configured default locale.
  if (!locale.value) {
    locale.value = LOCALE_DEFAULT;
  }

  // Load translations immediately instead of waiting for onMounted.
  loadLocale(locale.value);

  watch(locale, async (newLocale) => {
    if (!newLocale) return;

    window.localStorage.setItem("portfolio-locale", newLocale);
    await loadLocale(newLocale);
  });
};