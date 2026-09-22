/**
 * TYPOGRAPHY
 *
 * Quản lý font size và font weight toàn app.
 *
 * Sau này nếu dùng font custom như Inter/Roboto,
 * khai báo FontFamily tại đây.
 */

export const FontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
};

export const FontWeight = {
  regular: "400",
  medium: "500",
  semiBold: "600",
  bold: "700",
} as const;

/**
 * Khoảng cách dùng chung toàn ứng dụng.
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

/**
 * Border radius dùng chung toàn ứng dụng.
 */
export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 20,
  round: 999,
};
