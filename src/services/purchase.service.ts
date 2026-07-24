import api from "@/utils/api";

// --- Purchase Orders ---
export const fetchPurchaseOrders = async () => {
  const response = await api.get("/purchase/orders");
  return response.data;
};

export const createPurchaseOrder = async (data: any) => {
  const response = await api.post("/purchase/orders", data);
  return response.data;
};

// --- Purchase Bills ---
export const fetchPurchaseBills = async () => {
  const response = await api.get("/purchase/bills");
  return response.data;
};

export const createPurchaseBill = async (data: any) => {
  const response = await api.post("/purchase/bills", data);
  return response.data;
};

// --- Expenses ---
export const fetchExpenses = async () => {
  const response = await api.get("/purchase/expenses");
  return response.data;
};

export const createExpense = async (data: any) => {
  const response = await api.post("/purchase/expenses", data);
  return response.data;
};

// --- Supplier Payments ---
export const fetchSupplierPayments = async () => {
  const response = await api.get("/purchase/payments");
  return response.data;
};

export const createSupplierPayment = async (data: any) => {
  const response = await api.post("/purchase/payments", data);
  return response.data;
};

// --- Suppliers ---
export const fetchSuppliers = async () => {
  const response = await api.get("/purchase/suppliers");
  return response.data;
};

export const createSupplier = async (data: any) => {
  const response = await api.post("/purchase/suppliers", data);
  return response.data;
};
