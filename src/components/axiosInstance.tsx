// utils/axiosInstance.js
import axios from "axios";
import { attachAuthHeader } from "@/utils/authToken";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "", // optional if you're using full URLs
  withCredentials: true, // 👈 important
});

axiosInstance.interceptors.request.use((config) => attachAuthHeader(config));

export default axiosInstance;
