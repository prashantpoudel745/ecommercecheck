// import axios from 'axios';
// import { AttendanceData } from 'types';
// const API_URL = 'http://localhost:5000/api/attendance';

// axios.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export const getAttendance = async (): Promise<AttendanceData[]> => {
//   const response = await axios.get(API_URL,{
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     withCredentials:true,
//   });
//   return response.data;
// };

// export const getAttendanceById = async (id: string): Promise<AttendanceData> => {
//   const response = await axios.get(`${API_URL}/employee/${id}`);
//   return response.data;
// };

// export const CheckIn = async (id:string): Promise<AttendanceData> => {
//   const response = await axios.post(`${API_URL}/check-in/${id}`);
//   return response.data;
// };

// export const CheckOut = async (id:string): Promise<AttendanceData> => {
//   const response = await axios.post(`${API_URL}/check-out/${id}`);
//   return response.data;
// };

// export const getStats = async (id:string): Promise<AttendanceData> => {
//   const response = await axios.post(`${API_URL}/stats/${id}`);
//   return response.data;
// };

// export const getStatus = async (id:string): Promise<AttendanceData> => {
//   const response = await axios.post(`${API_URL}/status/${id}`);
//   return response.data;
// };

// export const getAttendanceDashboard = async (): Promise<void> => {
//   await axios.delete(`${API_URL}/dashboard`);
// };


import axios, { AxiosResponse } from 'axios';
import { CurrentStatus, AttendanceStats, AttendanceRecord } from '../../types';

const api = axios.create({
  baseURL: 'https://ecommercebackend-black.vercel.app/api/inventory',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials:true,
});

export const get = async (url: string): Promise<AxiosResponse> => {
  return api.get(url);
};

export const getCurrentStatus = async (employeeId: string): Promise<CurrentStatus> => {
  const response = await api.get(`/status/${employeeId}`);
  return response.data.data;
};

export const getStats = async (employeeId: string, period: string): Promise<AttendanceStats> => {
  const response = await api.get(`/stats/${employeeId}?period=${period}`);
  return response.data.data;
};

export const getAttendance = async (
  employeeId: string,
  params: { page: number; limit: number }
): Promise<{ data: AttendanceRecord[]; pagination: { pages: number } }> => {
  const response = await api.get(`/employee/${employeeId}`, { params });
  return response.data;
};

export const checkIn = async (employeeId: string, data: { location: string; coordinates?: number[]; notes?: string }) => {
  return api.post(`/check-in/${employeeId}`, data);
};

export const checkOut = async (employeeId: string, data: { notes?: string; breaks?: { start: string; end: string }[] }) => {
  return api.post(`/check-out/${employeeId}`, data);
};

export const getAttendanceDashboard = async (): Promise<void> => {
  await axios.delete(`/dashboard`);
};

export default api;