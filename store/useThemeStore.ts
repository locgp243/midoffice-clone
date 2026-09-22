import { create } from "zustand";

import { ThemeMode } from "@/constants/Theme";

/**
 * THEME STORE
 *
 * Quản lý Light/Dark Mode toàn ứng dụng.
 *
 * Hiện tại:
 * - mode: light | dark
 * - toggleTheme(): đổi giữa Light/Dark
 *
 * TODO sau này:
 * - Thêm mode "system".
 * - Persist lựa chọn của user.
 */

interface ThemeState {
  mode: ThemeMode;

  setMode: (mode: ThemeMode) => void;

  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: "light",

  setMode: (mode) => set({ mode }),

  toggleTheme: () =>
    set((state) => ({
      mode: state.mode === "light" ? "dark" : "light",
    })),
}));
