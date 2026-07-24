import api from "@/utils/api";

export const createQuotation = async (data: any) => {
  const response = await api.post("/sales/quotations", data);
  return response.data;
};

export const createSalesOrder = async (data: any) => {
  const response = await api.post("/sales/orders", data);
  return response.data;
};

export const createInvoice = async (data: any) => {
  const response = await api.post("/sales/invoices", data);
  return response.data;
};

export const sendInvoiceEmail = async (id: string, email: string, taxRate: number) => {
  const response = await api.post(`/sales/invoices/${id}/send`, { email, taxRate });
  return response.data;
};

export const createCreditNote = async (data: any) => {
  const response = await api.post("/sales/credit-notes", data);
  return response.data;
};

export const createCustomerPayment = async (data: any) => {
  const response = await api.post("/sales/payments", data);
  return response.data;
};

export const createCustomer = async (data: any) => {
  const response = await api.post("/sales/customers", data);
  return response.data;
};

// GET Methods
export const fetchQuotations = async () => {
  const response = await api.get("/sales/quotations");
  return response.data;
};

export const fetchSalesOrders = async () => {
  const response = await api.get("/sales/orders");
  return response.data;
};

export const fetchInvoices = async () => {
  const response = await api.get("/sales/invoices");
  return response.data;
};

export const fetchCreditNotes = async () => {
  const response = await api.get("/sales/credit-notes");
  return response.data;
};

export const fetchCustomerPayments = async () => {
  const response = await api.get("/sales/payments");
  return response.data;
};

export const fetchCustomers = async () => {
  const response = await api.get("/sales/customers");
  return response.data;
};
