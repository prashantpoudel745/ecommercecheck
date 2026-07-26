import axios from 'axios';
import { InventoryItem ,InventoryStatusData } from '../../types/inventory.types';
import { attachAuthHeader } from '@/utils/authToken';

axios.interceptors.request.use((config) => attachAuthHeader(config));

// Get all inventory items
export const getInventories = async (): Promise<InventoryItem[]> => {
  const response = await axios.post('/api/inventory/', null, {
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });
  return response.data;
};

// Get inventory status chart for a user
export const getInventoryStatusChart = async (userId: string): Promise<InventoryStatusData> => {
  const response = await axios.post(`/api/inventory/statuschart/${userId}`);
  return response.data;
};

// Add a new inventory item
export const addInventory = async (data: InventoryItem): Promise<InventoryItem> => {
  const response = await axios.post('/api/inventory/add', data);
  return response.data;
};

// Update an inventory item by ID
export const updateInventory = async (id: string, data: InventoryItem): Promise<InventoryItem> => {
  const response = await axios.put(`/api/inventory/update/${id}`, data);
  return response.data;
};

// Delete an inventory item by ID
export const deleteInventory = async (id: string): Promise<void> => {
  await axios.delete(`/api/inventory/delete/${id}`);
};

// Send stock email notification
export const sendStockMail = async (): Promise<void> => {
  await axios.post('/api/inventory/sendstockmail');
};

// Manually update inventory by ID
export const manualUpdateInventory = async (id: string, data: Partial<InventoryItem>): Promise<InventoryItem> => {
  const response = await axios.put(`/api/inventory/manualupdate/${id}`, data);
  return response.data;
};

// Bulk upload inventory items (expects a FormData with file)
export const bulkUploadInventory = async (file: File): Promise<{ success: boolean; message: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post('/api/inventory/bulk-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
