import api from '@/utils/api';
import { Investment, InvestmentFormData } from '../vite-env';

export const getInvestments = async (): Promise<Investment[]> => {
  const response = await api.get('/investment');
  return response.data;
};

export const getInvestmentById = async (id: string): Promise<Investment> => {
  const response = await api.get(`/investment/${id}`);
  return response.data;
};

export const createInvestment = async (data: InvestmentFormData): Promise<Investment> => {
  const response = await api.post("/investment/", data);
  return response.data;
};

export const updateInvestment = async (id: string, data: InvestmentFormData): Promise<Investment> => {
  const response = await api.put(`/investment/${id}`, data);
  return response.data;
};

export const deleteInvestment = async (id: string): Promise<void> => {
  await api.delete(`/investment/${id}`);
};
