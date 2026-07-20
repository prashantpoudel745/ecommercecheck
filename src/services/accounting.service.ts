import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL||"";
const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  return config;
});

import { Transaction } from "../../types/index";

// --- ERP Types ---
export interface AccountGroup {
  _id: string;
  name: string;
  parentGroup?: AccountGroup | string;
  nature: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
  description?: string;
}

export interface Account {
  _id: string;
  code: string;
  name: string;
  accountGroup: AccountGroup | string;
  type: string;
  openingBalance: number;
  currentBalance: number;
  currency: string;
  description?: string;
}

export interface VoucherEntry {
  account: Account | string;
  type: "DEBIT" | "CREDIT";
  amount: number;
  description?: string;
}

export interface Voucher {
  _id: string;
  voucherNumber: string;
  title:string;
  description:string;
  type: string;
  date: string;
  narration: string;
  partyName?: string;
  referenceNumber?: string;
  entries: VoucherEntry[];
  totalAmount: number;
  taxRate?: number;
  taxAmount?: number;
  amountPaid: number;
  amountDue: number;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  status: string;
  updatedBy?: string;
}

export interface JournalEntry {
  _id: string;
  date: string;
  description: string;
  entries: {
    account: Account;
    debit: number;
    credit: number;
  }[];
  totalAmount: number;
  status: string;
}

export interface AccountingStats {
  revenue: number;
  expenses: number;
  netProfit: number;
  accountsReceivable: number;
  accountsPayable: number;
  cashBalance: number;
}

export interface VatReport {
  period: {
    startDate?: string | null;
    endDate?: string | null;
  };
  taxableSales: number;
  taxablePurchases: number;
  outputVat: number;
  inputVat: number;
  netVatPayable: number;
  netVatRefundable: number;
  vouchers: Array<{
    voucherNumber: string;
    type: string;
    date: string;
    partyName?: string;
    taxableAmount: number;
    outputVat: number;
    inputVat: number;
    totalAmount: number;
  }>;
}

export interface AccountingHealth {
  readinessScore: number;
  marketLaunchReady: boolean;
  verdict: string;
  passed: string[];
  issues: Array<{
    code: string;
    severity: string;
    message: string;
  }>;
  warnings: Array<{
    code: string;
    severity: string;
    message: string;
  }>;
  metrics: {
    trialBalanceDebit: number;
    trialBalanceCredit: number;
    trialDifference: number;
    totalAssets: number;
    totalLiabilitiesAndEquity: number;
    outputVat: number;
    inputVat: number;
    netVatPayable: number;
    netVatRefundable: number;
    voucherCount: number;
    accountCount: number;
  };
  nepalContext: string[];
}

// --- API Calls ---

// Party logic
export const getPartyBalance = async (name: string) => {
  const response = await api.get(`/erp/party/${encodeURIComponent(name)}/balance`);
  return response.data;
};

export const getPartyLedger = async (name: string) => {
  const response = await api.get(`/erp/party/${encodeURIComponent(name)}/ledger`);
  return response.data;
};

export const recordQuickPayment = async (name: string, data: { amount: number; paymentAccountId: string; narration?: string }) => {
  const response = await api.post(`/erp/party/${encodeURIComponent(name)}/quick-payment`, data);
  return response.data;
};

// Groups
export const getAccountGroups = async (): Promise<AccountGroup[]> => {
  const response = await api.get("/erp/groups");
  return response.data;
};

export const createAccountGroup = async (data: Partial<AccountGroup>) => {
  const response = await api.post("/erp/groups", data);
  return response.data;
};

// Accounts
export const getAccounts = async (): Promise<Account[]> => {
  const response = await api.get("/erp/accounts");
  return response.data;
};

export const createAccount = async (data: Partial<Account>) => {
  const response = await api.post("/erp/accounts", data);
  return response.data;
};

// Customers/Clients
export const getCustomers = async (): Promise<any[]> => {
  const response = await api.get("/customer");
  return response.data.clients || [];
};

// Vouchers
export const getVouchers = async (): Promise<Voucher[]> => {
  const response = await api.get("/erp/vouchers");
  return response.data;
};

export const getVoucherById = async (id: string): Promise<Voucher> => {
  const response = await api.get(`/erp/vouchers/${id}`);
  return response.data;
};

export const createVoucher = async (data: any) => {
  const response = await api.post("/erp/vouchers", data);
  return response.data;
};

// Partial Payments
export const recordPayment = async (voucherId: string, data: { amount: number; paymentAccountId: string; narration?: string; title?: string; description?: string }) => {
  const response = await api.post(`/erp/vouchers/${voucherId}/payment`, data);
  return response.data;
};

export const deleteVoucher = async (id: string) => {
  const response = await api.delete(`/erp/vouchers/${id}`);
  return response.data;
};

export const sendInvoice = async (id: string, data?: { email?: string, paymentTermsDays?: number, taxRate?: number, currencySymbol?: string }) => {
  const response = await api.post(`/erp/vouchers/${id}/send-invoice`, data || {});
  return response.data;
};

// Unified Transaction
export const createTransactionWithVoucher = async (data: any) => {
  const response = await api.post("/erp/transactions", data);
  return response.data;
};

// Legacy Accounting endpoints
export const getAccountingTransactions = async (): Promise<Transaction[]> => {
    const response = await api.get("/accounting");
    // Ensure consistent naming and format
    const data = response.data.account || response.data.accounts || [];
    return data.map((t: any) => ({
        id: t._id || t.id,
        ...t
    }));
};

// Reports
export const getTrialBalance = async () => {
  const response = await api.get("/erp/reports/trial-balance");
  return response.data;
};

export const getPandL = async (params?: { startDate?: string; endDate?: string }) => {
  const response = await api.get("/erp/reports/p-and-l", { params });
  return response.data;
};

export const getBalanceSheet = async () => {
  const response = await api.get("/erp/reports/balance-sheet");
  return response.data;
};

export const getVatReport = async (params?: { startDate?: string; endDate?: string }): Promise<VatReport> => {
  const response = await api.get("/erp/reports/vat", { params });
  return response.data;
};

export const getAccountingHealth = async (): Promise<AccountingHealth> => {
  const response = await api.get("/erp/reports/accounting-health");
  return response.data;
};

export const getDashboardStats = async (): Promise<AccountingStats> => {
  const [pnl, tb, accounts] = await Promise.all([
    getPandL(),
    getTrialBalance(),
    getAccounts()
  ]);

  // Use pre-calculated totals from backend for accuracy
  const revenue = pnl.totalRevenue || 0;
  const expenses = pnl.totalExpense || pnl.totalExpenses || 0;
  const netProfit = pnl.netProfit ?? (revenue - expenses);
  
  // Use trial balance summary for AR/AP if available, otherwise fallback to account filtering
  const accountsReceivable = tb.summary?.receivables ?? accounts
    .filter(a => (a.type === 'ASSET' || (typeof a.accountGroup === 'object' && a.accountGroup?.nature === 'ASSET')) && 
                (a.name.toLowerCase().includes('debtor') || a.name.toLowerCase().includes('receivable')))
    .reduce((sum, a) => sum + (a.currentBalance || 0), 0);
    
  const accountsPayable = tb.summary?.payables ?? accounts
    .filter(a => (a.type === 'LIABILITY' || (typeof a.accountGroup === 'object' && a.accountGroup?.nature === 'LIABILITY')) && 
                (a.name.toLowerCase().includes('creditor') || a.name.toLowerCase().includes('payable')))
    .reduce((sum, a) => sum + (Math.abs(a.currentBalance) || 0), 0);

  // Cash/Bank balance calculation
  const cashBalance = accounts
    .filter(a => {
        const name = a.name.toLowerCase();
        const groupName = typeof a.accountGroup === 'object' ? a.accountGroup?.name?.toLowerCase() : "";
        return name.includes('cash') || name.includes('bank') || groupName?.includes('cash') || groupName?.includes('bank');
    })
    .reduce((sum, a) => sum + (a.currentBalance || 0), 0);

  return {
    revenue,
    expenses,
    netProfit,
    accountsReceivable,
    accountsPayable,
    cashBalance
  };
};

// Setup
export const seedDefaults = async () => {
  const response = await api.post("/erp/setup/defaults", {});
  return response.data;
};

export const migrateLegacy = async () => {
  const response = await api.post("/erp/setup/migrate", {});
  return response.data;
};

// --- Logic Helpers (Refactored from Components) ---

export const calculateRevenueExpenses = (transactions: Transaction[]) => {
  let revenue = 0;
  let expenses = 0;

  transactions.forEach((t) => {
    const amount = Math.abs(t.amount || 0);
    const category = t.category?.toLowerCase() || "";
    const type = t.type?.toLowerCase() || "";

    if (category === "sales" || type === "sales" || category === "revenue") {
      revenue += amount;
    } else if (
      ["expenses", "expense"].includes(category) ||
      ["expenses", "expense"].includes(type)
    ) {
      expenses += amount;
    }
  });

  return { revenue, expenses, netProfit: revenue - expenses };
};

// --- Legacy Support (Aliases) ---
export const getJournalEntries = async () => {
    const vouchers = await getVouchers();
    return vouchers.map((v: any) => ({
        _id: v._id,
        date: v.date,
        description: v.narration || v.voucherNumber,
        entries: v.entries.map((e: any) => ({
            account: e.account,
            debit: e.type === 'DEBIT' ? e.amount : 0,
            credit: e.type === 'CREDIT' ? e.amount : 0
        })),
        totalAmount: v.totalAmount,
        status: v.status
    }));
};

export const createJournalEntry = async (data: any) => {
    const entries = data.entries.map((e: any) => {
        if(e.debit > 0) return { account: e.account, type: "DEBIT", amount: e.debit };
        return { account: e.account, type: "CREDIT", amount: e.credit };
    });

    const payload = {
        type: "JOURNAL",
        date: data.date,
        narration: data.description,
        entries
    };

    return await createVoucher(payload);
};
