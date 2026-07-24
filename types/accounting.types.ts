export type Decimal128Json = { $numberDecimal: string };
export type DecimalValue = number | string | Decimal128Json;

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
