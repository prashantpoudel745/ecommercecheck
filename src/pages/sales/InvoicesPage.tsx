import { useQuery } from "@tanstack/react-query";
import { fetchInvoices } from "@/services/sales.service";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, ShieldCheck, FileSpreadsheet, Calendar, Lock } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

type InvoiceRow = {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  date?: string;
  createdAt?: string;
  totalAmount?: number | string;
  status?: string;
  customerPhone?: string;
  customerEmail?: string;
  paymentStatus?: string;
  amountPaid?: number | string;
  amountDue?: number | string;
  buyerPAN?: string;
  miti?: string;
  irdSyncStatus?: string;
};

export default function InvoicesPage() {
  const { data: response, isLoading: loading } = useQuery({
    queryKey: ["sales", "invoices"],
    queryFn: fetchInvoices,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const data = (response?.data || []) as InvoiceRow[];
  const parseMoney = (value: number | string | { $numberDecimal?: number | string } | null | undefined) => {
    if (value == null) return 0;
    if (typeof value === "object" && "$numberDecimal" in value) {
      return Number(value.$numberDecimal) || 0;
    }
    return Number(value) || 0;
  };

  const totalSalesVal = data.reduce((acc, cur) => acc + parseMoney(cur.totalAmount), 0);
  const totalDueVal = data.reduce((acc, cur) => acc + parseMoney(cur.amountDue), 0);

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 p-2 sm:p-4 text-slate-900">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Tax Invoices (कर विजक)
            </h1>
            <span className="badge-fiscal">
              <Calendar size={12} className="text-slate-500" />
              FY 2082/83
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Sequential computerized billing register compliant with Nepal IRD Annex 8.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/sales/invoice/new">
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all active:scale-[0.99]">
              <Plus size={14} />
              Issue Tax Invoice
            </button>
          </Link>
        </div>
      </div>

      {/* ── Summary Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
          <p className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
            Total Invoices Issued
          </p>
          <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {data.length} Bills
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
          <p className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
            Gross Registered Sales
          </p>
          <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {formatCurrency(totalSalesVal)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
          <p className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
            Outstanding Due Receivables
          </p>
          <p className="text-xl font-bold text-amber-700 mt-1 tabular-nums">
            {formatCurrency(totalDueVal)}
          </p>
        </div>
      </div>

      {/* ── Main Data Table ───────────────────────────────── */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200/80 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Sequential Bill No</th>
                <th className="px-4 py-3">Customer & PAN</th>
                <th className="px-4 py-3">Date (Miti / AD)</th>
                <th className="px-4 py-3 text-right">Total (NPR)</th>
                <th className="px-4 py-3">CBMS & Audit</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Loading invoices from secure ledger...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No tax invoices recorded in this fiscal period.
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const totalAmount = parseMoney(item.totalAmount);
                  const amountDue = parseMoney(item.amountDue);
                  const canPay = amountDue > 0;
                  const isVoid = item.status === "VOID";

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Sequential Invoice Number */}
                      <td className="px-4 py-3.5 font-medium">
                        <div className="flex items-center gap-1.5 font-mono text-slate-900 font-semibold">
                          <Lock size={11} className="text-slate-400" />
                          {item.invoiceNumber}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          IRD Strict Sequence
                        </div>
                      </td>

                      {/* Customer & PAN */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">
                          {item.customerName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {item.buyerPAN ? `PAN: ${item.buyerPAN}` : "Individual (No PAN)"}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-900">
                          {item.miti || new Date(item.date || item.createdAt || "").toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(item.date || item.createdAt || "").toLocaleDateString()}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="px-4 py-3.5 text-right font-semibold text-slate-900 tabular-nums">
                        {formatCurrency(totalAmount)}
                      </td>

                      {/* CBMS & Status */}
                      <td className="px-4 py-3.5">
                        {isVoid ? (
                          <span className="badge-void">VOIDED</span>
                        ) : item.irdSyncStatus === "SYNCED" ? (
                          <span className="badge-synced">
                            <ShieldCheck size={11} /> CBMS Synced
                          </span>
                        ) : (
                          <span className="badge-pending">
                            Pending Sync
                          </span>
                        )}
                      </td>

                      {/* Payment State */}
                      <td className="px-4 py-3.5 space-y-0.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            item.paymentStatus === "paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : item.paymentStatus === "partial"
                              ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {item.paymentStatus || "due"}
                        </span>
                        {canPay && (
                          <div className="text-[11px] text-slate-500 tabular-nums">
                            Due: {formatCurrency(amountDue)}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-center">
                        {canPay && !isVoid ? (
                          <Link
                            to={`/sales/client-payment/new?invoiceId=${item._id}`}
                            state={{ invoice: item }}
                          >
                            <button className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors">
                              <ArrowRight size={12} />
                              Pay
                            </button>
                          </Link>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400">
                            Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
