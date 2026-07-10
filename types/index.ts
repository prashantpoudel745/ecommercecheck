import { ReactNode } from "react";
export type ViewMode = "year" | "month" | "day";

export interface Employee {
  _id: string;
  name: string;
  department: string;
  position: string;
}
export interface InventoryItem {
  _id: string;
  id: string;
  name: string;
  quantity: number;
  price: number;
  clientname: string;
  status: "inStock" | "mediumStock" | "lowStock";
  category: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  companyName?: string;
  vatNo: string;
  status: "paid" | "due";
  value?: number;
  email?: string;
  phone?: string;
  notes?: string;
  updatedAt: string;
  empId: string;
}
export interface ItemFormData {
  itemName: string;
  quantity: string;
  price: string;
  amount: string;
  productCategory: string;
}

export interface CombinedDialogProps {
  onClientAdded?: (client: Client) => void;
  onTransactionAdded?: (transaction: Transaction) => void;
  onInventoryAdded?: (inventory: InventoryItem) => void;
  buttonLabel?: string;
  variant?: "default" | "outline";
}
export interface Transaction {
  id: string;
  date: string;
  description: string;
  clientname?: string;
  category?: string;
  amount: number;
  type: string; // Changed from literal to string for more flexibility
  updatedAt?: string;
  updatedBy?: string;
}


export interface User {
  _id: string;
  username: string;
  email: string;
}

export interface AttendanceData {
  data: any; // temporarily any to support both flat and grouped
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  summary: {
    totalRecords: number;
    uniqueEmployees: number;
    presentDays: number;
    lateDays: number;
    halfDays: number;
    overtimeDays: number;
    totalHours: number;
    avgHours: number;
    attendanceRate: number;
  };
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

export interface AttendanceRecord {
  _id: string;
  employee: Employee;
  user: User;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: "present" | "late" | "half-day" | "overtime";
  totalWorkHours?: number;
  workingHours?: {
    actual: number;
    expected: number;
  };
  notes?: string;
  location?: {
    type: string;
    coordinates?: number[];
  };
  breaks?: Array<{
    start: string;
    end: string;
    duration: number;
  }>;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  lateDays: number;
  halfDays: number;
  overtimeDays: number;
  totalHours: number;
  avgHours: number;
}

export interface CurrentStatus {
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  attendance?: AttendanceRecord;
  canCheckIn: boolean;
  canCheckOut: boolean;
}

export interface AttendanceResponse {
  success: boolean;
  message: string;
  data: AttendanceRecord;
  warnings?: string[];
}

export interface AttendanceListResponse {
  success: boolean;
  data: AttendanceRecord[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export interface AttendanceFilters {
  startDate: string;
  endDate: string;
  status: string;
  department: string;
  employeeId: string;
  groupBy: "employee" | "date" | "department" | "none";
}

export interface AttendanceData {
  data: any;
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  summary: {
    totalRecords: number;
    uniqueEmployees: number;
    presentDays: number;
    lateDays: number;
    halfDays: number;
    overtimeDays: number;
    totalHours: number;
    avgHours: number;
    attendanceRate: number;
  };
  departmentSummary?: Record<string, any>;
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

export interface AttendUser {
  id: string;
  _id: string;
  fullName: string;
  email: string;
  role: "admin" | "employee" | "hr";
  companyName: string;
  companyprofileImage: string;
}

export interface FinancialDataItem {
  name: string;
  income: number;
  expenses: number;
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
  [key: string]: unknown;
}

export interface FinancialViewState {
  viewMode: ViewMode;
  selectedYear: string | null;
  selectedMonth: string | null;
}
export interface InventoryStatusData {
  category: string;
  totalItems: number;
  inStock: number;
  mediumStock: number;
  lowStock: number;
  items: InventoryItem[];
  names: string[];
}

export interface Activity {
  _id: string;
  name?: string;
  amount?: number;
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

export interface DeleteInventoryProps {
  productId: string;
  productName: string;
  onDelete: (productId: string) => void;
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
  maxStock: number;
}

export interface InventoryStats {
  totalProducts: number;
  lowStockItems: number;
  lowStockChange: number;
  inventoryValue: number;
  inventoryValueChange: number;
}

export interface UpdateInventoryProps {
  productId: string;
  productName: string;
  productCategory: string;
  productPrice: number;
  productQuantity: number;
  onUpdate: (updatedProduct: {
    _id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    status: "in-stock" | "low-stock" | "out-of-stock";
  }) => void;
}

export interface Investment {
  amount: number;
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

// types/target.ts
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

// types.ts
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