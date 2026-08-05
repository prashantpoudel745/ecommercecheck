import axios, { AxiosResponse } from 'axios';
import { CurrentStatus, AttendanceStats, AttendanceRecord } from '../../types';
import { attachAuthHeader } from './authToken';
const API_BASE = import.meta.env.VITE_API_URL||"";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => attachAuthHeader(config));

// ── Silent Token Refresh on 401 ──────────────────────────────
// When the 30-min access token expires, any API call returns 401.
// This interceptor transparently calls POST /refresh (which reads
// the 7-day httpOnly refreshToken cookie) and retries the request.
let isRefreshing = false;
let failedQueue: { resolve: (v: any) => void; reject: (e: any) => void }[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(undefined)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401s that are NOT from /refresh, /login, /signup, /getme
    const skipPaths = ["/refresh", "/login", "/signup", "/getme"];
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      skipPaths.some((p) => originalRequest.url?.includes(p))
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until the refresh completes
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => api(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await axios.post(`${API_BASE}/api/refresh`, {}, { withCredentials: true });
      processQueue(null);
      return api(originalRequest); // retry original
    } catch (refreshError) {
      processQueue(refreshError);
      // Refresh failed — session is truly expired
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);


export const get = async (url: string): Promise<AxiosResponse> => {
  return api.get(`/attendance/${url}`);
};

export const getCurrentStatus = async (employeeId: string): Promise<CurrentStatus> => {
  const response = await api.get(`/attendance/status/${employeeId}`);
  return response.data.data;
};

export const getStats = async (employeeId: string, period: string): Promise<AttendanceStats> => {
  const response = await api.get(`/attendance/stats/${employeeId}?period=${period}`);
  return response.data.data;
};

export const getAttendance = async (
  employeeId: string,
  params: { page: number; limit: number }
): Promise<{ data: AttendanceRecord[]; pagination: { pages: number } }> => {
  const response = await api.get(`/attendance/employee/${employeeId}`, { params });
  return response.data;
};

export const checkIn = async (employeeId: string, data: { location: string; coordinates?: number[]; notes?: string }) => {
  return api.post(`/attendance/check-in/${employeeId}`, data);
};

export const checkOut = async (employeeId: string, data: { notes?: string; breaks?: { start: string; end: string }[] }) => {
  return api.post(`/attendance/check-out/${employeeId}`, data);
};

export default api;
