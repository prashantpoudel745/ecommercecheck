import { useEffect, useState, useCallback } from "react";
import * as accountingService from "../services/accounting.service";

export function useAccounting() {
  const [stats, setStats] = useState<accountingService.AccountingStats | null>(null);
  const [vouchers, setVouchers] = useState<accountingService.Voucher[]>([]);
  const [accounts, setAccounts] = useState<accountingService.Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, vouchersData, accountsData] = await Promise.all([
        accountingService.getDashboardStats(),
        accountingService.getVouchers(),
        accountingService.getAccounts(),
      ]);
      setStats(statsData);
      setVouchers(vouchersData);
      setAccounts(accountsData);
    } catch (err: any) {
      console.error("Error fetching accounting data:", err);
      setError(err.message || "Failed to fetch accounting data");
    } finally {
      setLoading(false);
    }
  }, []);

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
