import { useAccounting } from "@/hooks/useAccounting";
import AccountingStats from "./AccountingStats";
import RecentTransactions from "./RecentTransactions";
export default function AccountingDashboard() {
  const { 
    stats, 
    vouchers: recentVouchers, 
    loading, 
    error, 
    refresh 
  } = useAccounting();

  const handleTransactionAdded = async () => {
    await refresh();
  };

  const dashboardStats = stats ? {
    totalRevenue: stats.revenue,
    totalExpenses: stats.expenses,
    netProfit: stats.netProfit
    } : {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      <AccountingStats 
        stats={dashboardStats} 
      />
      
      <RecentTransactions
        transactions={recentVouchers}
        loading={loading}
        onTransactionAdded={handleTransactionAdded}
      />
    </div>
  );
}