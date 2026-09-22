import { Colors } from "@/constants/Colors";
import { useThemeStore } from "@/store/useThemeStore";

/**
 * APP THEME HOOK
 *
 * Component không cần tự kiểm tra:
 *
 * mode === "dark" ? ... : ...
 *
 * mà chỉ cần:
 *
 * const { colors } = useAppTheme();
 *
 * Sau này nếu theme phức tạp hơn,
 * chúng ta chỉ cần sửa hook này.
 */

export function useAppTheme() {
  const mode = useThemeStore((state) => state.mode);

  const colors = mode === "dark" ? Colors.dark : Colors.light;

  return {
    mode,
    colors,
    isDark: mode === "dark",
  };
}
