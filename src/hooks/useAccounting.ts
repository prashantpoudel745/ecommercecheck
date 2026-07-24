import { useEffect, useState, useCallback } from "react";
import * as accountingService from "../services/accounting.service";
import { AccountingStats,Voucher,Account } from "../../types/accounting.types";
export function useAccounting(params?: { startDate?: string; endDate?: string }) {
  const [stats, setStats] = useState<AccountingStats | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, vouchersData, accountsData] = await Promise.all([
        accountingService.getDashboardStats(params),
        accountingService.getVouchers(),
        accountingService.getAccounts(),
      ]);
      setStats(statsData);
      setVouchers(vouchersData);
      setAccounts(accountsData);
    } catch (err: any) {
      // console.error("Error fetching accounting data:", err);
      setError(err.message || "Failed to fetch accounting data");
    } finally {
      setLoading(false);
    }
  }, [params?.startDate, params?.endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    stats,
    vouchers,
    accounts,
    loading,
    error,
    refresh: fetchData,
  };
}
