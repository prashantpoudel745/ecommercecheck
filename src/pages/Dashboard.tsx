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
import { toast } from "sonner";
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
  LineChart
} from "lucide-react";

const quickLinks = [
  { label: "Import Data", url: "/import", icon: Upload },
  { label: "Quotations", url: "sales/quotations/new", icon: DollarSign },
  { label: "Sales Order", url: "sales/orders/new", icon: Receipt },
  { label: "Invoices", url: "sales/invoice/new", icon: ReceiptText },
  { label: "Credit Notes", url: "sales/credit-notes/new", icon: WalletCards },
  { label: "Customer Payment", url: "sales/customer-payment/new", icon: Package },
  { label: "Customers", url: "sales/customers/new", icon: ShoppingCart },
  { label: "Purchase Order", url: "purchase/orders/new", icon: Truck },
  { label: "Purchase Bills", url: "purchase/bills/new", icon: Warehouse },
  { label: "Expenses", url: "purchase/expenses/new", icon: CreditCard },
  { label: "Supplier Payment", url: "purchase/supplier-payment/new", icon: FileText },
  { label: "Supplier", url: "purchase/suppliers/new", icon: BarChart3 },
  { label: "Analytics", url: "/insights", icon: LineChart },
  { label: "Products", url: "/inventory", icon: Database },
  { label: "Team", url: "/employees", icon: UserCog },
];

function QuickLinksGrid() {
  return (
    <>
      <div className="p-2 text-black text-xl font-bold">Quick Add Links</div>

      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 animate-fade-up"
        style={{ animationDelay: "0.05s" }}
      >
        {quickLinks.map(({ label, url, icon: Icon }) => (
          <Link
            key={url}
            to={url}
            className="group relative flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-1 py-2 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
          >
            <button
              type="button"
              className="absolute right-2 top-2 rounded-full p-1 text-slate-300 opacity-0 transition-opacity duration-200 hover:text-primary group-hover:opacity-100"
            >
              <Plus size={15} />
            </button>

            <span className="flex h-3 w-10 items-center justify-center rounded-xl  text-slate-600 transition-colors duration-200 group-hover:bg-primary/10">
              <Icon size={15} />
            </span>

            <span className="text-xs font-medium text-slate-700 group-hover:text-slate-950">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </>
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
          <QuickLinksGrid />

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

