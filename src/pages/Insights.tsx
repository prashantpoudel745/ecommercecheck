import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Boxes,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Sparkles,
  ShieldCheck,
  Activity,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";
import { toast } from "@/utils/notify";
import { InsightsSkeleton } from "@/skeleton/insightsSkeleton/insightsSkeleton";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatCurrency, formatCurrencyShort } from "@/utils/formatCurrency";
import { Customer } from "../../types/customer.types";
import { Snapshot } from "../../types";

const API_BASE = import.meta.env.VITE_API_URL || "";

const COLORS = {
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  indigo: "#6366f1",
  sky: "#0284c7",
  violet: "#8b5cf6",
  slate: "#475569",
};

const chartPalette = [COLORS.emerald, COLORS.amber, COLORS.rose, COLORS.indigo, COLORS.sky, COLORS.violet];

const compactNumber = (value = 0) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const getDueAmount = (customer: Customer) => Number(customer.dueamount ?? customer.value ?? 0);

function MetricTile({
  label,
  value,
  helper,
  icon,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</p>
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs", tone)}>
          {icon}
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500 font-medium border-t border-slate-100 pt-2.5">{helper}</p>
    </div>
  );
}

function InsightPanel({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function Insights() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSnapshot = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/insights/summary`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to load insights");
      }

      const data = await response.json();
      setSnapshot(data.snapshot || null);
    } catch (error) {
      toast.error("Unable to load business insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSnapshot();
  }, []);

  const derived = useMemo(() => {
    if (!snapshot) return null;

    const financeTrend = [
      {
        name: "Yesterday",
        revenue: snapshot.finance.yesterdayRevenue,
        expenses: snapshot.finance.yesterdayExpenses,
        net: snapshot.finance.yesterdayNet,
      },
      {
        name: "Today",
        revenue: snapshot.finance.todayRevenue,
        expenses: snapshot.finance.todayExpenses,
        net: snapshot.finance.todayNet,
      },
      {
        name: "This Month",
        revenue: snapshot.finance.monthRevenue,
        expenses: snapshot.finance.monthExpenses,
        net: snapshot.finance.monthNet,
      },
    ];

    const inventoryRisk = [
      {
        name: "Healthy Stock",
        value: Math.max(
          snapshot.inventory.totalProducts -
            snapshot.inventory.lowStockItems.length -
            snapshot.inventory.outOfStockItems.length,
          0
        ),
      },
      { name: "Low Stock (<30)", value: snapshot.inventory.lowStockItems.length },
      { name: "Out of Stock (0)", value: snapshot.inventory.outOfStockItems.length },
    ].filter((item) => item.value > 0);

    const topInventory = [...(snapshot.inventory.highestValueItems || [])]
      .slice(0, 6)
      .map((item) => ({
        name: item.name,
        value: Number(item.value || Number(item.quantity || 0) * Number(item.price || 0)),
      }));

    const dueCustomers = [...(snapshot.customers.dueCustomers || [])]
      .sort((left, right) => getDueAmount(right) - getDueAmount(left))
      .slice(0, 6)
      .map((customer) => ({
        name: customer.companyName || customer.name,
        due: getDueAmount(customer),
      }));

    const stockRiskScore = clampPercent(
      ((snapshot.inventory.lowStockItems.length + snapshot.inventory.outOfStockItems.length * 2) /
        Math.max(snapshot.inventory.totalProducts, 1)) *
        100
    );
    const receivableRiskScore = clampPercent(
      (snapshot.customers.totalDueAmount /
        Math.max(snapshot.customers.totalDueAmount + snapshot.customers.totalPaidAmount, 1)) *
        100
    );
    const marginScore = clampPercent(
      snapshot.finance.monthRevenue > 0
        ? ((snapshot.finance.monthRevenue - snapshot.finance.monthExpenses) / snapshot.finance.monthRevenue) * 100
        : snapshot.finance.monthNet > 0
        ? 70
        : 20
    );
    const teamScore = clampPercent(
      100 -
        ((snapshot.attendance.lateCount + snapshot.attendance.absentCount * 2) /
          Math.max(
            snapshot.attendance.presentCount +
              snapshot.attendance.lateCount +
              snapshot.attendance.absentCount +
              snapshot.attendance.overtimeCount,
            1
          )) *
          100
    );

    const healthRadar = [
      { metric: "Margin", score: marginScore },
      { metric: "Cashflow", score: 100 - receivableRiskScore },
      { metric: "Stock Health", score: 100 - stockRiskScore },
      { metric: "Team Coverage", score: teamScore },
      { metric: "Growth Rate", score: clampPercent(50 + snapshot.finance.revenueMonthDeltaPercent) },
    ];

    return {
      financeTrend,
      inventoryRisk,
      topInventory,
      dueCustomers,
      stockRiskScore,
      receivableRiskScore,
      marginScore,
      teamScore,
      healthRadar,
    };
  }, [snapshot]);

  if (loading) {
    return <InsightsSkeleton />;
  }

  if (!snapshot || !derived) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <Activity size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-900">No Insight Data Available</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Add accounting transactions, inventory products, and client accounts to generate live intelligence.
        </p>
        <button
          onClick={loadSnapshot}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          <RefreshCcw size={14} />
          <span>Refresh Snapshot</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Business Intelligence & Insights
            </h1>
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
              <Sparkles size={13} className="text-indigo-600" />
              Live ERP Analytics
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time financial performance, inventory liquidity, party receivables, and operational health signals.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Updated{" "}
            {snapshot.generatedAt
              ? new Date(snapshot.generatedAt).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "just now"}
          </span>
          <button
            onClick={loadSnapshot}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors text-slate-600"
            title="Refresh analytics data"
          >
            <RefreshCcw size={15} />
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile
          label="Today Net Position"
          value={formatCurrency(snapshot.finance.todayNet)}
          helper={`${formatCurrency(snapshot.finance.todayRevenue)} revenue recorded today`}
          icon={snapshot.finance.todayNet >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          tone={snapshot.finance.todayNet >= 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200/80" : "bg-rose-50 text-rose-700 border-rose-200/80"}
        />
        <MetricTile
          label="Outstanding Receivables"
          value={formatCurrency(snapshot.customers.totalDueAmount)}
          helper={`${snapshot.customers.dueCustomers.length} client accounts require follow-up`}
          icon={<Wallet size={20} />}
          tone="bg-sky-50 text-sky-700 border-sky-200/80"
        />
        <MetricTile
          label="Total Inventory Value"
          value={formatCurrency(snapshot.inventory.inventoryValue)}
          helper={`${snapshot.inventory.lowStockItems.length} products under minimum stock threshold`}
          icon={<Boxes size={20} />}
          tone="bg-amber-50 text-amber-800 border-amber-200/80"
        />
        <MetricTile
          label="Staff Attendance & Coverage"
          value={`${snapshot.employees.activeEmployees}/${snapshot.employees.totalEmployees}`}
          helper={`${snapshot.attendance.averageHours || 0} avg monthly hours per staff`}
          icon={<Users size={20} />}
          tone="bg-violet-50 text-violet-700 border-violet-200/80"
        />
      </div>

      {/* Financial Performance vs Operating Health Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_0.95fr] gap-6">
        {/* Revenue & Expense Area Chart */}
        <InsightPanel
          title="Revenue, Expenses, & Net Financial Position"
          subtitle="Comparison of yesterday, today, and cumulative monthly financial performance"
        >
          <div className="h-[280px] sm:h-[320px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={derived.financeTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.emerald} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={COLORS.emerald} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.rose} stopOpacity={0.16} />
                    <stop offset="100%" stopColor={COLORS.rose} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="#64748b" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#64748b" tickFormatter={(value) => compactNumber(value)} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), ""]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "0.75rem",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                />
                <Area type="monotone" name="Revenue" dataKey="revenue" stroke={COLORS.emerald} fill="url(#revenueFill)" strokeWidth={2.5} />
                <Area type="monotone" name="Expenses" dataKey="expenses" stroke={COLORS.rose} fill="url(#expenseFill)" strokeWidth={2.5} />
                <Area type="monotone" name="Net Position" dataKey="net" stroke={COLORS.indigo} fill="transparent" strokeWidth={2.5} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </InsightPanel>

        {/* Operating Health Radar Chart */}
        <InsightPanel
          title="Company Operating Health Radar"
          subtitle="Comprehensive score (0-100%) across margin, cashflow, stock, team, and growth"
        >
          <div className="h-[280px] sm:h-[320px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={derived.healthRadar}>
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="metric" fontSize={11} stroke="#334155" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Health Index" dataKey="score" stroke={COLORS.indigo} fill={COLORS.indigo} fillOpacity={0.2} strokeWidth={2.5} />
                <Tooltip
                  formatter={(value: number) => [`${Math.round(value)}% Score`, "Metric"]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "0.75rem",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </InsightPanel>
      </div>

      {/* Breakdown Row: Stock Risk, High-Value Inventory, Due Receivables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Inventory Risk Distribution */}
        <InsightPanel title="Stock Risk Distribution" subtitle="Product count grouped by stock health level">
          {derived.inventoryRisk.length > 0 ? (
            <div className="h-[240px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={derived.inventoryRisk} dataKey="value" nameKey="name" innerRadius={55} outerRadius={82} paddingAngle={4}>
                    {derived.inventoryRisk.map((entry, index) => (
                      <Cell key={entry.name} fill={chartPalette[index % chartPalette.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "0.75rem",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                {derived.inventoryRisk.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartPalette[idx % chartPalette.length] }} />
                    <span>{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-12 text-center">No inventory risk detected.</p>
          )}
        </InsightPanel>

        {/* Highest-Value Inventory */}
        <InsightPanel title="Highest-Value Inventory" subtitle="Capital allocation across top stock items">
          <div className="h-[250px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={derived.topInventory} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tickFormatter={(value) => compactNumber(value)} fontSize={11} stroke="#64748b" />
                <YAxis type="category" dataKey="name" width={80} fontSize={11} stroke="#334155" />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Valuation"]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "0.75rem",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                />
                <Bar dataKey="value" fill={COLORS.amber} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </InsightPanel>

        {/* Top Due Receivables */}
        <InsightPanel title="Top Receivables Follow-Up" subtitle="Client accounts requiring immediate collection priority">
          <div className="space-y-3 pt-1">
            {derived.dueCustomers.length === 0 && (
              <p className="text-xs text-slate-500 italic py-12 text-center">No customer dues recorded.</p>
            )}
            {derived.dueCustomers.map((customer, index) => {
              const percent = clampPercent((customer.due / Math.max(snapshot.customers.totalDueAmount, 1)) * 100);
              return (
                <div key={`${customer.name}-${index}`} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="truncate text-slate-900">{customer.name}</span>
                    <span className="font-mono text-amber-700">{formatCurrencyShort(customer.due)}</span>
                  </div>
                  <Progress value={percent} className="h-2 bg-slate-100" indicatorClassName="bg-amber-600" />
                </div>
              );
            })}
          </div>
        </InsightPanel>
      </div>

      {/* Recommended Strategic Actions Panel */}
      <InsightPanel title="Strategic Action Recommendations" subtitle="Automated ERP suggestions synthesized from live finance, stock, CRM, and team data">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
          {(snapshot.recommendations || []).map((recommendation, index) => (
            <div key={recommendation} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                {index + 1}
              </div>
              <p className="text-xs font-medium text-slate-700 leading-relaxed">{recommendation}</p>
            </div>
          ))}
        </div>
      </InsightPanel>
    </div>
  );
}
