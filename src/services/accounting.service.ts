import { AccountGroup,Account, AccountingHealth, VatReport, Voucher, AccountingStats } from '../../types/accounting.types';
import axios from "axios";
import Decimal from 'decimal.js';
import { attachAuthHeader } from '@/utils/authToken';

const API_URL = import.meta.env.VITE_API_URL||"";
const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => attachAuthHeader(config));

import { Transaction } from "../../types/index";
import { toDecimal } from '@/utils/helpers/decimalhelper';

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

export const createVoucher = async (data: any, post: boolean = false) => {
  const response = await api.post(`/erp/vouchers?post=${post}`, data);
  return response.data;
};

export const approveVoucher = async (id: string) => {
  const response = await api.post(`/erp/vouchers/${id}/approve`);
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
export const createTransactionWithVoucher = async (data: any, post: boolean = false) => {
  const response = await api.post(`/erp/transactions?post=${post}`, data);
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
export const getTrialBalance = async (params?: { startDate?: string; endDate?: string }) => {
  const response = await api.get("/erp/reports/trial-balance", { params });
  return response.data;
};

export const getPandL = async (params?: { startDate?: string; endDate?: string }) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const activeParams = {
    startDate: params?.startDate || `${currentYear}-01-01`,
    endDate: params?.endDate || now.toISOString().split("T")[0],
  };
  const response = await api.get("/erp/reports/p-and-l", { params: activeParams });
  return response.data;
};

export const getBalanceSheet = async (params?: { startDate?: string; endDate?: string }) => {
  const response = await api.get("/erp/reports/balance-sheet", { params });
  return response.data;
};

export const getAgingReportAR = async () => {
  const response = await api.get("/erp/reports/aging/ar");
  return response.data;
};

export const getAgingReportAP = async () => {
  const response = await api.get("/erp/reports/aging/ap");
  return response.data;
};

export const getVatReport = async (params?: { startDate?: string; endDate?: string }): Promise<VatReport> => {
  const response = await api.get("/erp/reports/vat", { params });
  return response.data;
};

export const downloadAccountingReport = async (
  type: "trial-balance" | "balance-sheet" | "vat",
  params?: { startDate?: string; endDate?: string }
) => {
  const response = await api.get(`/erp/reports/download/${type}`, {
    params,
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  const suffix = [params?.startDate, params?.endDate].filter(Boolean).join("_to_") || "all";
  link.href = url;
  link.download = `${type}-${suffix}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const getAccountingHealth = async (): Promise<AccountingHealth> => {
  const response = await api.get("/erp/reports/accounting-health");
  return response.data;
};

export const getDashboardStats =
async (params?: { startDate?: string; endDate?: string }):Promise<AccountingStats>=>{
    const now = new Date();
    const currentYear = now.getFullYear();
    const activeParams = params || {
      startDate: `${currentYear}-01-01`,
      endDate: now.toISOString().split("T")[0],
    };

    const [pnl,tb,accounts]=await Promise.all([
        getPandL(activeParams),
        getTrialBalance(),
        getAccounts(),

    ]);
    //---------------------
    // Revenue
    //---------------------

    const revenue = toDecimal(pnl.totalRevenue);

    const expenses = pnl.totalExpense != null
        ? toDecimal(pnl.totalExpense)
        : toDecimal(pnl.totalExpenses);

    const netProfit = pnl.netProfit != null
        ? toDecimal(pnl.netProfit)
        : revenue.minus(expenses);

    //---------------------
    // Accounts Receivable
    //---------------------
    const accountsReceivable = tb.summary?.receivables != null
        ? toDecimal(tb.summary.receivables)
        : accounts

            .filter((a)=>{

                const nature=
                typeof a.accountGroup==="object"

                ?a.accountGroup?.nature

                :null;


                const name=
                a?.name ? a.name.toLowerCase() : "";


                return(

                    (
                        a.type==="ASSET" ||
                        nature==="ASSET"
                    )

                    &&

                    (
                        name.includes(
                            "debtor"
                        )

                        ||

                        name.includes(
                            "receivable"
                        )

                    )

                );


            })

            .reduce(

                (sum,a)=>

                    sum.plus(

                        toDecimal(
                            a.currentBalance
                        )

                    ),

                new Decimal(0)

            );


    //---------------------
    // Accounts Payable
    //---------------------

    const accountsPayable=

        tb.summary?.payables!=null

        ?toDecimal(
            tb.summary.payables
         )

        :accounts

            .filter((a)=>{

                const nature=
                typeof a.accountGroup==="object"

                ?a.accountGroup?.nature

                :null;


                const name=
                a?.name ? a.name.toLowerCase() : "";


                return(

                    (
                        a.type==="LIABILITY" ||
                        nature==="LIABILITY"
                    )

                    &&

                    (
                        name.includes(
                            "creditor"
                        )

                        ||

                        name.includes(
                            "payable"
                        )

                    )

                );

            })

            .reduce(

                (sum,a)=>

                    sum.plus(

                        toDecimal(
                            a.currentBalance
                        ).abs()

                    ),

                new Decimal(0)

            );
    const cashBalance=
        accounts
        .filter((a)=>{
            const name=
            a?.name ? a.name.toLowerCase() : "";
            const groupName=
            typeof a.accountGroup==="object" && a.accountGroup?.name
            ?a.accountGroup.name.toLowerCase()
            :"";
            return(
                name.includes("cash") ||
                name.includes("bank") ||
                groupName.includes("cash") ||
                groupName.includes("bank")
            );
        })
        .reduce(
            (sum,a)=>
                sum.plus(
                    toDecimal(
                        a.currentBalance
                    )
                ),
            new Decimal(0)
        );
    return {
        revenue: pnl.totalRevenue || "0",
        expenses: pnl.totalExpense ?? pnl.totalExpenses ?? "0",
        revenueWithTax: pnl.totalRevenueWithTax ?? pnl.totalRevenue ?? "0",
        expensesWithTax: pnl.totalExpenseWithTax ?? pnl.totalExpensesWithTax ?? pnl.totalExpense ?? pnl.totalExpenses ?? "0",
        netProfit: pnl.netProfit || "0",
        accountsReceivable: accountsReceivable.toString(),
        accountsPayable: accountsPayable.toString(),
        cashBalance: cashBalance.toString(),
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
  let revenue = new Decimal(0);
  let expenses = new Decimal(0);

  transactions.forEach((t) => {
    const amount = toDecimal(t.amount || 0).abs();
    const category = t.category?.toLowerCase() || "";
    const type = t.type?.toLowerCase() || "";

    if (category === "sales" || type === "sales" || category === "revenue") {
      revenue = revenue.plus(amount);
    } else if (
      ["expenses", "expense"].includes(category) ||
      ["expenses", "expense"].includes(type)
    ) {
      expenses = expenses.plus(amount);
    }
  });

  return {
    revenue: revenue.toNumber(),
    expenses: expenses.toNumber(),
    netProfit: revenue.minus(expenses).toNumber(),
  };
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

