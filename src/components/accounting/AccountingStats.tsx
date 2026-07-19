import { StatCard } from "@/components/dashboard/StatCard";
import { DollarSign, CreditCard, ChartBar, Users, TrendingDown, Landmark } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
export default function AccountingStats({ stats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total Revenue"
        value={formatCurrency(stats.totalRevenue)}
        icon={<DollarSign size={18} />}
      />
      <StatCard
        title="Total Expenses"
        value={formatCurrency(stats.totalExpenses)}
        icon={<CreditCard size={18} />}
      />
      <StatCard
        title={stats.netProfit >= 0 ? "Net Profit" : "Net Loss"}
        value={formatCurrency(Math.abs(stats.netProfit))}
        icon={<ChartBar size={18} />}
      />
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
  );
}
