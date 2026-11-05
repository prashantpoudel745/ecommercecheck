import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, CalendarDays, TrendingUp } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchInvoices } from "@/services/sales.service";
import { formatCurrencyShort } from "@/utils/formatCurrency";
import { PredictionSkeleton } from "@/skeleton/predictionSkeleton/predictionSkeleton";

type Invoice = { date?: string; createdAt?: string; totalAmount?: number | string | { $numberDecimal?: string }; status?: string };
type Regression = { slope: number; intercept: number; rSquared: number; sampleSize: number };

const money = (value: Invoice["totalAmount"]) =>
  typeof value === "object" && value && "$numberDecimal" in value ? Number(value.$numberDecimal) || 0 : Number(value) || 0;

// Ordinary least squares regression over cumulative sales gives an end-of-period forecast.
const linearRegression = (values: number[]): Regression => {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: values[0] || 0, rSquared: 0, sampleSize: n };
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((sum, value) => sum + value, 0) / n;
  let numerator = 0, denominator = 0, totalVariance = 0;
  values.forEach((value, index) => {
    numerator += (index - xMean) * (value - yMean);
    denominator += (index - xMean) ** 2;
    totalVariance += (value - yMean) ** 2;
  });
  const slope = denominator ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;
  const residualVariance = values.reduce((sum, value, index) => sum + (value - (intercept + slope * index)) ** 2, 0);
  return { slope, intercept, rSquared: totalVariance ? Math.max(0, 1 - residualVariance / totalVariance) : 0, sampleSize: n };
};

const estimate = (model: Regression, index: number) => Math.max(0, model.intercept + model.slope * index);
const cumulative = (values: number[]) => values.reduce<number[]>((result, value) => [...result, (result.at(-1) || 0) + value], []);

export default function Prediction() {
  const [timeframe, setTimeframe] = useState<"month" | "year">("month");
  const { data: response, isLoading, isFetching } = useQuery({
    queryKey: ["sales", "invoices", "forecast"], queryFn: fetchInvoices,
    refetchOnMount: "always", refetchOnWindowFocus: true, refetchInterval: 30_000,
  });
  const invoices = useMemo(() => ((response?.data || []) as Invoice[]).filter((invoice) => !["VOID", "CANCELLED"].includes(String(invoice.status || "").toUpperCase())), [response]);

  const forecast = useMemo(() => {
    const now = new Date(), year = now.getFullYear(), month = now.getMonth(), day = now.getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const perDay = Array.from({ length: day }, () => 0), perMonth = Array.from({ length: month + 1 }, () => 0);
    let totalBusinessSales = 0;
    invoices.forEach((invoice) => {
      const invoiceDate = new Date(invoice.date || invoice.createdAt || ""), amount = money(invoice.totalAmount);
      if (Number.isNaN(invoiceDate.getTime()) || amount <= 0) return;
      totalBusinessSales += amount;
      if (invoiceDate.getFullYear() !== year) return;
      perMonth[invoiceDate.getMonth()] += amount;
      if (invoiceDate.getMonth() === month && invoiceDate.getDate() <= day) perDay[invoiceDate.getDate() - 1] += amount;
    });
    const dailyCumulative = cumulative(perDay), monthlyCumulative = cumulative(perMonth);
    const monthlyModel = linearRegression(dailyCumulative), yearlyModel = linearRegression(monthlyCumulative);
    const monthActual = dailyCumulative.at(-1) || 0, yearActual = monthlyCumulative.at(-1) || 0;
    return {
      totalBusinessSales, monthActual, yearActual,
      monthPrediction: Math.max(monthActual, estimate(monthlyModel, daysInMonth - 1)),
      yearPrediction: Math.max(yearActual, estimate(yearlyModel, 11)), monthlyModel, yearlyModel,
      monthData: Array.from({ length: daysInMonth }, (_, index) => ({
        label: String(index + 1), actualRevenue: index < day ? dailyCumulative[index] : undefined, predictedRevenue: estimate(monthlyModel, index),
      })),
      yearData: Array.from({ length: 12 }, (_, index) => ({
        label: new Date(year, index, 1).toLocaleString("default", { month: "short" }), actualRevenue: index <= month ? monthlyCumulative[index] : undefined, predictedRevenue: estimate(yearlyModel, index),
      })),
    };
  }, [invoices]);

  if (isLoading) return <PredictionSkeleton />;
  const isMonth = timeframe === "month", actual = isMonth ? forecast.monthActual : forecast.yearActual;
  const prediction = isMonth ? forecast.monthPrediction : forecast.yearPrediction;
  const model = isMonth ? forecast.monthlyModel : forecast.yearlyModel;
  const chartData = isMonth ? forecast.monthData : forecast.yearData;

  return <div className="space-y-4 p-3 sm:p-4">
    <section className="rounded-2xl border border-slate-200 bg-gradient-to-r from-sky-50 via-cyan-50 to-indigo-50 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-xl font-bold text-slate-900">Sales Forecast</h1><p className="mt-1 text-sm text-slate-600">Live invoice-based projection using linear regression. Forecasts refresh as sales change.</p></div><span className="inline-flex items-center gap-2 self-start rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm"><TrendingUp size={14} className="text-emerald-600" />{isFetching ? "Updating sales data…" : "Live sales data"}</span></div>
    </section>
    <div className="grid gap-3 sm:grid-cols-3"><MetricCard label="Total business sales" value={forecast.totalBusinessSales} icon={<BarChart3 size={17} />} /><MetricCard label="Projected monthly sales" value={forecast.monthPrediction} subtext={`Recorded: ${formatCurrencyShort(forecast.monthActual)}`} icon={<CalendarDays size={17} />} /><MetricCard label="Projected yearly sales" value={forecast.yearPrediction} subtext={`Recorded: ${formatCurrencyShort(forecast.yearActual)}`} icon={<TrendingUp size={17} />} /></div>
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-semibold text-slate-900">{isMonth ? "Monthly" : "Yearly"} sales projection</h2><p className="text-sm text-slate-500">{formatCurrencyShort(actual)} recorded {isMonth ? "this month" : "this year"}; projected to finish at {formatCurrencyShort(prediction)}.</p></div><div className="flex rounded-full bg-slate-100 p-1 text-sm"><button onClick={() => setTimeframe("month")} className={`rounded-full px-4 py-2 ${isMonth ? "bg-slate-900 text-white" : "text-slate-600"}`}>Monthly</button><button onClick={() => setTimeframe("year")} className={`rounded-full px-4 py-2 ${!isMonth ? "bg-slate-900 text-white" : "text-slate-600"}`}>Yearly</button></div></div>
      <div className="h-72 rounded-lg bg-slate-50/70 p-2"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="label" /><YAxis tickFormatter={(value) => formatCurrencyShort(Number(value))} /><Tooltip formatter={(value) => formatCurrencyShort(Number(value || 0))} labelFormatter={(label) => `${isMonth ? "Day" : "Month"}: ${label}`} /><Legend /><Line type="monotone" dataKey="actualRevenue" name="Recorded cumulative sales" stroke="#2563eb" strokeWidth={2.5} dot={false} connectNulls /><Line type="monotone" dataKey="predictedRevenue" name="Linear regression forecast" stroke="#059669" strokeWidth={2.5} strokeDasharray="6 4" dot={false} /></LineChart></ResponsiveContainer></div>
      <p className="mt-3 text-xs text-slate-500">Model quality: {model.sampleSize >= 2 ? `${Math.round(model.rSquared * 100)}% fit across ${model.sampleSize} ${isMonth ? "days" : "months"}` : "more sales history is needed for a reliable trend"}. Voided and cancelled invoices are excluded.</p>
    </section>
  </div>;
}

function MetricCard({ label, value, subtext, icon }: { label: string; value: number; subtext?: string; icon: ReactNode }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-2 text-sm text-slate-500">{icon}{label}</div><p className="mt-2 text-xl font-bold text-slate-900">{formatCurrencyShort(value)}</p>{subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}</div>;
}
