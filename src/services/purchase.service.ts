import api from "@/utils/api";

type ApiPayload = FormData | Record<string, unknown>;

// --- Purchase Orders ---
export const fetchPurchaseOrders = async () => {
  const response = await api.get("/purchase/orders");
  return response.data;
};

export const createPurchaseOrder = async (data: ApiPayload) => {
  const response = await api.post("/purchase/orders", data);
  return response.data;
};

export const convertPurchaseOrderToBill = async (id: string) => {
  const response = await api.post(`/purchase/orders/${id}/convert-to-bill`);
  return response.data;
};

export const convertPurchaseBillToPayment = async (id: string, data: ApiPayload) => {
  const response = await api.post(`/purchase/bills/${id}/convert-to-payment`, data);
  return response.data;
};

// --- Purchase Bills ---
export const fetchPurchaseBills = async () => {
  const response = await api.get("/purchase/bills");
  return response.data;
};

export const createPurchaseBill = async (data: ApiPayload) => {
  const response = await api.post("/purchase/bills", data);
  return response.data;
};

// --- Expenses ---
export const fetchExpenseById = async (id: string) => {
  const response = await api.get(`/purchase/expenses/${id}`);
  return response.data;
};

export const fetchExpenses = async () => {
  const response = await api.get("/purchase/expenses");
  return response.data;
};

export const approveExpense = async (id: string) => {
  const response = await api.patch(`/purchase/expenses/${id}/approve`);
  return response.data;
};

export const createExpense = async (data: ApiPayload) => {
  const config = data instanceof FormData ? { headers: { "Content-Type": undefined } } : {};
  const response = await api.post("/purchase/expenses", data, config);
  console.log(response.data);
  return response.data;
};

// --- Supplier Payments ---
export const fetchSupplierPayments = async () => {
  const response = await api.get("/purchase/payments");
  return response.data;
};

export const createSupplierPayment = async (data: ApiPayload) => {
  const response = await api.post("/purchase/payments", data);
  return response.data;
};

// --- Suppliers ---
export const fetchSuppliers = async () => {
  const response = await api.get("/purchase/suppliers");
  return response.data;
};

export const createSupplier = async (data: ApiPayload) => {
  const response = await api.post("/purchase/suppliers", data);
  return response.data;
};

// --- IRD: Debit Notes ---
export const fetchDebitNotes = async () => {
  const response = await api.get("/purchase/debit-notes");
  return response.data;
};

export const createDebitNote = async (data: ApiPayload) => {
  const response = await api.post("/purchase/debit-notes", data);
  return response.data;
};
