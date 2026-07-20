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
  AlertTriangle,
  Boxes,
  BrainCircuit,
  ClipboardList,
  Loader2,
  SendHorizontal,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatCurrency, formatCurrencyShort } from "@/utils/formatCurrency";

const API_BASE = import.meta.env.VITE_API_URL||"";

type InventoryItem = {
  name: string;
  category?: string;
  quantity?: number;
  price?: number;
  value?: number;
};

type Customer = {
  name: string;
  companyName?: string;
  dueamount?: number;
  value?: number;
};

type Snapshot = {
  generatedAt?: string;
  finance: {
    todayRevenue: number;
    todayExpenses: number;
    todayNet: number;
    yesterdayRevenue: number;
    yesterdayExpenses: number;
    yesterdayNet: number;
    monthRevenue: number;
    monthExpenses: number;
    monthNet: number;
    revenueDayDelta: number;
    netDayDelta: number;
    revenueMonthDeltaPercent: number;
    netMonthDeltaPercent: number;
  };
  inventory: {
    totalProducts: number;
    lowStockItems: InventoryItem[];
    outOfStockItems: InventoryItem[];
    inventoryValue: number;
    highestValueItems: InventoryItem[];
  };
  customers: {
    totalCustomers: number;
    dueCustomers: Customer[];
    totalDueAmount: number;
    totalPaidAmount: number;
  };
  employees: {
    totalEmployees: number;
    activeEmployees: number;
    departments: number;
  };
  attendance: {
    presentCount: number;
    lateCount: number;
    absentCount: number;
    overtimeCount: number;
    averageHours: number;
  };
  investments: {
    totalInvested: number;
    averageReturn: number;
    activeClients: number;
    totalCategories: number;
  };
  recommendations: string[];
};

const COLORS = {
  teal: "#0F766E",
  amber: "#B45309",
  rose: "#BE123C",
  indigo: "#4F46E5",
  sky: "#0369A1",
  violet: "#7C3AED",
  slate: "#334155",
  emerald: "#047857",
};

const chartPalette = [COLORS.teal, COLORS.amber, COLORS.rose, COLORS.indigo, COLORS.sky, COLORS.violet];

const compactNumber = (value = 0) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const getDueAmount = (customer: Customer) => Number(customer.dueamount ?? customer.value ?? 0);

const riskLabel = (score: number) => {
  if (score >= 70) return "High focus";
  if (score >= 35) return "Watch";
  return "Stable";
};

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
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", tone)}>{icon}</div>
      </div>
      <p className="mt-3 text-sm text-slate-500">{helper}</p>
    </div>
  );
}

function InsightPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold tracking-tight text-slate-950">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export default function Insights() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [advisorPrompt, setAdvisorPrompt] = useState("What products should I reorder?");
  const [advisorReply, setAdvisorReply] = useState("");
  const [advisorIntent, setAdvisorIntent] = useState("");
  const [askingAdvisor, setAskingAdvisor] = useState(false);

  useEffect(() => {
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

    void loadSnapshot();
  }, []);

  const askAdvisor = async () => {
    const message = advisorPrompt.trim();
    if (!message) return;

    setAskingAdvisor(true);
    try {
      const response = await fetch(`${API_BASE}/api/insights/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate prompt");
      }

      const data = await response.json();
      setAdvisorReply(data.reply || "No recommendation available.");
      setAdvisorIntent(data.intent || "");
    } catch (error) {
      toast.error("Advisor could not evaluate this question");
    } finally {
      setAskingAdvisor(false);
    }
  };

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
        name: "Month",
        revenue: snapshot.finance.monthRevenue,
        expenses: snapshot.finance.monthExpenses,
        net: snapshot.finance.monthNet,
      },
    ];

    const inventoryRisk = [
      {
        name: "Healthy",
        value: Math.max(
          snapshot.inventory.totalProducts -
            snapshot.inventory.lowStockItems.length -
            snapshot.inventory.outOfStockItems.length,
          0
        ),
      },
      { name: "Low", value: snapshot.inventory.lowStockItems.length },
      { name: "Out", value: snapshot.inventory.outOfStockItems.length },
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
      { metric: "Stock", score: 100 - stockRiskScore },
      { metric: "Team", score: teamScore },
      { metric: "Growth", score: clampPercent(50 + snapshot.finance.revenueMonthDeltaPercent) },
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
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-slate-900" />
          Loading business insights...
        </div>
      </div>
    );
  }

  if (!snapshot || !derived) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="font-medium text-slate-900">No insight data available yet.</p>
        <p className="mt-1 text-sm text-slate-500">Add accounting, inventory, and CRM data to unlock analytics.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1520px] space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {/* <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
            <BrainCircuit className="h-4 w-4 text-indigo-600" />
            Business intelligence
          </div> */}
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 ">Dashboards and Insights</h1>
        </div>
        <p className="text-xs text-slate-500">
          Updated{" "}
          {snapshot.generatedAt
            ? new Date(snapshot.generatedAt).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            : "just now"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Today net"
          value={formatCurrency(snapshot.finance.todayNet)}
          helper={`${formatCurrency(snapshot.finance.todayRevenue)} revenue today`}
          icon={snapshot.finance.todayNet >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          tone={snapshot.finance.todayNet >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}
        />
        <MetricTile
          label="Receivables"
          value={formatCurrencyShort(snapshot.customers.totalDueAmount)}
          helper={`${snapshot.customers.dueCustomers.length} clients need follow-up`}
          icon={<Wallet className="h-5 w-5" />}
          tone="bg-sky-50 text-sky-700"
        />
        <MetricTile
          label="Inventory value"
          value={formatCurrencyShort(snapshot.inventory.inventoryValue)}
          helper={`${snapshot.inventory.lowStockItems.length} low-stock products`}
          icon={<Boxes className="h-5 w-5" />}
          tone="bg-amber-50 text-amber-700"
        />
        <MetricTile
          label="Team coverage"
          value={`${snapshot.employees.activeEmployees}/${snapshot.employees.totalEmployees}`}
          helper={`${snapshot.attendance.averageHours || 0} average monthly hours`}
          icon={<Users className="h-5 w-5" />}
          tone="bg-violet-50 text-violet-700"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <InsightPanel title="Revenue, expenses, and net position" subtitle="Compare yesterday, today, and current month performance.">
          <div className="h-[330px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={derived.financeTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.rose} stopOpacity={0.16} />
                    <stop offset="100%" stopColor={COLORS.rose} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => compactNumber(value)} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Area type="monotone" dataKey="revenue" stroke={COLORS.teal} fill="url(#revenueFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="expenses" stroke={COLORS.rose} fill="url(#expenseFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="net" stroke={COLORS.indigo} fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </InsightPanel>

        <InsightPanel title="Business health" subtitle="A quick operating score from live company signals.">
          <div className="h-[330px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={derived.healthRadar}>
                <PolarGrid stroke="#CBD5E1" />
                <PolarAngleAxis dataKey="metric" fontSize={12} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="score" stroke={COLORS.indigo} fill={COLORS.indigo} fillOpacity={0.18} strokeWidth={2} />
                <Tooltip formatter={(value: number) => `${Math.round(value)}%`} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </InsightPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <InsightPanel title="Inventory risk" subtitle="Stock pressure by product status.">
          {derived.inventoryRisk.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={derived.inventoryRisk} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={3}>
                    {derived.inventoryRisk.map((entry, index) => (
                      <Cell key={entry.name} fill={chartPalette[index % chartPalette.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No inventory risk detected.</p>
          )}
        </InsightPanel>

        <InsightPanel title="Highest-value inventory" subtitle="Capital currently tied to stock.">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={derived.topInventory} layout="vertical" margin={{ top: 0, right: 14, left: 20, bottom: 0 }}>
                <CartesianGrid stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" tickFormatter={(value) => compactNumber(value)} fontSize={11} />
                <YAxis type="category" dataKey="name" width={82} fontSize={11} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" fill={COLORS.amber} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </InsightPanel>

        <InsightPanel title="Top due clients" subtitle="Receivables that deserve attention first.">
          <div className="space-y-3">
            {derived.dueCustomers.length === 0 && <p className="text-sm text-slate-500">No customer dues recorded.</p>}
            {derived.dueCustomers.map((customer, index) => {
              const percent = clampPercent((customer.due / Math.max(snapshot.customers.totalDueAmount, 1)) * 100);
              return (
                <div key={`${customer.name}-${index}`}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-medium text-slate-800">{customer.name}</span>
                    <span className="text-slate-500">{formatCurrencyShort(customer.due)}</span>
                  </div>
                  <Progress value={percent} className="h-2 bg-slate-100" indicatorClassName="bg-sky-600" />
                </div>
              );
            })}
          </div>
        </InsightPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        {/* <InsightPanel title="Focus board" subtitle="The areas most likely to move business results.">
          <div className="space-y-4">
            {[
              {
                label: "Receivable pressure",
                score: derived.receivableRiskScore,
                icon: <Wallet className="h-4 w-4" />,
                color: "bg-sky-600",
              },
              {
                label: "Stock pressure",
                score: derived.stockRiskScore,
                icon: <AlertTriangle className="h-4 w-4" />,
                color: "bg-amber-600",
              },
              {
                label: "Margin strength",
                score: derived.marginScore,
                icon: <Target className="h-4 w-4" />,
                color: "bg-emerald-600",
              },
              {
                label: "Team health",
                score: derived.teamScore,
                icon: <Users className="h-4 w-4" />,
                color: "bg-violet-600",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                    {item.icon}
                    {item.label}
                  </div>
                  <span className="text-xs font-semibold text-slate-500">{riskLabel(item.score)}</span>
                </div>
                <Progress value={item.score} className="h-2 bg-slate-100" indicatorClassName={item.color} />
              </div>
            ))}
          </div>
        </InsightPanel> */}

        {/* <InsightPanel title="AI business advisor" subtitle="Ask a specific question and get a focused answer from your live data.">
          <div className="space-y-3">
            <Textarea
              value={advisorPrompt}
              onChange={(event) => setAdvisorPrompt(event.target.value)}
              className="min-h-[96px] resize-none"
              placeholder="Ask: what products should I reorder?"
            />
            <div className="flex items-center justify-between gap-3">
              
              <Button onClick={() => void askAdvisor()} disabled={askingAdvisor || !advisorPrompt.trim()}>
                {askingAdvisor ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
                Ask
              </Button>
            </div>
            {advisorReply && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <ClipboardList className="h-4 w-4" />
                  {advisorIntent || "advisor"} result
                </div>
                <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{advisorReply}</p>
              </div>
            )}
          </div>
        </InsightPanel> */}
      </div>

      <InsightPanel title="Recommended actions" subtitle="Generated from current finance, inventory, CRM, team, and investment data.">
        <div className="grid gap-3 md:grid-cols-2">
          {(snapshot.recommendations || []).map((recommendation, index) => (
            <div key={recommendation} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-md bg-white text-sm font-semibold text-slate-800 shadow-sm">
                {index + 1}
              </div>
              <p className="text-sm leading-6 text-slate-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </InsightPanel>
    </div>
  );
}

