import { StatCard } from "@/components/dashboard/StatCard";
import { DollarSign, CreditCard, ChartBar } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
export default function AccountingStats({ stats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        // className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 p-3 border-blue-100"
        title="Total Revenue"
        value={formatCurrency(stats.totalRevenue)}
        icon={<DollarSign size={18} />}
      />
      <StatCard
        // className="bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 p-3 border-orange-100"
        title="Total Expenses"
        value={formatCurrency(stats.totalExpenses)}
        icon={<CreditCard size={18} />}
      />
      <StatCard
        title={stats.netProfit >= 0 ? "Net Profit" : "Net Loss"}
        value={formatCurrency(Math.abs(stats.netProfit))}
        icon={<ChartBar size={18} />}
        // className={
        //   stats.netProfit >= 0
        //     ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 p-3 border-green-100"
        //     : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 p-3 border-red-100"
        // }
      />
    </div>
  );
}
