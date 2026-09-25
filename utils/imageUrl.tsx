const STORAGE_URL = process.env.EXPO_PUBLIC_STORAGE_URL;

export const getImageUrl = (path?: string | null): string | null => {
  if (!path) {
    return null;
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("file://") ||
    path.startsWith("content://")
  ) {
    return path;
  }

  if (!STORAGE_URL) {
    console.warn("lỗi storraeg url");
    return null;
  }

  const baseUrl = STORAGE_URL.replace(/\/$/, "");
  const imagePath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${imagePath}`;
};
