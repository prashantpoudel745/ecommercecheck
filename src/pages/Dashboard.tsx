import {
  ChartBar,
  CreditCard,
  Database,
  DollarSign,
  Upload,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { Transaction } from "../../types";
import {
  FinancialOverviewSkeleton,
  InventoryStatusSkeleton,
  RecentActivitySkeleton,
} from "@/skeleton/dashboardSkeleton/dashboardSkeleton";
import { formatCurrency, formatCurrencyShort } from "@/utils/formatCurrency";
import { useGlobalDataStore } from "@/store/GlobalDataStore";
import { useAuth } from "@/context/AuthContext";
const API_BASE = import.meta.env.VITE_API_URL;

const FinancialOverviewPage = lazy(
  () => import("@/components/dashboard/FinancialOverviewPage")
);
const InventoryStatusChart = lazy(
  () => import("@/components/dashboard/InventoryStatus.tsx")
);
const RecentActivity = lazy(
  () => import("@/components/dashboard/RecentActivity")
);

export default function Dashboard() {
  const { state, setDashboard } = useGlobalDataStore();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dashboardState = state.dashboard;

  // Financial overview view state – lifted so InventoryStatusChart can sync
  const [financialViewMode, setFinancialViewMode] = useState<"year" | "month" | "day">("year");
  const [financialSelectedYear, setFinancialSelectedYear] = useState<string | null>(null);
  const [financialSelectedMonth, setFinancialSelectedMonth] = useState<string | null>(null);

  const handleFinancialViewChange = useCallback(
    (viewMode: "year" | "month" | "day", selectedYear: string | null, selectedMonth: string | null) => {
      setFinancialViewMode(viewMode);
      setFinancialSelectedYear(selectedYear);
      setFinancialSelectedMonth(selectedMonth);
    },
    []
  );

  const transactions = dashboardState.transactions;
  const stats = dashboardState.stats;

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/accounting`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();
      const account = data.account || [];

      let totalRevenue = 0;
      let totalExpenses = 0;

      account.forEach((transaction: Transaction) => {
        if (
          transaction.type === "sales" ||
          transaction.category.toLowerCase() === "sales"
        ) {
          totalRevenue += Math.abs(transaction.amount);
        } else if (
          transaction.type === "expenses" ||
          transaction.category.toLowerCase() === "expenses"
        ) {
          totalExpenses += Math.abs(transaction.amount);
        }
      });

      const netProfit = totalRevenue - totalExpenses;

      setDashboard((previous) => ({
        ...previous,
        transactions: account,
        stats: {
          totalRevenue,
          totalExpenses,
          netProfit,
        },
      }));
    } catch (error) {
      toast.error("Failed to load transactions");
      // console.error("Error fetching transactions:", error);
    }
  };

  const products = dashboardState.products;
  const clientId = dashboardState.clientId;
  const userId = user?._id || user?.id || user?.companyId;
  const sstats = dashboardState.inventoryStats;

  const fetchInventory = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/inventory`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Error fetching inventory: ${response.statusText}`);
      }
      const Invdata = await response.json();
      const data = Invdata.inventory;

      setDashboard((previous) => ({
        ...previous,
        clientId: userId,
        products: data,
        inventoryStats:
          data.stats || {
          totalProducts: 0,
          lowStockItems: 0,
          lowStockChange: 0,
          inventoryValue: 0,
          inventoryValueChange: 0,
          },
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch inventory data"
      );
      console.error("Failed to fetch inventory data:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let loaderTimer: ReturnType<typeof setTimeout> | null = null;

    const hasCachedData = dashboardState.lastFetched > 0;

    if (!hasCachedData) {
      setLoading(true);
      loaderTimer = setTimeout(() => {
        if (isMounted) {
          setShowLoadingOverlay(true);
        }
      }, 180);
    }

    const fetchAllData = async () => {
      await Promise.all([fetchTransactions(), fetchInventory()]);

      if (isMounted) {
        setDashboard((previous) => ({
          ...previous,
          lastFetched: Date.now(),
        }));
        setLoading(false);
        setShowLoadingOverlay(false);
      }
    };

    fetchAllData();

    return () => {
      isMounted = false;
      if (loaderTimer) {
        clearTimeout(loaderTimer);
      }
    };
  }, []);

  return (
    <div className="mx-auto max-w-[1520px] space-y-8 animate-fade-in px-0">
      {loading && showLoadingOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 backdrop-blur-sm">
          <ClipLoader color="#6366f1" size={40} />
        </div>
      )}
      
      <div className="flex flex-col space-y-2 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          Dashboard Overview
        </h1>
        <p className="text-sm text-slate-600">
          Here's what's happening with your business today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <StatCard
          className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign className="text-emerald-500" size={20} />}
        />
        <StatCard
          className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
          title="Total Expenses"
          value={formatCurrency(stats.totalExpenses)}
          icon={<CreditCard className="text-rose-500" size={20} />}
        />
        <StatCard
          className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
          title="Total Products"
          value={products.length.toString()}
          icon={<Database className="text-primary" size={20} />}
        />
        <StatCard
          className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
          title="Low Stock Items"
          value={`${products.filter((p) => p.quantity < 30).length}`}
          icon={<Upload className="text-amber-500" size={20} />}
        />
        <StatCard
          className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
          title="Inventory Value"
          value={formatCurrencyShort(products.reduce((sum, product) => sum + product.price * product.quantity, 0))}
          icon={<ChartBar className="text-purple-500" size={20} />}
        />
        <StatCard
          className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
          title={stats.netProfit >= 0 ? "Net Profit" : "Net Loss"}
          value={formatCurrency(Math.abs(stats.netProfit))}
          icon={<ChartBar className={stats.netProfit >= 0 ? "text-emerald-500" : "text-rose-500"} size={20} />}
        />
      </div>

      <div className="space-y-6 pt-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <Suspense fallback={<FinancialOverviewSkeleton />}>
          <div className="enterprise-panel p-6">
            <FinancialOverviewPage userId={userId} onViewChange={handleFinancialViewChange} />
          </div>
        </Suspense>
        <Suspense fallback={<InventoryStatusSkeleton />}>
          <div className="enterprise-panel p-6">
            <InventoryStatusChart
              userId={userId}
              financialViewMode={financialViewMode}
              financialSelectedYear={financialSelectedYear}
              financialSelectedMonth={financialSelectedMonth}
            />
          </div>
        </Suspense>
        <Suspense fallback={<RecentActivitySkeleton />}>
          <div className="enterprise-panel p-6">
            <RecentActivity userId={clientId} />
          </div>
        </Suspense>
      </div>
    </div>
  );
}
