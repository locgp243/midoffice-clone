export const formatDateTime = (timestamp: number | null) => {
  if (!timestamp) return "--";

  return new Date(timestamp).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("vi-VN");
};
