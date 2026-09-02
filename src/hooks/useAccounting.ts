import { useEffect, useState, useCallback } from "react";
import { getApiErrorMessage } from "@/utils/errorHandler";
import * as accountingService from "../services/accounting.service";
import { AccountingStats, Voucher, Account } from "../../types/accounting.types";

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
      setError(getApiErrorMessage(err, "Failed to fetch accounting data"));
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
