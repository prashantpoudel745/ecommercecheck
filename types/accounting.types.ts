export type Decimal128Json = { $numberDecimal: string };
export type DecimalValue = number | string | Decimal128Json;

export interface AccountingDashboardProps {
  startDate?: string;
  endDate?: string;
  dateRangeLabel?: string;
}
export interface AccountingStatsProps {
  stats: {
    totalRevenue: DecimalValue;
    totalExpenses: DecimalValue;
    totalRevenueWithTax?: DecimalValue;
    totalExpensesWithTax?: DecimalValue;
    netProfit: DecimalValue;
    accountsReceivable?: DecimalValue;
    accountsPayable?: DecimalValue;
    cashBalance?: DecimalValue;
  };
  startDate?: string;
  endDate?: string;
  dateRangeLabel?: string;
}

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
  openingBalance: DecimalValue;
  currentBalance: DecimalValue;
  currency: string;
  description?: string;
}

export interface VoucherEntry {
  account: Account | string;
  type: "DEBIT" | "CREDIT";
  amount: DecimalValue;
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
  totalAmount: DecimalValue;
  taxRate?: number;
  taxAmount?: DecimalValue;
  amountPaid: DecimalValue;
  amountDue: DecimalValue;
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
    debit: DecimalValue;
    credit: DecimalValue;
  }[];
  totalAmount: DecimalValue;
  status: string;
}

export interface AccountingStats {
  revenue: DecimalValue;
  expenses: DecimalValue;
  revenueWithTax?: DecimalValue;
  expensesWithTax?: DecimalValue;
  netProfit: DecimalValue;
  accountsReceivable: DecimalValue;
  accountsPayable: DecimalValue;
  cashBalance: DecimalValue;
}

export interface VatReport {
  period: {
    startDate?: string | null;
    endDate?: string | null;
  };
  taxableSales: DecimalValue;
  taxablePurchases: DecimalValue;
  outputVat: DecimalValue;
  inputVat: DecimalValue;
  netVatPayable: DecimalValue;
  netVatRefundable: DecimalValue;
  vouchers: Array<{
    voucherNumber: string;
    type: string;
    date: string;
    partyName?: string;
    taxableAmount: DecimalValue;
    outputVat: DecimalValue;
    inputVat: DecimalValue;
    totalAmount: DecimalValue;
  }>;
  outputVatVouchers?: Array<{
    voucherNumber: string;
    type: string;
    date: string;
    partyName?: string;
    taxableAmount: DecimalValue;
    outputVat: DecimalValue;
    inputVat: DecimalValue;
    totalAmount: DecimalValue;
  }>;
  inputVatVouchers?: Array<{
    voucherNumber: string;
    type: string;
    date: string;
    partyName?: string;
    taxableAmount: DecimalValue;
    outputVat: DecimalValue;
    inputVat: DecimalValue;
    totalAmount: DecimalValue;
  }>;
  summary?: {
    salesCount?: number;
    purchaseCount?: number;
    creditNoteCount?: number;
    debitNoteCount?: number;
  };
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
    trialBalanceDebit: DecimalValue;
    trialBalanceCredit: DecimalValue;
    trialDifference: DecimalValue;
    totalAssets: DecimalValue;
    totalLiabilitiesAndEquity: DecimalValue;
    outputVat: DecimalValue;
    inputVat: DecimalValue;
    netVatPayable: DecimalValue;
    netVatRefundable: DecimalValue;
    voucherCount: number;
    accountCount: number;
  };
  nepalContext: string[];
}

export interface TBAccount {
  name: string;
  group?: string;
  type?: string;
  debit?: DecimalValue;
  credit?: DecimalValue;
  debitAmount?: DecimalValue;
  creditAmount?: DecimalValue;
}
export interface FiscalPeriod {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isLocked: boolean;
  lockedAt?: string;
  lockedBy?: string;
}
export interface FinanceChartProps {
  data: Array<{
    name: string;
    income: number;
    expenses: number;
  }>;
}

export interface FinancialOverviewPageProps {
  userId: string;
  onViewChange?: (
    viewMode: "year" | "month" | "day",
    selectedYear: string | null,
    selectedMonth: string | null
  ) => void;
}

export interface TransactionFormData {
  clientName: string;
  companyName: string;
  vatNo: string;
  email: string;
  phone: string;
  notes: string;
  description: string;
  category: string;
  paymentStatus: "paid" | "partial" | "due";
  amountPaid: number;
  paymentAccountId: string;
  partyAccountGroupId?: string;
  vatBillNo: string;
  taxRate?: number;
  taxIncluded?: boolean;
  items: {
    itemName: string;
    quantity: number;
    price: number;
    amount: number;
    productCategory: string;
    vatExempt?: boolean;
  }[];
}
