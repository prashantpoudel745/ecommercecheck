export type ChatRole = "assistant" | "user";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt?: string;
};

export type StoredInsightMessage = {
  _id?: string;
  role?: string;
  content?: string;
  createdAt?: string;
};

export type Snapshot = {
  generatedAt?: string;
  finance?: {
    todayRevenue?: number;
    todayExpenses?: number;
    todayNet?: number;
    monthRevenue?: number;
    monthExpenses?: number;
    monthNet?: number;
    revenueMonthDeltaPercent?: number;
  };
  inventory?: {
    totalProducts?: number;
    lowStockItems?: Array<{ name: string; quantity: number }>;
    outOfStockItems?: Array<{ name: string; quantity: number }>;
    inventoryValue?: number;
  };
  customers?: {
    totalCustomers?: number;
    dueCustomers?: Array<{ name: string; companyName?: string }>;
    totalDueAmount?: number;
  };
  employees?: {
    totalEmployees?: number;
    activeEmployees?: number;
  };
  attendance?: {
    presentCount?: number;
    lateCount?: number;
    absentCount?: number;
    overtimeCount?: number;
    averageHours?: number;
  };
  investments?: {
    totalInvested?: number;
    averageReturn?: number;
    activeClients?: number;
    totalCategories?: number;
  };
  recommendations?: string[];
};