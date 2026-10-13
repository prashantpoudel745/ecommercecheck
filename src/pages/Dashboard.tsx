import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Search,
  Plus,
  ArrowUpRight,
  AlertTriangle,
  ChevronDown,
  Bell,
  Sparkles,
  ExternalLink,
  MoreHorizontal,
  X,
  Filter
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { formatCurrency } from "@/utils/formatCurrency";
import { CurrencyUtil } from "@/utils/currency.util";
import { useGlobalDataStore } from "@/store/GlobalDataStore";
import { useAuth } from "@/context/AuthContext";
import { getDashboardStats } from "@/services/accounting.service";
import { fetchInvoices } from "@/services/sales.service";
import { useAccounting } from "@/hooks/useAccounting";

export default function Dashboard() {
  const navigate = useNavigate();
  const { state, setDashboard } = useGlobalDataStore();
  const { user } = useAuth();
  const dashboardState = state.dashboard;
  const userId = user?._id || user?.id || user?.companyId;

  // Time filter state for chart
  const [timeFilter, setTimeFilter] = useState<"Today" | "30 Days" | "90 Days" | "1 Year" | "All Days">("30 Days");

  // Stock visualization filters
  const [stockSearchTerm, setStockSearchTerm] = useState("");
  const [stockCategoryFilter, setStockCategoryFilter] = useState("All");
  const [stockLevelFilter, setStockLevelFilter] = useState<"All" | "critical" | "low" | "healthy">("All");
  
  // Real daily accounting data from backend
  const [dailyData, setDailyData] = useState<any[]>([]);

  // Recent invoices state from backend
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  // Accounting stats hook from backend
  const { stats: accountingStats } = useAccounting();

  // Load accounting dashboard stats from backend
  const fetchTransactions = async () => {
    try {
      const statsData = await getDashboardStats();
      setDashboard((previous) => ({
        ...previous,
        stats: {
          totalRevenue: Number(statsData.revenue ?? 0),
          totalExpenses: Number(statsData.expenses ?? 0),
          totalRevenueWithTax: Number(statsData.revenueWithTax ?? statsData.revenue ?? 0),
          totalExpensesWithTax: Number(statsData.expensesWithTax ?? statsData.expenses ?? 0),
          netProfit: Number(statsData.netProfit ?? 0),
        },
      }));
    } catch {
      // quiet fallback
    }
  };

  // Load real Inventory products from backend
  const fetchInventory = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/inventory`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const Invdata = await response.json();
        setDashboard((previous) => ({
          ...previous,
          products: Invdata.inventory || [],
        }));
      }
    } catch {
      // quiet fallback
    }
  };

  // Load real sales invoices from backend
  const loadInvoices = async () => {
    try {
      setInvoicesLoading(true);
      const res = await fetchInvoices();
      if (res && res.data && Array.isArray(res.data)) {
        setInvoices(res.data.slice(0, 10));
      }
    } catch {
      // quiet fallback
    } finally {
      setInvoicesLoading(false);
    }
  };

  // Load real daily profit & loss series from backend
  useEffect(() => {
    if (!userId) return;
    fetch(`${import.meta.env.VITE_API_URL || ""}/api/accounting/getdailyaccounting/${userId}`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setDailyData(data);
        }
      })
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    fetchTransactions();
    fetchInventory();
    loadInvoices();
  }, []);

  const stats = dashboardState.stats;
  const products = dashboardState.products || [];

  // Actual Real Financial KPIs from Backend (NO fake fallback numbers)
  const grossRevenueVal = Number(stats.totalRevenue ?? 0);
  const netProfitVal = Number(stats.netProfit ?? 0);
  const arVal = Number(accountingStats?.accountsReceivable ?? 0);
  const apVal = Number(accountingStats?.accountsPayable ?? 0);
  
  // Real Nepal VAT Liability = Output VAT - Input VAT
  const vatLiability = useMemo(() => {
    const outputVat = Math.max(0, (stats.totalRevenueWithTax || 0) - (stats.totalRevenue || 0));
    const inputVat = Math.max(0, (stats.totalExpensesWithTax || 0) - (stats.totalExpenses || 0));
    return outputVat - inputVat;
  }, [stats]);

  // Actual Chart Data mapped directly from Backend daily accounting records
  const chartData = useMemo(() => {
    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const utcToday = now.toISOString().split("T")[0];

    // If "Today" is selected, strictly calculate today's transactions only (NOT past lifetime data)
    if (timeFilter === "Today") {
      // Find today's daily record from accounting vouchers
      const todayRecord = (dailyData || []).find(
        (d) => d.date === localToday || d.date === utcToday
      );

      // Check today's sales from invoices created today
      const todayInvoices = (invoices || []).filter((inv) => {
        const d = inv.date || inv.createdAt;
        if (!d) return false;
        const dStr =
          typeof d === "string"
            ? d.split("T")[0]
            : `${new Date(d).getFullYear()}-${String(new Date(d).getMonth() + 1).padStart(2, "0")}-${String(new Date(d).getDate()).padStart(2, "0")}`;
        return dStr === localToday || dStr === utcToday;
      });

      const todayInvoicedSales = todayInvoices.reduce((acc, inv) => {
        const amt = Number(inv.totalAmount?.$numberDecimal || inv.totalAmount || 0);
        return acc + (Number.isNaN(amt) ? 0 : amt);
      }, 0);

      const todayDailySales = todayRecord ? Math.abs(Number(todayRecord.sales || 0)) : 0;
      const todaySales = Math.max(todayDailySales, todayInvoicedSales);
      const todayExpenses = todayRecord ? Math.abs(Number(todayRecord.expenses || 0)) : 0;
      const todayCashflow = todaySales - todayExpenses;

      // Strictly return today's current data (from 0 to current today revenue/cashflow)
      return [
        { name: "00:00", revenue: 0, cashflow: 0 },
        { name: "Today (Current)", revenue: todaySales, cashflow: todayCashflow },
      ];
    }

    if (!dailyData || dailyData.length === 0) {
      if (timeFilter === "All Days") {
        return [
          { name: "Period Start", revenue: 0, cashflow: 0 },
          { name: "Current Date", revenue: grossRevenueVal, cashflow: netProfitVal },
        ];
      }
      return [
        { name: "Period Start", revenue: 0, cashflow: 0 },
        { name: "Period End", revenue: 0, cashflow: 0 },
      ];
    }

    let filtered = [...dailyData];

    if (timeFilter === "30 Days") {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = dailyData.filter((d) => new Date(d.date) >= cutoff);
    } else if (timeFilter === "90 Days") {
      const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      filtered = dailyData.filter((d) => new Date(d.date) >= cutoff);
    } else if (timeFilter === "1 Year") {
      const cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      filtered = dailyData.filter((d) => new Date(d.date) >= cutoff);
    }

    // Sort chronologically
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (filtered.length === 0) {
      if (timeFilter === "All Days") {
        return [
          { name: "Period Start", revenue: 0, cashflow: 0 },
          { name: "Current Date", revenue: grossRevenueVal, cashflow: netProfitVal },
        ];
      }
      return [
        { name: "Period Start", revenue: 0, cashflow: 0 },
        { name: "Period End", revenue: 0, cashflow: 0 },
      ];
    }

    return filtered.map((d) => {
      const sales = Math.abs(Number(d.sales || 0));
      const exp = Math.abs(Number(d.expenses || 0));
      return {
        name: d.date ? (d.date.length > 5 ? d.date.slice(5) : d.date) : "N/A",
        revenue: sales,
        cashflow: sales - exp,
      };
    });
  }, [dailyData, invoices, timeFilter, grossRevenueVal, netProfitVal]);

  // Selected period total revenue calculation
  const selectedPeriodRevenue = useMemo(() => {
    if (timeFilter === "Today") {
      return chartData[chartData.length - 1]?.revenue || 0;
    }
    if (timeFilter === "All Days") {
      return grossRevenueVal;
    }
    return chartData.reduce((acc, cur) => acc + (cur.revenue || 0), 0);
  }, [chartData, timeFilter, grossRevenueVal]);

  // Real Low Stock Items directly from Database
  const lowStockAlerts = useMemo(() => {
    return products.filter((p: any) => (p.quantity ?? 0) <= 30).slice(0, 5);
  }, [products]);

  // Unique categories list from products
  const stockCategories = useMemo(() => {
    if (!products || products.length === 0) return [];
    const cats = new Set<string>();
    products.forEach((p: any) => {
      if (p.category && typeof p.category === "string" && p.category.trim()) {
        cats.add(p.category.trim());
      }
    });
    return Array.from(cats).sort();
  }, [products]);

  // Real Stock Bar Chart Data directly from Inventory database, filtered by keywords / category / level
  const stockChartData = useMemo(() => {
    if (!products || products.length === 0) return [];

    let filtered = [...products];

    // Keyword search (filters item name or category)
    if (stockSearchTerm.trim()) {
      const q = stockSearchTerm.toLowerCase().trim();
      filtered = filtered.filter((p: any) => {
        const nameMatch = (p.name || "").toLowerCase().includes(q);
        const catMatch = (p.category || "").toLowerCase().includes(q);
        return nameMatch || catMatch;
      });
    }

    // Category dropdown filter
    if (stockCategoryFilter !== "All") {
      filtered = filtered.filter(
        (p: any) => (p.category || "").toLowerCase() === stockCategoryFilter.toLowerCase()
      );
    }

    // Stock level filter
    if (stockLevelFilter === "critical") {
      filtered = filtered.filter((p: any) => Number(p.quantity ?? 0) <= 10);
    } else if (stockLevelFilter === "low") {
      filtered = filtered.filter((p: any) => {
        const qty = Number(p.quantity ?? 0);
        return qty > 10 && qty <= 30;
      });
    } else if (stockLevelFilter === "healthy") {
      filtered = filtered.filter((p: any) => Number(p.quantity ?? 0) > 30);
    }

    // Sort products by quantity ascending to highlight critical/lacking products first
    const sorted = filtered.sort((a: any, b: any) => Number(a.quantity ?? 0) - Number(b.quantity ?? 0));

    return sorted.map((p: any) => {
      const qty = Number(p.quantity || 0);
      let status = "Healthy";
      let color = "#10b981"; // Emerald green for healthy stock

      if (qty === 0) {
        status = "Out of Stock";
        color = "#e11d48"; // Rose-600 for out of stock
      } else if (qty <= 10) {
        status = "Critical Low";
        color = "#f97316"; // Orange-500 for critical
      } else if (qty <= 30) {
        status = "Low Stock";
        color = "#f59e0b"; // Amber-500 for low
      }

      return {
        name: p.name && p.name.length > 14 ? `${p.name.slice(0, 12)}…` : p.name || "Item",
        fullName: p.name || "Item",
        quantity: qty,
        category: p.category || "General",
        price: p.price || 0,
        status,
        color,
      };
    });
  }, [products, stockSearchTerm, stockCategoryFilter, stockLevelFilter]);

  // Real Checklist Dynamic Calculation
  const hasInvoices = invoices.length > 0;
  const hasProducts = products.length > 0;
  const checklist = {
    ird: true, // System built compliant
    cbms: true, // CBMS integration layer active
    reconciliation: arVal > 0 || apVal > 0 || grossRevenueVal > 0,
    compliance: hasInvoices && hasProducts,
  };
  const completedChecks = Object.values(checklist).filter(Boolean).length;
  const checklistPercent = Math.round((completedChecks / 4) * 100);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-3 sm:p-5 lg:p-6 text-slate-900 bg-slate-50/50 min-h-screen">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* 1: Gross Revenue */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">
            Gross Revenue
          </p>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-slate-900 tabular-nums">
              {formatCurrency(grossRevenueVal)}
            </span>
            <span className="text-xs font-bold text-slate-400">NPR</span>
          </div>
        </div>

        {/* 2: Net Profit */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">
            Net Profit
          </p>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className={`text-xl font-bold tracking-tight tabular-nums ${netProfitVal >= 0 ? "text-slate-900" : "text-rose-600"}`}>
              {formatCurrency(netProfitVal)}
            </span>
            <span className="text-xs font-bold text-slate-400">NPR</span>
          </div>
        </div>

        {/* 3: Accounts Receivable */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">
            Accounts Receivable
          </p>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-slate-900 tabular-nums">
              {formatCurrency(arVal)}
            </span>
            <span className="text-xs font-bold text-slate-400">NPR</span>
          </div>
        </div>

        {/* 4: Accounts Payable */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">
            Accounts Payable
          </p>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-slate-900 tabular-nums">
              {formatCurrency(apVal)}
            </span>
            <span className="text-xs font-bold text-slate-400">NPR</span>
          </div>
        </div>

        {/* 5: Nepal VAT Liability */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 truncate">
            Nepal VAT Liability
          </p>
          <p className="text-[10px] text-slate-400 -mt-0.5">
            (Output vs Input VAT)
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-slate-900 tabular-nums">
              {formatCurrency(Math.abs(vatLiability))}
            </span>
            <span className="text-xs font-bold text-slate-400">NPR</span>
          </div>
        </div>

      </div>

      {/* ── Main 2-Column Split (Left 68% / Right 32%) ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ── Left Column (Main Charts & Tables) ────────────────────── */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Card 1: Cash Flow & Revenue Smooth Area Chart (Live Backend Data) */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Cash Flow & Revenue
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
                    {timeFilter === "Today" ? "Today: " : `${timeFilter}: `}
                    {formatCurrency(selectedPeriodRevenue)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {timeFilter === "Today"
                    ? "Live disbursements and sales generated today only"
                    : "Actual backend ledger disbursements and sales activity"}
                </p>
              </div>

              {/* Timeframe Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80 text-xs">
                {(["Today", "30 Days", "90 Days", "1 Year", "All Days"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      timeFilter === filter
                        ? "bg-white text-slate-900 shadow-2xs font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Smooth Recharts Spline Curve Area Chart */}
            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                    dy={5}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${val >= 1000 ? `${val / 1000}k` : val}`}
                  />
                  <Tooltip
                    formatter={(val: number) => [formatCurrency(val), "Revenue"]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      color: "#fff",
                      borderRadius: "8px",
                      fontSize: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 2: Inventory Stock Levels Bar Chart Visualization */}
          {/* Card 2: Inventory Stock Levels Visualization (Real DB Inventory items) */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            {/* Header: Title & Status Legend */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Inventory Stock Levels Visualization
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
                    {products.length} Products Cataloged
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual stock levels to quickly identify critical shortages vs healthy stock items
                </p>
              </div>

              {/* Status Legend */}
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1 text-rose-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-600 inline-block" />
                  Out / Critical (≤10)
                </span>
                <span className="flex items-center gap-1 text-amber-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" />
                  Low (11–30)
                </span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
                  Healthy (&gt;30)
                </span>
              </div>
            </div>

            {/* Interactive Search & Filter Toolbar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 mb-4 p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg">
              {/* Keyword Search Input */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={stockSearchTerm}
                  onChange={(e) => setStockSearchTerm(e.target.value)}
                  placeholder="Filter by item name or category keywords..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
                {stockSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setStockSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                    title="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Category Dropdown */}
                {stockCategories.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">Category:</span>
                    <select
                      value={stockCategoryFilter}
                      onChange={(e) => setStockCategoryFilter(e.target.value)}
                      className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                    >
                      <option value="All">All Categories ({stockCategories.length})</option>
                      {stockCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Stock Level Filter Dropdown */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">Level:</span>
                  <select
                    value={stockLevelFilter}
                    onChange={(e) => setStockLevelFilter(e.target.value as any)}
                    className="text-xs bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="All">All Stock Levels</option>
                    <option value="critical">Critical / Out (≤10)</option>
                    <option value="low">Low Stock (11–30)</option>
                    <option value="healthy">Healthy Stock (&gt;30)</option>
                  </select>
                </div>

                {/* Reset Filters Button */}
                {(stockSearchTerm.trim() !== "" || stockCategoryFilter !== "All" || stockLevelFilter !== "All") && (
                  <button
                    type="button"
                    onClick={() => {
                      setStockSearchTerm("");
                      setStockCategoryFilter("All");
                      setStockLevelFilter("All");
                    }}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1.5 rounded-md border border-rose-200 transition-colors flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Reset
                  </button>
                )}

                {/* Count badge */}
                <span className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 rounded-md px-2 py-1 whitespace-nowrap">
                  Showing <strong className="text-slate-900">{stockChartData.length}</strong> of {products.length}
                </span>
              </div>
            </div>

            {stockChartData.length > 0 ? (
              <div className="w-full overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-200">
                <div
                  style={{
                    width: stockChartData.length <= 12 ? "100%" : `${Math.max(650, stockChartData.length * 55)}px`,
                    minWidth: "100%",
                  }}
                  className="h-64 sm:h-72"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stockChartData} margin={{ top: 10, right: 15, left: -15, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: "#e2e8f0" }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-lg bg-slate-900 p-3 text-white text-xs shadow-lg border border-slate-800 space-y-1">
                                <p className="font-bold text-slate-100">{data.fullName}</p>
                                <div className="flex items-center justify-between gap-4 text-slate-300">
                                  <span>Quantity in Stock:</span>
                                  <span className="font-bold text-white tabular-nums">{data.quantity} units</span>
                                </div>
                                <div className="flex items-center justify-between gap-4 text-slate-300">
                                  <span>Category:</span>
                                  <span>{data.category}</span>
                                </div>
                                <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800 text-[11px]">
                                  <span>Stock Status:</span>
                                  <span className="font-bold" style={{ color: data.color }}>
                                    {data.status}
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="quantity" radius={[4, 4, 0, 0]} maxBarSize={48}>
                        {stockChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : products.length > 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                <p className="text-sm font-semibold text-slate-700">No stock items match your search filter</p>
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting or clearing your keywords/filters to view other inventory items.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStockSearchTerm("");
                    setStockCategoryFilter("All");
                    setStockLevelFilter("All");
                  }}
                  className="mt-3 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs"
                >
                  Clear Filters (Show all {products.length} items)
                </button>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                <p className="text-sm font-semibold text-slate-600">No inventory products recorded yet</p>
                <p className="text-xs text-slate-400 mt-1">Add items in your Inventory module to populate the stock bar chart.</p>
                <Link to="/inventory">
                  <button className="mt-3 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs">
                    + Add Inventory Product
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Card 3: Recent Invoices & Transactions Table (Live Backend Invoices) */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Recent Tax Invoices & Transactions
                </h3>
                <p className="text-xs text-slate-500">
                  Live entries fetched directly from your billing database
                </p>
              </div>
              <Link
                to="/sales/invoice"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View all invoices</span>
                <ExternalLink size={12} />
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-2 w-8">
                    </th>
                    <th className="py-2.5 px-2">Invoice No. ↑</th>
                    <th className="py-2.5 px-2">Customer Name</th>
                    <th className="py-2.5 px-2">PAN</th>
                    <th className="py-2.5 px-2">Amount (NPR)</th>
                    <th className="py-2.5 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoicesLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Loading invoices from server...
                      </td>
                    </tr>
                  ) : invoices.length > 0 ? (
                    invoices.map((inv, idx) => (
                      <tr key={inv._id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-2">
                        </td>
                        <td className="py-3 px-2 font-semibold text-slate-900">
                          {inv.invoiceNumber || `INV-${inv._id?.slice(-8)}`}
                        </td>
                        <td className="py-3 px-2 text-slate-700 font-medium">
                          {inv.customerName || "Customer"}
                        </td>
                        <td className="py-3 px-2 text-slate-500 font-mono text-[11px]">
                          {inv.buyerPAN || "-"}
                        </td>
                        <td className="py-3 px-2 font-semibold text-slate-900 tabular-nums">
                          NPR {CurrencyUtil.format(inv.totalAmount || 0)}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.paymentStatus === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {inv.irdSyncStatus === "SYNCED" ? "CBMS SYNCED" : inv.paymentStatus === "PAID" ? "PAID" : "RECORDED"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        <p className="font-semibold text-slate-600">No invoices recorded yet in database</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Click below to issue your first tax invoice
                        </p>
                        <Link to="/sales/invoice/new">
                          <button className="mt-3 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg">
                            + New Tax Invoice
                          </button>
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* ── Right Column (IRD Compliance, Quick Actions, Alerts) ──── */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Card 3: IRD Compliance Checklist & Anusuchi 8/9 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-600">
                Quick Actions
              </span>
            </div>            

            {/* Quick Action Grid */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                Quick Action
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/sales/invoice/new"
                  className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
                >
                  <Plus size={13} className="text-slate-500" />
                  <span className="truncate">New Invoice</span>
                </Link>

                <Link
                  to="/accounting/financial-reports"
                  className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
                >
                  <ArrowUpRight size={13} className="text-slate-500" />
                  <span className="truncate">Quick profit</span>
                </Link>

                <Link
                  to="/accounting/journal-vouchers"
                  className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
                >
                  <Sparkles size={13} className="text-slate-500" />
                  <span className="truncate">Voucher Book</span>
                </Link>

                <Link
                  to="/inventory"
                  className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
                >
                  <Bell size={13} className="text-slate-500" />
                  <span className="truncate">Inventory alerts</span>
                </Link>
              </div>

              <Link
                to="/settings/company"
                className="mt-2 w-full flex items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
              >
                <span>Manage CBMS credentials</span>
              </Link>
            </div>
          </div>

          {/* Card 4: Inventory Alerts (Real Products from Backend) */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                <AlertTriangle size={14} className="text-amber-500" />
                <span>Inventory Alerts</span>
              </div>
              <Link to="/inventory" className="text-[11px] font-semibold text-indigo-600 hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-2.5">
              {lowStockAlerts.length > 0 ? (
                lowStockAlerts.map((prod) => (
                  <div key={prod._id} className="p-2.5 rounded-lg border border-amber-200/80 bg-amber-50/50 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900 truncate max-w-[170px]">
                        {prod.name}
                      </p>
                      <p className="text-[11px] text-amber-700">
                        {prod.quantity === 0 ? "Out of stock (0 units)" : `${prod.quantity} units remaining`}
                      </p>
                    </div>
                    <Link
                      to="/inventory"
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 shrink-0 hover:bg-amber-300"
                    >
                      Reorder
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/60 text-emerald-800 text-xs flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>All cataloged items are currently within safe inventory thresholds.</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
