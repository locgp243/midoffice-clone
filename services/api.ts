import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

console.log("Check api:", API_URL);

if (!API_URL) {
  throw new Error("EXPO_PUBLIC_API_URL chưa được cấu hình");
}

export const api = axios.create({
  baseURL: API_URL,

  timeout: 15000,

  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
