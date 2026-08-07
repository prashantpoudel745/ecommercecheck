import {
  ChartBar,
  CreditCard,
  Database,
  DollarSign,
  Upload,
  ReceiptText,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { toast } from "@/utils/notify";
import { ClipLoader } from "react-spinners";
import {
  FinancialOverviewSkeleton,
  InventoryStatusSkeleton,
  RecentActivitySkeleton,
} from "@/skeleton/dashboardSkeleton/dashboardSkeleton";
import { formatCurrency, formatCurrencyShort } from "@/utils/formatCurrency";
import { CurrencyUtil } from "@/utils/currency.util";
import { useGlobalDataStore } from "@/store/GlobalDataStore";
import { useAuth } from "@/context/AuthContext";
import { getDashboardStats } from "@/services/accounting.service";
import { cn } from "@/lib/utils";

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
import { Link } from "react-router-dom";
import {
  FileText,
  ShoppingCart,
  Truck,
  Package,
  BarChart3,
  Receipt,
  Warehouse,
  UserCog,
  Plus,
  WalletCards,
  LineChart,
  Banknote
} from "lucide-react";

const quickLinks = [
  { label: "Import Data", url: "/import", icon: Upload, color: "text-sky-400", bg: "bg-sky-700" },
  { label: "Quotations", url: "sales/quotations/new", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-700" },
  { label: "Sales Order", url: "sales/orders/new", icon: Receipt, color: "text-amber-400", bg: "bg-amber-700" },
  { label: "Invoices", url: "sales/invoice/new", icon: ReceiptText, color: "text-violet-400", bg: "bg-violet-700" },
  { label: "Credit Notes", url: "sales/credit-notes/new", icon: WalletCards, color: "text-rose-400", bg: "bg-rose-700" },
  { label: "Customers", url: "sales/customers/new", icon: ShoppingCart, color: "text-orange-400", bg: "bg-orange-700" },
  { label: "Purchase Order", url: "purchase/orders/new", icon: Truck, color: "text-blue-400", bg: "bg-blue-700" },
  { label: "Purchase Bills", url: "purchase/bills/new", icon: Warehouse, color: "text-pink-400", bg: "bg-pink-700" },
  { label: "Expenses", url: "purchase/expenses/new", icon: CreditCard, color: "text-red-400", bg: "bg-red-700" },
  { label: "Supplier Payment", url: "purchase/supplier-payment/new", icon: FileText, color: "text-lime-400", bg: "bg-lime-700" },
  { label: "Supplier", url: "purchase/suppliers/new", icon: BarChart3, color: "text-indigo-400", bg: "bg-indigo-700" },
  { label: "Analytics", url: "/insights", icon: LineChart, color: "text-purple-400", bg: "bg-purple-700" },
  { label: "Products", url: "/inventory", icon: Database, color: "text-teal-400", bg: "bg-teal-700" },
  { label: "Team", url: "/employees", icon: UserCog, color: "text-fuchsia-400", bg: "bg-fuchsia-700" },
];

function QuickLinksGrid() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-1 rounded-full " />
        <h2 className="text-lg font-semibold text-black">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 animate-fade-up">
        {quickLinks.map(({ label, url, icon: Icon, color, bg }) => (
          <Link
            key={url}
            to={url}
            className="group relative flex flex-col items-center justify-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-2 py-3 text-center backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.1] hover:bg-white/[0.04] hover:shadow-card"
          >
            <button
              type="button"
              className="absolute right-1.5 top-1.5 rounded-full p-0.5 text-slate-600 opacity-0 transition-all duration-200 hover:text-white group-hover:opacity-100"
            >
              <Plus size={12} />
            </button>
            <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 group-hover:scale-110", bg, color)}>
              <Icon size={16} />
            </span>
            <span className="text-[11px] font-medium text-slate-700 group-hover:text-slate-400 leading-tight">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

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

  return (
    <div className="mx-auto max-w-[1520px] space-y-5 sm:space-y-6 lg:space-y-8 animate-fade-in px-0">
      {loading && showLoadingOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 backdrop-blur-sm">
          <ClipLoader color="#6366f1" size={40} />
        </div>
      )}

      <div className="flex flex-col space-y-2 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl lg:text-3xl">
          Dashboard Overview
        </h1>
        <p className="text-sm text-slate-600">
          Here's what's happening with your business today.
        </p>
      </div>
                <QuickLinksGrid />

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

      <div className="space-y-4 sm:space-y-5 lg:space-y-6 pt-2 sm:pt-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <Suspense fallback={<FinancialOverviewSkeleton />}>
          <div className="enterprise-panel p-3 sm:p-4 lg:p-6">
            <FinancialOverviewPage userId={userId} onViewChange={handleFinancialViewChange} />
          </div>
        </Suspense>
        <Suspense fallback={<InventoryStatusSkeleton />}>
          <div className="enterprise-panel p-3 sm:p-4 lg:p-6">
            <InventoryStatusChart
              userId={userId}
              financialViewMode={financialViewMode}
              financialSelectedYear={financialSelectedYear}
              financialSelectedMonth={financialSelectedMonth}
            />
          </div>
        </Suspense>
        <Suspense fallback={<RecentActivitySkeleton />}>
          <div className="enterprise-panel p-3 sm:p-4 lg:p-6">
            <RecentActivity userId={clientId} />
          </div>
        </Suspense>
      </div>
    </div>
  );
}

