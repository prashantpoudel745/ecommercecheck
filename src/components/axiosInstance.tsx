// utils/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "", // optional if you're using full URLs
  withCredentials: true, // 👈 important
});

export default axiosInstance;
