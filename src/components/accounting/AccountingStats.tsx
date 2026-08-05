import { StatCard } from "@/components/dashboard/StatCard";
import { DollarSign, CreditCard, ChartBar, Users, TrendingDown, Landmark } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { CurrencyUtil } from "@/utils/currency.util";
import { AccountingStatsProps } from "../../../types/accounting.types";


export default function AccountingStats({ stats, startDate, endDate, dateRangeLabel }: AccountingStatsProps) {
  const formatDateLabel = () => {
    if (dateRangeLabel) return dateRangeLabel;
    if (startDate && endDate) {
      const start = new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const end = new Date(endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      return `for ${start} – ${end}`;
    }
    if (startDate) {
      const start = new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      return `from ${start}`;
    }
    if (endDate) {
      const end = new Date(endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      return `until ${end}`;
    }
    return "for All Time";
  };

  const performancePeriodText = formatDateLabel();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Performance Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">Performance</h3>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {performancePeriodText}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <StatCard
            title="Revenue (excl. VAT)"
            value={formatCurrency(stats.totalRevenue)}
            icon={<DollarSign size={18} />}
          />
          <StatCard
            title="Expenses (excl. VAT)"
            value={formatCurrency(stats.totalExpenses)}
            icon={<CreditCard size={18} />}
          />
          <StatCard
            title="Revenue (incl. VAT)"
            value={formatCurrency(stats.totalRevenueWithTax ?? stats.totalRevenue)}
            icon={<DollarSign size={18} />}
          />
          <StatCard
            title="Expenses (incl. VAT)"
            value={formatCurrency(stats.totalExpensesWithTax ?? stats.totalExpenses)}
            icon={<CreditCard size={18} />}
          />
          <StatCard
            title={CurrencyUtil.parse(stats.netProfit).greaterThanOrEqualTo(0) ? "Net Profit" : "Net Loss"}
            value={formatCurrency(CurrencyUtil.parse(stats.netProfit).abs())}
            icon={<ChartBar size={18} />}
          />
        </div>
      </section>

      {/* Current Position Section */}
      {(stats.accountsReceivable !== undefined || stats.accountsPayable !== undefined || stats.cashBalance !== undefined) && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900">Current Position</h3>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                as of today
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {stats.accountsReceivable !== undefined && (
              <StatCard
                title="Accounts Receivable"
                value={formatCurrency(stats.accountsReceivable)}
                icon={<Users size={18} />}
              />
            )}
            {stats.accountsPayable !== undefined && (
              <StatCard
                title="Accounts Payable"
                value={formatCurrency(stats.accountsPayable)}
                icon={<TrendingDown size={18} />}
              />
            )}
            {stats.cashBalance !== undefined && (
              <StatCard
                title="Cash & Bank Balance"
                value={formatCurrency(stats.cashBalance)}
                icon={<Landmark size={18} />}
              />
            )}
          </div>
        </section>
      )}
    </div>
  );
}
