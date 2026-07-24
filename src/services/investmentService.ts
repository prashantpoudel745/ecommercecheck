import axios from 'axios';
import { Investment, InvestmentFormData } from '../vite-env';
import { attachAuthHeader } from '@/utils/authToken';

axios.interceptors.request.use((config) => attachAuthHeader(config));

export const getInvestments = async (): Promise<Investment[]> => {
  const response = await axios.get('/api/investment',{
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials:true,
  });
  return response.data;
};

export const getInvestmentById = async (id: string): Promise<Investment> => {
  const response = await axios.get(`api/investment/${id}`);
  return response.data;
};

export const createInvestment = async (data: InvestmentFormData): Promise<Investment> => {
  const response = await axios.post("api/investment/", data);
  return response.data;
};

export const updateInvestment = async (id: string, data: InvestmentFormData): Promise<Investment> => {
  const response = await axios.put(`api/investment/${id}`, data);
  return response.data;
};

export const deleteInvestment = async (id: string): Promise<void> => {
  await axios.delete(`api/investment/${id}`);
};
