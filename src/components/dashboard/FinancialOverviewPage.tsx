import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { SkeletonLoader } from "@/skeleton/costumerSkeleton/skeletonLoader";
import { useScreenSize } from "@/hooks/use-mobile";
import { FinancialDataItem, BackendDataItem } from "../../../types";
import { FinancialOverviewPageProps } from "../../../types/accounting.types";
import {COLOR} from "../../utils/constants/color"
import { MONTH_NAMES_SHORT,MONTH_NAMES_FULL } from "@/utils/constants/monthnames";
import { formatCurrency } from "@/utils/formatCurrency";
const API_BASE = import.meta.env.VITE_API_URL||"";


const TooltipRow = ({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) => (
  <div className="flex items-center justify-between gap-6 py-0.5">
    <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
      <span
        className="h-1.5 w-1.5 rounded-[2px]"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
    <span
      className="text-[12px] font-medium tabular-nums text-slate-800"
    >
      {formatCurrency(value)}
    </span>
  </div>
);

const BarTooltip = React.memo(({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  const income = payload[0]?.value ?? 0;
  const expenses = payload[1]?.value ?? 0;
  const net = income - expenses;

  return (
    <div className="min-w-[180px] rounded-md border border-slate-200 bg-white px-3 py-2.5 shadow-md dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <TooltipRow color={COLOR.income} label="Income" value={income} />
      <TooltipRow color={COLOR.expense} label="Expenses" value={expenses} />
      <div className="my-1.5 h-px bg-slate-100 dark:bg-slate-800" />
      <div className="flex items-center justify-between gap-6">
        <span className="text-[11px] font-semibold text-slate-500">Net</span>
        <span
          className="text-[12px] font-bold tabular-nums"
          style={{ color: net >= 0 ? COLOR.netUp : COLOR.netDown }}
        >
          {net >= 0 ? "+" : "\u2212"}
          {formatCurrency(Math.abs(net))}
        </span>
      </div>
    </div>
  );
});

const TrendTooltip = React.memo(({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload;
  const income = item?.income ?? 0;
  const expenses = item?.expenses ?? 0;
  const netReal = item?.netReal ?? 0;
  const netAbs = item?.net ?? Math.abs(netReal);

  return (
    <div className="min-w-[190px] rounded-md border border-slate-200 bg-white px-3 py-2.5 shadow-md dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <TooltipRow color={COLOR.income} label="Income" value={income} />
      <TooltipRow color={COLOR.expense} label="Expenses" value={expenses} />
      <div className="my-1.5 h-px bg-slate-100 dark:bg-slate-800" />
      <div className="flex items-center justify-between gap-6 py-0.5">
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span
            className="h-1.5 w-1.5 rounded-[2px]"
            style={{ backgroundColor: netReal >= 0 ? COLOR.netUp : COLOR.netDown }}
          />
          Profit/Loss
        </span>
        <span
          className="text-[12px] font-bold tabular-nums"
          style={{ color: netReal >= 0 ? COLOR.netUp : COLOR.netDown }}
        >
          {netReal >= 0 ? "+" : "\u2212"}
          {formatCurrency(Math.abs(netReal))}
        </span>
      </div>
      <div className="flex items-center justify-between gap-6 py-0.5">
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="h-1.5 w-1.5 rounded-[2px]" style={{ backgroundColor: COLOR.netAbs }} />
          Net
        </span>
        <span className="text-[12px] font-medium tabular-nums text-slate-800">
          {formatCurrency(netAbs)}
        </span>
      </div>
    </div>
  );
});

const KpiCard = ({
  label,
  value,
  accent,
  emphasis,
}: {
  label: string;
  value: number;
  accent: string;
  emphasis?: boolean;
}) => (
  <div className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center gap-1.5">
      <span
        className="h-1.5 w-1.5 rounded-[2px]"
        style={{ backgroundColor: accent }}
      />
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
    </div>
    <p
      className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight"
      style={{ color: emphasis ? accent : COLOR.textPrimary }}
    >
      {emphasis && value >= 0 ? "+" : emphasis && value < 0 ? "\u2212" : ""}
      {formatCurrency(Math.abs(value))}
    </p>
  </div>
);
const Breadcrumb = ({
  viewMode,
  selectedYear,
  selectedMonth,
  onOverview,
  onYear,
}: {
  viewMode: "year" | "month" | "day";
  selectedYear: string | null;
  selectedMonth: string | null;
  onOverview: () => void;
  onYear: () => void;
}) => {
  const crumbs: { label: string; onClick?: () => void }[] = [
    {
      label: "Overview",
      onClick: viewMode !== "year" ? onOverview : undefined,
    },
  ];
  if (viewMode === "month" || viewMode === "day") {
    crumbs.push({
      label: selectedYear ?? "",
      onClick: viewMode === "day" ? onYear : undefined,
    });
  }
  if (viewMode === "day" && selectedMonth) {
    crumbs.push({ label: MONTH_NAMES_FULL[parseInt(selectedMonth, 10) - 1] });
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {crumbs.map((crumb, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
          {crumb.onClick ? (
            <button
              onClick={crumb.onClick}
              className="font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              {crumb.label}
            </button>
          ) : (
            <span className="font-semibold text-slate-900 dark:text-slate-50">
              {crumb.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function FinancialOverviewPage({
  userId,
  onViewChange,
}: FinancialOverviewPageProps) {
  const [rawData, setRawData] = useState<FinancialDataItem[]>([]);
  const [displayData, setDisplayData] = useState<FinancialDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"year" | "month" | "day">("year");
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const screenSize = useScreenSize();

  const getBarSize = () => {
    switch (screenSize) {
      case "small":
        return 10;
      case "medium":
        return 16;
      case "large":
        return 22;
      default:
        return 16;
    }
  };

  const getChartHeight = () => {
    switch (screenSize) {
      case "small":
        return 220;
      case "medium":
        return 280;
      case "large":
        return 320;
      default:
        return 280;
    }
  };

  // Fetch ---------------------------------------------------------------

  const fetchFinancialData = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE}/api/accounting/getdailyaccounting/${id}`,
        { method: "GET", credentials: "include" }
      );

      if (response.status === 404) {
        setRawData([]);
        setDisplayData([]);
        setError(null);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch financial data: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Expected array response but got: " + typeof data);
      }
      const formattedData = data.map((item: any) => ({
        name: item.date,
        income: Math.abs(item.sales),
        expenses: Math.abs(item.expenses),
        incomeWithTax: Math.abs(item.salesWithTax || item.sales),
        expensesWithTax: Math.abs(item.expensesWithTax || item.expenses),
        fullName: item.date,
        originalDate: new Date(item.date),
      }));
      setRawData(formattedData);
      processDataByYear(formattedData);
    } catch (err) {
      setRawData([]);
      setDisplayData([]);
      setError("Failed to load financial data");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!userId) {
      setError("No user ID provided");
      setLoading(false);
      return;
    }
    const handler = setTimeout(() => fetchFinancialData(userId), 300);
    return () => clearTimeout(handler);
  }, [userId, fetchFinancialData]);

  // Aggregation -----------------------------------------------------------

  const processDataByYear = useCallback((data: any[]) => {
    const yearlyData: { [key: string]: any } = {};
    data.forEach((item: any) => {
      const year = item.originalDate!.getFullYear().toString();
      if (!yearlyData[year]) {
        yearlyData[year] = { name: year, income: 0, expenses: 0, incomeWithTax: 0, expensesWithTax: 0, fullName: year };
      }
      yearlyData[year].income += item.income;
      yearlyData[year].expenses += item.expenses;
      yearlyData[year].incomeWithTax += (item.incomeWithTax || 0);
      yearlyData[year].expensesWithTax += (item.expensesWithTax || 0);
    });
    setDisplayData(
      Object.values(yearlyData).sort((a: any, b: any) => parseInt(a.name) - parseInt(b.name))
    );
  }, []);

  const processDataByMonth = useCallback((data: any[], year: string) => {
    const monthlyData: { [key: string]: any } = {};
    data.forEach((item: any) => {
      const date = item.originalDate!;
      if (date.getFullYear().toString() !== year) return;
      const monthIndex = date.getMonth();
      const monthKey = (monthIndex + 1).toString().padStart(2, "0");
      const monthDisplay = MONTH_NAMES_SHORT[monthIndex];
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          name: monthDisplay,
          fullName: `${monthDisplay} ${year}`,
          monthKey,
          income: 0,
          expenses: 0,
          incomeWithTax: 0,
          expensesWithTax: 0,
        };
      }
      monthlyData[monthKey].income += item.income;
      monthlyData[monthKey].expenses += item.expenses;
      monthlyData[monthKey].incomeWithTax += (item.incomeWithTax || 0);
      monthlyData[monthKey].expensesWithTax += (item.expensesWithTax || 0);
    });
    setDisplayData(
      Object.values(monthlyData).sort(
        (a: any, b: any) => parseInt(a.monthKey!) - parseInt(b.monthKey!)
      )
    );
  }, []);

  const processDataByDay = useCallback(
    (data: FinancialDataItem[], year: string, month: string) => {
      const filteredData = data
        .filter((item) => {
          const date = item.originalDate!;
          return (
            date.getFullYear().toString() === year &&
            (date.getMonth() + 1).toString().padStart(2, "0") === month
          );
        })
        .map((item) => ({ ...item, name: item.originalDate!.getDate().toString() }))
        .sort((a, b) => parseInt(a.name) - parseInt(b.name));
      setDisplayData(filteredData);
    },
    []
  );

  useEffect(() => {
    if (rawData.length === 0) return;
    if (viewMode === "year") processDataByYear(rawData);
    else if (viewMode === "month" && selectedYear) processDataByMonth(rawData, selectedYear);
    else if (viewMode === "day" && selectedYear && selectedMonth)
      processDataByDay(rawData, selectedYear, selectedMonth);
  }, [viewMode, selectedYear, selectedMonth, rawData, processDataByYear, processDataByMonth, processDataByDay]);

  useEffect(() => {
    onViewChange?.(viewMode, selectedYear, selectedMonth);
  }, [viewMode, selectedYear, selectedMonth, onViewChange]);

  // Navigation --------------------------------------------------------------

  const handleYearClick = useCallback((year: string) => {
    setSelectedYear(year);
    setViewMode("month");
  }, []);

  const handleMonthClick = useCallback((monthKey: string) => {
    setSelectedMonth(monthKey);
    setViewMode("day");
  }, []);

  const goToOverview = useCallback(() => {
    setViewMode("year");
    setSelectedYear(null);
    setSelectedMonth(null);
  }, []);

  const goToYear = useCallback(() => {
    setViewMode("month");
    setSelectedMonth(null);
  }, []);

  const handleBackClick = useCallback(() => {
    if (viewMode === "day") {
      setViewMode("month");
      setSelectedMonth(null);
    } else if (viewMode === "month") {
      setViewMode("year");
      setSelectedYear(null);
    }
  }, [viewMode]);

  // CSV export ----------------------------------------------------------

  const handleDownloadCSV = useCallback(() => {
    let csvContent = "data:text/csv;charset=utf-8,Period,Income,Expenses,Net Profit/Loss\n";
    let fileName = "financial-data";

    displayData.forEach((item) => {
      let period = item.name;
      if (viewMode === "month" && item.fullName) {
        period = item.fullName;
      } else if (viewMode === "day" && selectedYear && selectedMonth) {
        period = `${MONTH_NAMES_FULL[parseInt(selectedMonth, 10) - 1]} ${item.name}, ${selectedYear}`;
      }
      const netProfit = item.income - item.expenses;
      csvContent += `${period},${item.income.toFixed(2)},${item.expenses.toFixed(2)},${netProfit.toFixed(2)}\n`;
    });

    if (viewMode === "year") {
      fileName = "yearly-financial-data";
    } else if (viewMode === "month" && selectedYear) {
      fileName = `${selectedYear}-monthly-financial-data`;
    } else if (viewMode === "day" && selectedYear && selectedMonth) {
      fileName = `${selectedYear}-${MONTH_NAMES_FULL[parseInt(selectedMonth, 10) - 1]}-daily-financial-data`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [displayData, viewMode, selectedYear, selectedMonth]);

  // Derived values --------------------------------------------------------

  const chartTitle = useMemo(() => {
    if (viewMode === "month" && selectedYear) return `Monthly breakdown \u2014 ${selectedYear}`;
    if (viewMode === "day" && selectedYear && selectedMonth) {
      return `Daily breakdown \u2014 ${MONTH_NAMES_FULL[parseInt(selectedMonth, 10) - 1]} ${selectedYear}`;
    }
    return "Annual overview";
  }, [viewMode, selectedYear, selectedMonth]);

  const lineChartData = useMemo(
    () =>
      displayData.map((item) => ({
        ...item,
        netReal: item.income - item.expenses,
        net: Math.abs(item.income - item.expenses),
        expenses: Math.abs(item.expenses),
      })),
    [displayData]
  );

  const totals = useMemo(() => {
    const income = displayData.reduce((sum: any, item: any) => sum + item.income, 0);
    const expenses = displayData.reduce((sum: any, item: any) => sum + item.expenses, 0);
    const incomeWithTax = displayData.reduce((sum: any, item: any) => sum + (item.incomeWithTax || 0), 0);
    const expensesWithTax = displayData.reduce((sum: any, item: any) => sum + (item.expensesWithTax || 0), 0);
    return { income, expenses, net: income - expenses, incomeWithTax, expensesWithTax };
  }, [displayData]);

  // States ----------------------------------------------------------------

  if (loading) {
    return (
      <div className="h-full w-full">
        <SkeletonLoader />
      </div>
    );
  }

  if (error || rawData.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 py-16 dark:border-slate-800">
        <svg
          className="h-8 w-8 text-slate-300 dark:text-slate-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {error || "No financial data for this period"}
        </p>
      </div>
    );
  }

  // Render ------------------------------------------------------------------

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Breadcrumb
            viewMode={viewMode}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onOverview={goToOverview}
            onYear={goToYear}
          />
          <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {chartTitle}
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start">
          {viewMode !== "year" && (
            <button
              onClick={handleBackClick}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to {viewMode === "day" ? "Months" : "Years"}
            </button>
          )}

          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI summary strip */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-5">
        <KpiCard label="Revenue (excl. VAT)" value={totals.income} accent={COLOR.income} />
        <KpiCard label="Expenses (excl. VAT)" value={totals.expenses} accent={COLOR.expense} />
        <KpiCard label="Revenue (incl. VAT)" value={totals.incomeWithTax} accent={COLOR.income} />
        <KpiCard label="Expenses (incl. VAT)" value={totals.expensesWithTax} accent={COLOR.expense} />
        <KpiCard
          label="Net position"
          value={totals.net}
          accent={totals.net >= 0 ? COLOR.netUp : COLOR.netDown}
          emphasis
        />
      </div>

      {/* Bar chart */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Income vs. expenses
          </p>
          {viewMode !== "day" && (
            <p className="text-[11px] text-slate-400">
              Click a bar to drill down
            </p>
          )}
        </div>
        <div className="w-full" style={{ height: getChartHeight() }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayData}
              margin={{ top: 10, right: 4, left: 0, bottom: 0 }}
              onClick={(data) => {
                if (!data || !data.activePayload) return;
                const clickedItem = data.activePayload[0].payload;
                if (viewMode === "year") handleYearClick(clickedItem.name);
                else if (viewMode === "month") handleMonthClick(clickedItem.monthKey);
              }}
            >
              <CartesianGrid
                strokeDasharray="0"
                vertical={false}
                stroke={COLOR.grid}
                className="dark:opacity-20"
              />
              <XAxis
                dataKey="name"
                fontSize={11}
                stroke={COLOR.axis}
                tickLine={false}
                axisLine={{ stroke: COLOR.grid }}
                dy={8}
              />
              <YAxis
                fontSize={11}
                stroke={COLOR.axis}
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(v) => `${formatCurrency(v)}`}
              />
              <Tooltip
                content={<BarTooltip />}
                cursor={{ fill: "rgba(100, 116, 139, 0.06)" }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                iconType="square"
                iconSize={8}
              />
              <Bar
                dataKey="income"
                name="Income"
                fill={COLOR.income}
                cursor={viewMode !== "day" ? "pointer" : "default"}
                radius={[2, 2, 0, 0]}
                barSize={getBarSize()}
                animationDuration={400}
              />
              <Bar
                dataKey="expenses"
                name="Expenses"
                fill={COLOR.expense}
                cursor={viewMode !== "day" ? "pointer" : "default"}
                radius={[2, 2, 0, 0]}
                barSize={getBarSize()}
                animationDuration={400}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend chart */}
      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Net trend
        </p>
        <div className="w-full" style={{ height: getChartHeight() }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={lineChartData} margin={{ top: 10, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="netFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLOR.net} stopOpacity={0.12} />
                  <stop offset="100%" stopColor={COLOR.net} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke={COLOR.grid} className="dark:opacity-20" />
              <XAxis
                dataKey="name"
                fontSize={11}
                stroke={COLOR.axis}
                tickLine={false}
                axisLine={{ stroke: COLOR.grid }}
                dy={8}
              />
              <YAxis
                fontSize={11}
                stroke={COLOR.axis}
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(v) => `${formatCurrency(v)}`}
              />
              <Tooltip content={<TrendTooltip />} cursor={{ stroke: COLOR.grid, strokeWidth: 1 }} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} iconType="square" iconSize={8} />
              <Area
                type="monotone"
                dataKey="netReal"
                name="Profit/Loss"
                stroke={COLOR.net}
                strokeWidth={2}
                fill="url(#netFill)"
                dot={{ r: 3, strokeWidth: 0, fill: COLOR.net }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                animationDuration={400}
              />
              <Line
                type="monotone"
                dataKey="net"
                name="Net"
                stroke={COLOR.netAbs}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 0, fill: COLOR.netAbs }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                animationDuration={400}
              />
              <Line
                type="monotone"
                dataKey="income"
                name="Income"
                stroke={COLOR.income}
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                animationDuration={400}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke={COLOR.expense}
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                animationDuration={400}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
