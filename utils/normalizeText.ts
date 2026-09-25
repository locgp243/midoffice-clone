export const normalizeText = (value?: string | null) => {
  return value?.trim().toLocaleLowerCase("vi-VN") ?? "";
};
