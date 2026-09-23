import i18n from "@/i18n";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

export type Language = "vi" | "en";

interface LanguageState {
  language: Language;
  isInitialized: boolean;
  initializeLanguage: () => Promise<void>;
  changeLanguage: (language: Language) => Promise<void>;
}

const LANGUAGE_KEY = "app_language";

export const useLanguageStore = create<LanguageState>((set) => ({
  language: "vi",
  isInitialized: false,

  initializeLanguage: async () => {
    try {
      const savedLanguage = await SecureStore.getItemAsync(LANGUAGE_KEY);
      const language: Language =
        savedLanguage === "en" || savedLanguage === "vi" ? savedLanguage : "vi";

      await i18n.changeLanguage(language);

      set({
        language,
        isInitialized: true,
      });
    } catch (error) {
      await i18n.changeLanguage("vi");

      set({
        language: "vi",
        isInitialized: true,
      });
    }
  },

  changeLanguage: async (language) => {
    try {
      await SecureStore.setItemAsync(LANGUAGE_KEY, language);
      await i18n.changeLanguage(language);
      set({ language });
    } catch (error) {
      throw error;
    }
  },
}));
