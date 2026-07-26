import { ReactNode } from "react";
export type Decimal128Json = { $numberDecimal: string };
export type DecimalValue = number | string | Decimal128Json;
export type ViewMode = "year" | "month" | "day";
import {AttendanceData} from "./attendance.types"
import { InventoryItem } from "./inventory.types";
import { Customer } from "./customer.types";
export interface Client {
  id: string;
  name: string;
  companyName?: string;
  vatNo: string;
  status: "paid" | "due";
  value?: DecimalValue;
  email?: string;
  phone?: string;
  notes?: string;
  updatedAt: string;
  empId: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  clientname?: string;
  category?: string;
  amount: DecimalValue;
  type: string; // Changed from literal to string for more flexibility
  updatedAt?: string;
  updatedBy?: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
}

export interface Props {
  data: AttendanceData | null;
  loading: boolean;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRefresh: () => void;
  groupBy: string;
}
export interface User {
  _id: string;
  username: string;
  email: string;
}
export interface DashboardData {
  todayOverview: {
    total: number;
    present: number;
    late: number;
    halfDay: number;
    overtime: number;
    absent: number;
    attendanceRate: string;
  };
  weeklyTrends: any[];
  lateArrivals: any[];
  notCheckedIn: any[];
  lastUpdated: string;
}
export interface FinancialDataItem {
  name: string;
  income: number;
  expenses: number;
  incomeWithTax?: number;
  expensesWithTax?: number;
  fullName: string;
  originalDate?: Date;
  monthKey?: string;
  netReal?: number;
  net?: number;
}

export interface BackendDataItem {
  date: string;
  sales: number;
  expenses: number;
  salesWithTax?: number;
  expensesWithTax?: number;
  [key: string]: unknown;
}
export interface FinancialViewState {
  viewMode: ViewMode;
  selectedYear: string | null;
  selectedMonth: string | null;
}
export interface Activity {
  _id: string;
  name?: string;
  amount?: DecimalValue;
  quantity?: number;
  category?: string;
  collection: "accounting" | "inventory";
  action: string;
  createdAt: string;
}
export interface FinancialOverviewPageProps {
  userId: string;
  onViewChange?: (state: FinancialViewState) => void;
}
export interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
  icon?: ReactNode;
  className?: string;
  details?: ReactNode;
}
export interface Investment {
  amount: DecimalValue;
  category: string;
  clientname: string;
  createdAt: string;
  date: string;
  returns: number | string; // Allow for string in case backend sends strings
  description: string;
  updatedAt: string;
  userId: string;
  __v: number;
  _id: string;
}
export interface CalculatedStats {
  totalInvestments: number;
  activeClients: number;
  potentialLeads: number;
  avgReturn: number;
}
export interface DisplayStat {
  title: string;
  value: string;
  change: string;
  changeColor: string;
}
export interface ITargetPeriod {
  sales: number;
  inventory: number;
  clients: number;
}
export interface ITargetsPayload {
  monthly?: IMonthlyTargets;
  yearly?: ITargetPeriod;
}
export interface ITargetsResponse {
  monthly?: IMonthlyTargets;
  yearly?: ITargetPeriod;
}
export interface ITargetPeriod {
  sales: number;
  inventory: number;
  clients: number;
}

// New: Monthly targets per month
export interface IMonthlyTargets {
  JAN: number;
  FEB: number;
  MAR: number;
  APR: number;
  MAY: number;
  JUN: number;
  JUL: number;
  AUG: number;
  SEP: number;
  OCT: number;
  NOV: number;
  DEC: number;
}

export interface ITargetsResponse {
  monthly?: IMonthlyTargets;
  yearly?: ITargetPeriod;
}

export interface ITargetsPayload {
  monthly?: IMonthlyTargets;
  yearly?: ITargetPeriod;
}

export type FetchResult<T> =
  | { status: "success"; data: T }
  | { status: "empty" }
  | { status: "error"; message: string };

export type ModulePageFrameProps = {
  kicker: string;
  title: string;
  subtitle: string;
  chips?: string[];
  actions?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
};

export type KeepAlivePage = {
  id: string;
  paths: string[];
  render: () => ReactNode;
  roles?: string[];
};

export type ProtectedKeepAliveRouterProps = {
  pages: KeepAlivePage[];
  fallback: ReactNode;
};

export interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: "profile" | "password";
}

export type Snapshot = {
  generatedAt?: string;
  finance: {
    todayRevenue: number;
    todayExpenses: number;
    todayNet: number;
    yesterdayRevenue: number;
    yesterdayExpenses: number;
    yesterdayNet: number;
    monthRevenue: number;
    monthExpenses: number;
    monthNet: number;
    revenueDayDelta: number;
    netDayDelta: number;
    revenueMonthDeltaPercent: number;
    netMonthDeltaPercent: number;
  };
  inventory: {
    totalProducts: number;
    lowStockItems: InventoryItem[];
    outOfStockItems: InventoryItem[];
    inventoryValue: number;
    highestValueItems: InventoryItem[];
  };
  customers: {
    totalCustomers: number;
    dueCustomers: Customer[];
    totalDueAmount: number;
    totalPaidAmount: number;
  };
  employees: {
    totalEmployees: number;
    activeEmployees: number;
    departments: number;
  };
  attendance: {
    presentCount: number;
    lateCount: number;
    absentCount: number;
    overtimeCount: number;
    averageHours: number;
  };
  investments: {
    totalInvested: number;
    averageReturn: number;
    activeClients: number;
    totalCategories: number;
  };
  recommendations: string[];
};
