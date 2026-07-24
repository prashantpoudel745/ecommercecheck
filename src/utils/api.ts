import axios, { AxiosResponse } from 'axios';
import { CurrentStatus, AttendanceStats, AttendanceRecord } from '../../types';
const API_BASE = import.meta.env.VITE_API_URL||"";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  return config;
});

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