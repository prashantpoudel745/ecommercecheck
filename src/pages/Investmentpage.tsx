import { useState, useEffect, Suspense, lazy } from "react";
import axios from "axios";
import { DollarSign, Users, Layers } from "lucide-react";
import { ChartSkeleton } from "@/skeleton/investmentSkeleton/chartSkeleton";
import { TableSkeleton } from "@/skeleton/investmentSkeleton/tableSkeleton";
import { PageSkeleton } from "@/skeleton/investmentSkeleton/pageSkeleton";
import { StatCard } from "@/components/dashboard/StatCard";
import { useGlobalDataStore } from "@/store/GlobalDataStore";
import { CURRENCY_SYMBOL } from "@/utils/formatCurrency";
import { useAuth } from "@/context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL||"";

const InvestmentDistributionChart = lazy(
  () => import("@/components/investment/InvestmentDistributionChart")
);
const InvestmentsTable = lazy(
  () => import("@/components/investment/Investmenttable")
);
const MonthlyGrowthChart = lazy(
  () => import("@/components/investment/MonthlyGrowthChart")
);

// Skeleton Components
const ErrorDisplay = ({ error }: { error: string }) => (
  <div className="bg-red-50 p-4 rounded-md">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg
          className="h-5 w-5 text-red-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">{error}</h3>
      </div>
    </div>
  </div>
);

const InvestmentPage = () => {
  const { state, setInvestment } = useGlobalDataStore();
  const { user } = useAuth();
  const [investments, setInvestments] = useState(state.investment.investments);
  const [loading, setLoading] = useState(state.investment.lastFetched === 0);
  const [dataLoaded, setDataLoaded] = useState(state.investment.lastFetched > 0);
  const [showPageSkeleton, setShowPageSkeleton] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(state.investment.userRole);

  const initializeUser = async () => {
    try {
      if (!user) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      const nextRole = user.role || null;
      setUserRole(nextRole);
      setInvestment((previous) => ({
        ...previous,
        userRole: nextRole,
      }));

      if (user._id || user.id) {
        await fetchInvestments(user._id || user.id || "");
        setDataLoaded(true);
      } else {
        setError("User ID not found");
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state.investment.lastFetched > 0) {
      setInvestments(state.investment.investments);
      setUserRole(state.investment.userRole);
      setLoading(false);
      setDataLoaded(true);
      void initializeUser();
      return;
    }

    void initializeUser();
  }, []);

  useEffect(() => {
    let skeletonTimer: ReturnType<typeof setTimeout> | null = null;

    if (loading && !dataLoaded) {
      skeletonTimer = setTimeout(() => {
        setShowPageSkeleton(true);
      }, 180);
    } else {
      setShowPageSkeleton(false);
    }

    return () => {
      if (skeletonTimer) {
        clearTimeout(skeletonTimer);
      }
    };
  }, [loading, dataLoaded]);

  const fetchInvestments = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/investment`, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await response.json();
      const nextInvestments = data.investments || [];
      setInvestments(nextInvestments);
      setInvestment((previous) => ({
        ...previous,
        investments: nextInvestments,
        lastFetched: Date.now(),
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (investments) => {
    if (!investments || investments.length === 0) {
      return {
        totalInvestments: 0,
        activeClients: 0,
        totalCategories: 0,
        avgReturn: 0,
      };
    }

    const totalInvestments = investments.reduce(
      (sum, inv) => sum + (inv.amount || 0),
      0
    );

    const activeClients = new Set(investments.map((inv) => inv.clientname))
      .size;
    const totalCategories = new Set(
      investments
        .map((inv) => (inv.category || "").trim())
        .filter((c) => c.length > 0)
    ).size;

    const validReturns = investments
      .map((inv) => Number(inv.returns))
      .filter((value) => !isNaN(value));

    const totalReturns = validReturns.reduce((sum, ret) => sum + ret, 0);
    const avgReturn =
      validReturns.length > 0 ? totalReturns / validReturns.length : 0;

    return {
      totalInvestments,
      activeClients,
      totalCategories,
      avgReturn: Number(avgReturn.toFixed(2)),
    };
  };

  const { totalInvestments, activeClients, totalCategories } =
    calculateStats(investments);

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (userRole !== null && userRole !== "admin") {
    return (
      <div className="p-4 text-center text-red-600 font-semibold">
        Only admin can view this page.
      </div>
    );
  }

  if (loading && !dataLoaded && !showPageSkeleton) {
    return <div className="min-h-[35vh]" />;
  }

  if ((loading && !dataLoaded && showPageSkeleton) || (!dataLoaded && userRole === null)) {
    return <PageSkeleton />;
  }

  return (
    <div className="mx-auto max-w-[1520px] space-y-8 animate-fade-in px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Investments
          </h1>
          <p className="text-sm text-slate-600">
            Monitor and manage your investment portfolio.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <StatCard
          title="Total Investments"
          className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
          value={`${CURRENCY_SYMBOL} ${totalInvestments.toLocaleString()}`}
          icon={<DollarSign className="text-emerald-500" size={20} />}
        />
        <StatCard
          title="Active Clients"
          className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
          value={activeClients.toString()}
          icon={<Users className="text-indigo-500" size={20} />}
        />
        <StatCard
          title="Total Categories"
          className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
          value={totalCategories.toString()}
          icon={<Layers className="text-amber-500" size={20} />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <Suspense fallback={<ChartSkeleton />}>
          <div className="enterprise-panel p-6 h-full">
            <InvestmentDistributionChart investments={investments} />
          </div>
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
           <div className="enterprise-panel p-6 h-full">
             <MonthlyGrowthChart investments={investments} />
           </div>
        </Suspense>
      </div>

      {/* Table */}
      <div className="w-full animate-fade-up" style={{ animationDelay: '0.4s' }}>
        <Suspense fallback={<TableSkeleton />}>
           <div className="enterprise-panel p-6">
             <InvestmentsTable />
           </div>
        </Suspense>
      </div>
    </div>
  );
};

export default InvestmentPage;
