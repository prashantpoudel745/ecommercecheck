import React, { useState, useEffect, useMemo } from "react";
import { formatCurrencyShort } from "@/utils/formatCurrency";
import { Target } from "lucide-react";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { Product, Transaction } from "../../types";
import TargetSettingsDialog from "@/components/prediction/targetsettingdialog";

// ✅ Recharts imports
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_BASE = import.meta.env.VITE_API_URL;

export default function UnifiedDashboard() {
  // === ACCOUNTING STATE ===
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
  });

  // === INVENTORY STATE ===
  const [products, setProducts] = useState<Product[]>([]);
  const [inventoryValue, setInventoryValue] = useState(0);
  const [dailyAccounting, setDailyAccounting] = useState<{ date: string; sales: number }[]>([]);
  const [lowStockItems, setLowStockItems] = useState(0);
  const [clientId, setClientId] = useState("");

  // === TARGETS STATE ===
  const [targets, setTargets] = useState({
    monthly: {
      sales: 0,
      inventory: 0,
      clients: 0,
    },
    yearly: {
      sales: 0,
      inventory: 0,
      clients: 0,
    },
  });

  // === SHARED STATE ===
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"month" | "year">("month");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const[clients,setClients]=useState([]);
  const user = localStorage.getItem("user");
  const userId = user
    ? JSON.parse(user)._id || JSON.parse(user).companyId
    : null;

  const resolveTargetMetric = (
    targetSection: any,
    period: "month" | "year"
  ) => {
    const fallback = {
      sales: Number(targetSection?.sales ?? 0),
      inventory: Number(targetSection?.inventory ?? 0),
      clients: Number(targetSection?.clients ?? 0),
    };

    if (!targetSection) return fallback;

    const mode = targetSection?.mode;

    if (period === "month" && mode === "custom" && Array.isArray(targetSection?.monthlyTargets)) {
      const nowMonth = new Date().getMonth();
      const monthTarget = targetSection.monthlyTargets[nowMonth];
      return {
        sales: Number(monthTarget?.sales ?? fallback.sales),
        inventory: Number(monthTarget?.inventory ?? fallback.inventory),
        clients: Number(monthTarget?.clients ?? fallback.clients),
      };
    }

    if (period === "year" && mode === "custom" && Array.isArray(targetSection?.yearlyTargets)) {
      const nowYear = new Date().getFullYear();
      const yearTarget = targetSection.yearlyTargets.find((entry: any) => Number(entry?.year) === nowYear);
      return {
        sales: Number(yearTarget?.sales ?? fallback.sales),
        inventory: Number(yearTarget?.inventory ?? fallback.inventory),
        clients: Number(yearTarget?.clients ?? fallback.clients),
      };
    }

    if (targetSection?.uniformTarget) {
      return {
        sales: Number(targetSection.uniformTarget.sales ?? fallback.sales),
        inventory: Number(targetSection.uniformTarget.inventory ?? fallback.inventory),
        clients: Number(targetSection.uniformTarget.clients ?? fallback.clients),
      };
    }

    return fallback;
  };

  // === HELPER: Aggregate daily → monthly ===
  const aggregateDailyToMonthly = (dailyData: { date: string; sales: number }[]) => {
    const monthlyMap: Record<string, number> = {};
    dailyData.forEach((entry) => {
      if (!entry.date || entry.sales == null) return;
      const monthKey = entry.date.substring(0, 7); // "YYYY-MM"
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + entry.sales;
    });
    return Object.entries(monthlyMap)
      .map(([month, revenue]) => ({ month, revenue: Math.round(revenue) }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const aggregateDailyToYearly = (dailyData: { date: string; sales: number }[]) => {
    const yearlyMap: Record<string, number> = {};
    dailyData.forEach((entry) => {
      if (!entry.date || entry.sales == null) return;
      const yearKey = entry.date.substring(0, 4); // "YYYY"
      yearlyMap[yearKey] = (yearlyMap[yearKey] || 0) + entry.sales;
    });
    return Object.entries(yearlyMap)
      .map(([year, revenue]) => ({ year, revenue: Math.round(revenue) }))
      .sort((a, b) => a.year.localeCompare(b.year));
  };

  // === FETCH TRANSACTIONS ===
  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/accounting`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch transactions");
      const data = await response.json();
      const account = data.account || [];

      let totalRevenue = 0;
      let totalExpenses = 0;
      account.forEach((transaction: Transaction) => {
        const type = (transaction.type || "").toLowerCase();
        const category = (transaction.category || "").toLowerCase();
        if (type === "sales" || category === "sales") {
          totalRevenue += Math.abs(transaction.amount);
        } else if (type === "expenses" || category === "expenses") {
          totalExpenses += Math.abs(transaction.amount);
        }
      });
      setStats({ totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses });
    } catch (err) {
      toast.error("Failed to load transactions");
    }
  };

  // === FETCH INVENTORY ===
  const fetchInventory = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/inventory`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch inventory");

      const Invdata = await response.json();
      const products = Invdata.inventory || [];

      const totalValue = products.reduce((sum, p) => {
        const price = typeof p.price === "number" ? p.price : 0;
        const qty = typeof p.quantity === "number" ? p.quantity : 0;
        return sum + price * qty;
      }, 0);
      const lowStock = products.filter(
        (p) => typeof p.quantity === "number" && p.quantity < 30
      ).length;

      const user = localStorage.getItem("user");
      const userId = user ? JSON.parse(user)._id : "";
      setClientId(userId);
      setProducts(products);
      setInventoryValue(totalValue);
      setLowStockItems(lowStock);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setProducts([]);
      setInventoryValue(0);
      setLowStockItems(0);
    }
  };

  // === FETCH PERFORMANCE DATA (including targets) ===
  const fetchPerformanceData = async () => {
    try {
      const [accountingRes, targetsRes] = await Promise.all([
        fetch(`${API_BASE}/api/accounting/getdailyaccounting/${userId}`, {
          credentials: "include",
        }),
        fetch(`${API_BASE}/api/performance/targets`, {
          credentials: "include",
        }),
      ]);

      const dailyAccounting = accountingRes.ok ? await accountingRes.json() : [];
      const targetData = targetsRes.ok ? await targetsRes.json() : {};

      setDailyAccounting(dailyAccounting);

      const monthlyMetric = resolveTargetMetric(targetData.monthly, "month");
      const yearlyMetric = resolveTargetMetric(targetData.yearly, "year");

      // ✅ SET TARGETS STATE FROM API
      setTargets({
        monthly: {
          sales: monthlyMetric.sales,
          inventory: monthlyMetric.inventory,
          clients: monthlyMetric.clients,
        },
        yearly: {
          sales: yearlyMetric.sales,
          inventory: yearlyMetric.inventory,
          clients: yearlyMetric.clients,
        },
      });
    } catch (err) {
      toast.error("Failed to load performance data");
    }
  };

  // === HANDLE SAVE FROM DIALOG ===
  const handleSaveTargets = async (payload) => {
    try {
      const res = await fetch(`${API_BASE}/api/performance/targets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success("Targets updated!");
        setIsDialogOpen(false);
        await fetchPerformanceData();
      } else {
        toast.error("Failed to save targets");
      }
    } catch (e) {
      toast.error("Network error");
    }
  };
  const fetchClients = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/customer`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch clients");
      const data = await res.json();
      setClients(data.clients || []);
    } catch (err) {
      toast.error("Failed to load clients");
      return [];
    }
  };

  const getClientsByTimeframe = (
  clients,
  timeframe: "month" | "year"
) => {
  const now = new Date();

  return clients.filter((client) => {
    if (!client.createdAt) return false;

    const created = new Date(client.createdAt);

    if (timeframe === "month") {
      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    }

    // yearly
    return created.getFullYear() === now.getFullYear();
  }).length;
};

  // === EFFECTS ===
  useEffect(() => {
    if (user) {
      const parsed = JSON.parse(user);
      localStorage.setItem("plan", parsed.plan || "");
    }
    Promise.all([fetchTransactions(), fetchInventory(), fetchPerformanceData(),fetchClients()]).finally(() =>
      setLoading(false)
    );
  }, []);

  // === HELPERS ===

  const monthlyHistory = aggregateDailyToMonthly(dailyAccounting);
  const yearlyHistory = aggregateDailyToYearly(dailyAccounting);

  const selectedChartData = useMemo(() => {
    if (timeframe === "month") {
      return monthlyHistory.map((m) => ({
        label: new Date(`${m.month}-01`).toLocaleString("default", {
          month: "short",
          year: "2-digit",
        }),
        actualRevenue: m.revenue || 0,
        goalRevenue: targets.monthly.sales,
      }));
    }

    return yearlyHistory.map((y) => ({
      label: y.year,
      actualRevenue: y.revenue || 0,
      goalRevenue: targets.yearly.sales,
    }));
  }, [monthlyHistory, yearlyHistory, targets.monthly.sales, targets.yearly.sales, timeframe]);

  const getMetricByPeriod = (period: "month" | "year") => {
    const salesGoal = period === "month" ? targets.monthly.sales : targets.yearly.sales;
    const inventoryGoal = period === "month" ? targets.monthly.inventory : targets.yearly.inventory;
    const clientsGoal = period === "month" ? targets.monthly.clients : targets.yearly.clients;

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const currentYearKey = String(now.getFullYear());

    const actualRevenue = period === "month"
      ? monthlyHistory.find((m) => m.month === currentMonthKey)?.revenue || 0
      : yearlyHistory.find((y) => y.year === currentYearKey)?.revenue || 0;
    const revenueProgress = salesGoal > 0 ? Math.min(100, (actualRevenue / salesGoal) * 100) : 0;

    const inventoryProgress = inventoryGoal > 0
      ? Math.min(100, (inventoryValue / inventoryGoal) * 100)
      : 0;

    const clientCount = getClientsByTimeframe(clients, period);
    const clientProgress = clientsGoal > 0 ? Math.min(100, (clientCount / clientsGoal) * 100) : 0;

    return {
      salesGoal,
      inventoryGoal,
      clientsGoal,
      actualRevenue,
      revenueProgress,
      inventoryProgress,
      clientCount,
      clientProgress,
    };
  };

  const monthlyMetrics = getMetricByPeriod("month");
  const yearlyMetrics = getMetricByPeriod("year");


  // === RENDER ===
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 backdrop-blur-sm">
        <ClipLoader color="#6366f1" size={40} />
      </div>
    );
  }

  return (
    <div className="p-1 sm:p-4 space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-sky-50 via-cyan-50 to-indigo-50 px-4 py-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Goals</h1>
            <p className="text-sm text-slate-600">Track progress against monthly and yearly targets in separate views.</p>
          </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 shadow"
        >
          <Target size={16} />
          Set Targets
        </button>
        </div>
      </div>

      {/* === PERFORMANCE SECTION === */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Performance Dashboard
          </h2>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-full p-1">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                timeframe === "month"
                  ? "bg-slate-900 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
              onClick={() => setTimeframe("month")}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                timeframe === "year"
                  ? "bg-slate-900 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
              onClick={() => setTimeframe("year")}
            >
              Yearly
            </button>
          </div>
        </div>

        <p className="text-center text-gray-600 dark:text-gray-400 mb-1 text-sm">
          Revenue trend with {timeframe === "month" ? "monthly" : "yearly"} target line
        </p>

        {/* ✅ RECHARTS LINE CHART */}
        <div className="h-80 mb-1 p-3 rounded-lg bg-slate-50/60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={selectedChartData}
              margin={{ top: 10, right: 30, left: 30, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" />
              <YAxis
                tickFormatter={(value) =>
                  formatCurrencyShort(value).replace(/\.00$/, "")
                }
              />
              <Tooltip
                formatter={(value) => [formatCurrencyShort(Number(value)), ""]}
                labelFormatter={(label) => `${timeframe === "month" ? "Month" : "Year"}: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="actualRevenue"
                name="Actual Revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="goalRevenue"
                name={timeframe === "month" ? "Monthly Goal Revenue" : "Yearly Goal Revenue"}
                stroke="#10b981"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Monthly Goals</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-lg border border-blue-100">
              <p className="text-xs uppercase tracking-wide text-slate-500">Revenue</p>
              <p className="font-bold text-slate-900">{formatCurrencyShort(monthlyMetrics.actualRevenue)}</p>
              <p className="text-xs text-slate-500">Goal: {monthlyMetrics.salesGoal > 0 ? formatCurrencyShort(monthlyMetrics.salesGoal) : "Not set"}</p>
              <div className="mt-2 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-blue-600" style={{ width: `${monthlyMetrics.revenueProgress}%` }} /></div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100">
              <p className="text-xs uppercase tracking-wide text-slate-500">Inventory</p>
              <p className="font-bold text-slate-900">{formatCurrencyShort(inventoryValue)}</p>
              <p className="text-xs text-slate-500">Goal: {monthlyMetrics.inventoryGoal > 0 ? formatCurrencyShort(monthlyMetrics.inventoryGoal) : "Not set"}</p>
              <div className="mt-2 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-cyan-600" style={{ width: `${monthlyMetrics.inventoryProgress}%` }} /></div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100">
              <p className="text-xs uppercase tracking-wide text-slate-500">Clients</p>
              <p className="font-bold text-slate-900">{monthlyMetrics.clientCount}</p>
              <p className="text-xs text-slate-500">Goal: {monthlyMetrics.clientsGoal || 0}</p>
              <div className="mt-2 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-indigo-600" style={{ width: `${monthlyMetrics.clientProgress}%` }} /></div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-emerald-900 mb-3">Yearly Goals</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-lg border border-emerald-100">
              <p className="text-xs uppercase tracking-wide text-slate-500">Revenue</p>
              <p className="font-bold text-slate-900">{formatCurrencyShort(yearlyMetrics.actualRevenue)}</p>
              <p className="text-xs text-slate-500">Goal: {yearlyMetrics.salesGoal > 0 ? formatCurrencyShort(yearlyMetrics.salesGoal) : "Not set"}</p>
              <div className="mt-2 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-emerald-600" style={{ width: `${yearlyMetrics.revenueProgress}%` }} /></div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-emerald-100">
              <p className="text-xs uppercase tracking-wide text-slate-500">Inventory</p>
              <p className="font-bold text-slate-900">{formatCurrencyShort(inventoryValue)}</p>
              <p className="text-xs text-slate-500">Goal: {yearlyMetrics.inventoryGoal > 0 ? formatCurrencyShort(yearlyMetrics.inventoryGoal) : "Not set"}</p>
              <div className="mt-2 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-teal-600" style={{ width: `${yearlyMetrics.inventoryProgress}%` }} /></div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-emerald-100">
              <p className="text-xs uppercase tracking-wide text-slate-500">Clients</p>
              <p className="font-bold text-slate-900">{yearlyMetrics.clientCount}</p>
              <p className="text-xs text-slate-500">Goal: {yearlyMetrics.clientsGoal || 0}</p>
              <div className="mt-2 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-green-600" style={{ width: `${yearlyMetrics.clientProgress}%` }} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* === TARGET DIALOG === */}
      <TargetSettingsDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveTargets}
      />
    </div>
  );
}
