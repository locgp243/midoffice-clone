import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("lỗi url api");
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
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
