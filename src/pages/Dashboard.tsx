import {
  ChartBar,
  CreditCard,
  Database,
  DollarSign,
  Download,
  Upload,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { toast } from "@/utils/notify";
import { DashboardPageSkeleton } from "@/skeleton/dashboardSkeleton/DashboardPageSkeleton";
import {
  FinancialOverviewSkeleton,
  InventoryStatusSkeleton,
  RecentActivitySkeleton,
} from "@/skeleton/dashboardSkeleton/dashboardSkeleton";
import { formatCurrency } from "@/utils/formatCurrency";
import { CurrencyUtil } from "@/utils/currency.util";
import { useGlobalDataStore } from "@/store/GlobalDataStore";
import { useAuth } from "@/context/AuthContext";
import { getDashboardStats } from "@/services/accounting.service";

const API_BASE = import.meta.env.VITE_API_URL||"";

const FinancialOverviewPage = lazy(
  () => import("@/components/dashboard/FinancialOverviewPage")
);
const InventoryStatusChart = lazy(
  () => import("@/components/dashboard/InventoryStatus.tsx")
);
const RecentActivity = lazy(
  () => import("@/components/dashboard/RecentActivity")
);
import QuickLinksGrid from "@/components/dashboard/QuickLinksGrid";
import { Link } from "react-router-dom";
import { Button } from "react-day-picker";


export default function Dashboard() {
  const { state, setDashboard } = useGlobalDataStore();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dashboardState = state.dashboard;

  // Financial overview view state â€“ lifted so InventoryStatusChart can sync
  const [financialViewMode, setFinancialViewMode] = useState<"year" | "month" | "day">("year");
  const [financialSelectedYear, setFinancialSelectedYear] = useState<string | null>(null);
  const [financialSelectedMonth, setFinancialSelectedMonth] = useState<string | null>(null);

  const getDerivedDateParams = useCallback(() => {
    if (!financialSelectedYear) return undefined;
    const year = financialSelectedYear;
    if (financialSelectedMonth) {
      const monthNum = parseInt(financialSelectedMonth, 10);
      if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
        return {
          startDate: `${year}-01-01`,
          endDate: `${year}-12-31`,
        };
      }
      const mStr = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
      const lastDay = new Date(parseInt(year, 10), monthNum, 0).getDate();
      return {
        startDate: `${year}-${mStr}-01`,
        endDate: `${year}-${mStr}-${lastDay < 10 ? '0' + lastDay : lastDay}`,
      };
    }
    return {
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
    };
  }, [financialSelectedYear, financialSelectedMonth]);
  
  const handleFinancialViewChange = useCallback(
    (viewMode: "year" | "month" | "day", selectedYear: string | null, selectedMonth: string | null) => {
      setFinancialViewMode(viewMode);
      setFinancialSelectedYear(selectedYear);
      setFinancialSelectedMonth(selectedMonth);

      let params: { startDate?: string; endDate?: string } | undefined = undefined;
      if (selectedYear) {
        if (selectedMonth) {
          const monthNum = parseInt(selectedMonth, 10);
          if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
            params = {
              startDate: `${selectedYear}-01-01`,
              endDate: `${selectedYear}-12-31`,
            };
            fetchTransactions(params);
            return;
          }
          const mStr = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
          const lastDay = new Date(parseInt(selectedYear, 10), monthNum, 0).getDate();
          params = {
            startDate: `${selectedYear}-${mStr}-01`,
            endDate: `${selectedYear}-${mStr}-${lastDay < 10 ? '0' + lastDay : lastDay}`,
          };
        } else {
          params = {
            startDate: `${selectedYear}-01-01`,
            endDate: `${selectedYear}-12-31`,
          };
        }
      }
      fetchTransactions(params);
    },
    []
  );

  const stats = dashboardState.stats;

  const fetchTransactions = async (params?: { startDate?: string; endDate?: string }) => {
    try {
      const activeParams = params !== undefined ? params : getDerivedDateParams();
      const statsData = await getDashboardStats(activeParams);

      setDashboard((previous) => ({
        ...previous,
        transactions: [], // Not used for rendering in the dashboard
        stats: {
          totalRevenue: Number(statsData.revenue),
          totalExpenses:Number(statsData.expenses),
          totalRevenueWithTax: Number(statsData.revenueWithTax ?? statsData.revenue),
          totalExpensesWithTax: Number(statsData.expensesWithTax ?? statsData.expenses),
          netProfit: Number(statsData.netProfit),
        },
      }));
    } catch (error) {
      toast.error("Failed to load transactions");
    }
  };

  const products = dashboardState.products;
  const clientId = dashboardState.clientId;
  const userId = user?._id || user?.id || user?.companyId;

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

  if (loading && showLoadingOverlay) {
    return <DashboardPageSkeleton />;
  }

  return (
    <div className="mx-auto max-w-[1520px] space-y-4 animate-fade-in px-0">
      <div className="flex flex-col space-y-2 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-row items-center justify-between ">
        <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl lg:text-3xl">
          Dashboard Overview
        </h1>
        <Link to="/import">
        <div className="p-2 border border-black rounded flex flex-row gap-2">
          Import data
          <Download/>
        </div>
         </Link>
        </div>

        <p className="text-sm text-slate-600">
          Here's what's happening with your business today.
        </p>
      </div>
      
               <QuickLinksGrid/>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <StatCard
          className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
          title="Revenue (excl. VAT)"
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign className="text-emerald-500" size={20} />}
        />
        <StatCard
          className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
          title="Expenses (excl. VAT)"
          value={formatCurrency(stats.totalExpenses)}
          icon={<CreditCard className="text-rose-500" size={20} />}
        />
        <StatCard
          className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
          title="Revenue (incl. VAT)"
          value={formatCurrency(stats.totalRevenueWithTax)}
          icon={<DollarSign className="text-emerald-600" size={20} />}
        />
        <StatCard
          className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
          title="Expenses (incl. VAT)"
          value={formatCurrency(stats.totalExpensesWithTax)}
          icon={<CreditCard className="text-rose-600" size={20} />}
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
          value={formatCurrency(
            products.reduce(
              (sum, product) => sum.plus(CurrencyUtil.mul(product.price || 0, product.quantity || 0)),
              CurrencyUtil.parse(0)
            )
          )}
          icon={<ChartBar className="text-purple-500" size={20} />}
        />
        <StatCard
          className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
          title={CurrencyUtil.parse(stats.netProfit).greaterThanOrEqualTo(0) ? "Net Profit" : "Net Loss"}
          value={formatCurrency(CurrencyUtil.parse(stats.netProfit).abs())}
          icon={<ChartBar className={CurrencyUtil.parse(stats.netProfit).greaterThanOrEqualTo(0) ? "text-emerald-500" : "text-rose-500"} size={20} />}
        />
      </div>

      <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <Suspense fallback={<FinancialOverviewSkeleton />}>
          <div className="enterprise-panel p-3 sm:p-4 lg:p-4">
            <FinancialOverviewPage userId={userId} onViewChange={handleFinancialViewChange} />
          </div>
        </Suspense>
        <Suspense fallback={<InventoryStatusSkeleton />}>
          <div className="enterprise-panel p-3 sm:p-4 lg:p-4">
            <InventoryStatusChart
              userId={userId}
              financialViewMode={financialViewMode}
              financialSelectedYear={financialSelectedYear}
              financialSelectedMonth={financialSelectedMonth}
            />
          </div>
        </Suspense>
        <Suspense fallback={<RecentActivitySkeleton />}>
          <div className="enterprise-panel p-3 sm:p-4 lg:p-4">
            <RecentActivity userId={clientId} />
          </div>
        </Suspense>
      </div>
    </div>
  );
}

