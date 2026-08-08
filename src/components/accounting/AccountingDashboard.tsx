import { useAccounting } from "@/hooks/useAccounting";
import AccountingStats from "./AccountingStats";
import RecentTransactions from "./RecentTransactions";
import { CurrencyUtil } from "@/utils/currency.util";
import { AccountingDashboardProps } from "../../../types/accounting.types";

export default function AccountingDashboard({ startDate, endDate, dateRangeLabel }: AccountingDashboardProps = {}) {
  const { 
    stats, 
    vouchers: recentVouchers, 
    loading, 
    error, 
    refresh 
  } = useAccounting(startDate || endDate ? { startDate, endDate } : undefined);
  const handleTransactionAdded = async () => {
    await refresh();
  };

  const dashboardStats = stats ? {
    totalRevenue: stats.revenue,
    totalExpenses: stats.expenses,
    totalRevenueWithTax: stats.revenueWithTax,
    totalExpensesWithTax: stats.expensesWithTax,
    netProfit: stats.netProfit,
    accountsReceivable: stats.accountsReceivable,
    accountsPayable: stats.accountsPayable,
    cashBalance: stats.cashBalance,
    } : {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    accountsReceivable: 0,
    accountsPayable: 0,
    cashBalance: 0,
  };
  const mappedTransactions = (recentVouchers || []).map(v => ({
  id: v._id,
  _id: v._id,
  date: v.date,
  description: v.narration || v.description || v.title || v.voucherNumber,
  clientname: v.partyName,
  amount: CurrencyUtil.format(v.totalAmount),
  totalAmount: CurrencyUtil.format(v.totalAmount),
  type: v.type,
  voucherNumber: v.voucherNumber,
  referenceNumber: v.referenceNumber,
  paymentStatus: v.paymentStatus,
  updatedBy: v.updatedBy,
}));

  return (
    <div className="space-y-3">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      <AccountingStats 
        stats={dashboardStats} 
        startDate={startDate}
        endDate={endDate}
        dateRangeLabel={dateRangeLabel}
      />
      
      <RecentTransactions
        transactions={mappedTransactions}
        loading={loading}
        onTransactionAdded={handleTransactionAdded}
      />
    </div>
  );
}
