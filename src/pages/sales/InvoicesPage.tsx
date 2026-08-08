import { useQuery } from "@tanstack/react-query";
import { fetchInvoices } from "@/services/sales.service";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

type InvoiceRow = {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  date?: string;
  createdAt?: string;
  totalAmount?: number | string;
  status?: string;
  customerPhone?:string;
  customerEmail?:string;
  paymentStatus?: string;
  amountPaid?: number | string;
  amountDue?: number | string;
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

  return (
    <div className="p-3 sm:p-4 lg:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-3">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-xs sm:text-sm text-slate-500">Manage all customer invoices</p>
        </div>
        <Link to="/sales/invoice/new">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2">
            <Plus size={16} />
            Create Invoice
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Invoice Number</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Customer</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Date</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Total Amount</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Status</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-4 text-center text-slate-400">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-4 text-center text-slate-400">No invoices found.</td></tr>
              ) : (
                data.map((item) => {
                  const totalAmount = parseMoney(item.totalAmount);
                  const amountDue = parseMoney(item.amountDue);
                  const canPay = amountDue > 0;

                  return (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 font-medium text-slate-900">{item.invoiceNumber}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-4">
                        <div className="font-medium text-slate-900">{item.customerName}</div>
                        <div className="text-xs text-slate-500">{item.customerEmail || ""}{item.customerEmail && item.customerPhone ? " • " : ""}{item.customerPhone || ""}</div>
                      </td>
                      <td className="px-3 py-3 sm:px-4 sm:py-4">{new Date(item.date || item.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-4 font-medium">{formatCurrency(totalAmount)}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-4 space-y-1">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                          {item.status || "SENT"}
                        </span>
                        <div className="text-[11px] font-medium uppercase tracking-wide">
                          <span className={`px-2 py-0.5 rounded-full ${item.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : item.paymentStatus === "partial" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                            {item.paymentStatus || "due"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Due: {formatCurrency(amountDue)}
                        </div>
                      </td>
                      <td className="px-3 py-3 sm:px-4 sm:py-4 text-center">
                        {canPay ? (
                          <Link to={`/sales/client-payment/new?invoiceId=${item._id}`} state={{ invoice: item }}>
                            <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-8 px-3">
                              <ArrowRight className="w-3 h-3 mr-1" /> To Pay
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-xs font-medium px-2 py-1 rounded bg-emerald-100 text-emerald-700">Paid</span>
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
