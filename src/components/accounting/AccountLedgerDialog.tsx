import { useEffect, useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency, type DecimalValue } from "@/utils/formatCurrency";
import { getAccountLedger } from "@/services/accounting.service";
import type { Account } from "../../../types/accounting.types";

type LedgerEntry = {
  id: string;
  date: string;
  voucherNumber: string;
  voucherType: string;
  paymentMethod?: string;
  referenceNumber?: string;
  narration: string;
  partyName?: string;
  debit: DecimalValue;
  credit: DecimalValue;
  balance: DecimalValue;
  balanceType: "DEBIT" | "CREDIT";
};

export function AccountLedgerDialog({ account, open, onOpenChange }: {
  account: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [openingBalance, setOpeningBalance] = useState<DecimalValue>(0);
  const [openingBalanceType, setOpeningBalanceType] = useState("DEBIT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !account) return;
    let active = true;
    setLoading(true);
    setError(null);
    getAccountLedger(account._id)
      .then((data) => {
        if (!active) return;
        setEntries(data.entries || []);
        setOpeningBalance(data.openingBalance || 0);
        setOpeningBalanceType(data.openingBalanceType || "DEBIT");
      })
      .catch((err) => active && setError(err?.response?.data?.message || "Unable to load ledger history"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [account, open]);

  const closing = entries[entries.length - 1];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] grid-rows-[auto_minmax(0,1fr)] overflow-hidden p-0 gap-0">
        <DialogHeader className="border-b border-slate-200 p-5 pr-12">
          <DialogTitle className="flex items-center gap-2 text-slate-900"><BookOpen className="h-5 w-5 text-indigo-600" /> {account?.name} — Ledger History</DialogTitle>
          <DialogDescription>{account?.code} · Posted voucher entries only</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto overscroll-contain p-5">
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Summary label="Opening balance" value={formatCurrency(openingBalance)} suffix={openingBalanceType} />
            <Summary label="Posted entries" value={String(entries.length)} />
            <Summary label="Closing balance" value={closing ? formatCurrency(closing.balance) : formatCurrency(openingBalance)} suffix={closing?.balanceType || openingBalanceType} />
          </div>
          {loading ? <div className="flex justify-center gap-2 py-14 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading ledger history…</div>
            : error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
            : <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Voucher</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Narration</th>
                    <th className="px-4 py-3 text-right">Debit</th>
                    <th className="px-4 py-3 text-right">Credit</th>
                    <th className="px-4 py-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-indigo-50/40">
                    <td className="px-4 py-3 font-medium" colSpan={4}>Opening balance</td>
                    <td />
                    <td />
                    <td className="px-4 py-3 text-right font-bold">
                      {formatCurrency(openingBalance)} <span className="text-[10px] text-slate-500">{openingBalanceType}</span>
                    </td>
                  </tr>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-indigo-700">{entry.voucherNumber}</p>
                        <p className="text-[10px] text-slate-400">{entry.voucherType}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {entry.paymentMethod && entry.paymentMethod !== "—" ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              entry.paymentMethod.toLowerCase().includes("cash")
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : entry.paymentMethod.toLowerCase().includes("bank")
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : entry.paymentMethod.toLowerCase().includes("cheque") ||
                                  entry.paymentMethod.toLowerCase().includes("check")
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-purple-100 text-purple-800 border border-purple-200"
                            }`}
                          >
                            {entry.paymentMethod}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                        {entry.referenceNumber && (
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{entry.referenceNumber}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p>{entry.narration}</p>
                        {entry.partyName && <p className="mt-0.5 text-[10px] text-slate-400">{entry.partyName}</p>}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-700">{formatCurrency(entry.debit)}</td>
                      <td className="px-4 py-3 text-right font-mono text-rose-700">{formatCurrency(entry.credit)}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold">
                        {formatCurrency(entry.balance)} <span className="text-[10px] text-slate-400">{entry.balanceType}</span>
                      </td>
                    </tr>
                  ))}
                  {!entries.length && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                        No posted transactions for this ledger.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Summary({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-sm font-bold text-slate-900">{value} {suffix && <span className="text-[10px] text-slate-500">{suffix}</span>}</p></div>;
}
