/**
 * COLORS
 *
 * Quản lý toàn bộ màu sắc dùng chung trong ứng dụng.
 *
 * Không nên hard-code các màu thuộc design system
 * trực tiếp trong từng screen.
 */

export const Colors = {
  primary: "#1976E9",

  success: "#43B54A",
  warning: "#F5A623",
  danger: "#F44336",

  light: {
    background: "#F5F5F9",
    surface: "#FFFFFF",

    text: "#222222",
    textSecondary: "#777777",

    border: "#E5E5E5",

    header: "#1976E9",
    headerText: "#FFFFFF",
  },

  dark: {
    background: "#121212",
    surface: "#1E1E1E",

    text: "#FFFFFF",
    textSecondary: "#AAAAAA",

    border: "#333333",

    header: "#1A1A1A",
    headerText: "#FFFFFF",
  },
};
