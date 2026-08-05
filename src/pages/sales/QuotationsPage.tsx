import { useEffect, useState } from "react";
import { fetchQuotations, updateQuotationStatus, sendQuotationEmail, convertQuotationToSalesOrder } from "@/services/sales.service";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Loader2, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { toast } from "@/utils/notify";

type QuotationRow = {
  _id: string;
  quotationNumber: string;
  customerName: string;
  customerEmail?: string;
  date?: string;
  createdAt?: string;
  totalAmount?: number | string;
  paymentStatus?: string;
  convertedInvoiceId?: string;
  customerPhone:string;
  convertedSalesOrderId?: string;
};

export default function QuotationsPage() {
  const [data, setData] = useState<QuotationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchQuotations()
      .then((res) => setData((res.data || []) as QuotationRow[]))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);


  const handleSendEmail = async (id: string, email: string) => {
    if (!email) {
      const manualEmail = prompt("Please enter customer email:");
      if (!manualEmail) return;
      email = manualEmail;
    }
    
    setProcessingId(id);
    try {
      await sendQuotationEmail(id, email);
      toast.success("Quotation emailed successfully!");
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send email");
    } finally {
      setProcessingId(null);
    }
  };

  const handleConvertToSO = async (id: string) => {
    setProcessingId(id);
    try {
      await convertQuotationToSalesOrder(id);
      toast.success("Successfully converted to Sales Order!");
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to convert to Sales Order");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Quotations</h1>
          <p className="text-xs sm:text-sm text-slate-500">Manage all your sales quotations</p>
        </div>
        <Link to="/sales/quotations/new">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2">
            <Plus size={16} />
            Create Quotation
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Quotation Number</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Customer</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Date</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Total Amount</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Status</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No quotations found.</td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.quotationNumber}</td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">
                      <div className="font-medium text-slate-900">{item.customerName}</div>
                      <div className="text-xs text-slate-500">{item.customerEmail || ""}{item.customerEmail && item.customerPhone ? " • " : ""}</div>
                      <div className="text-xs text-slate-500">{item.customerPhone}</div>
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">{new Date(item.date || item.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(item.totalAmount)}</td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 space-y-1">
                      {item.convertedInvoiceId ? (
                        <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-700">Invoiced</span>
                      ) : item.convertedSalesOrderId ? (
                        <span className="text-xs font-medium px-2 py-1 rounded bg-amber-100 text-amber-700">Sales Order</span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 text-slate-700">Quotation</span>
                      )}
                      <div className="text-[11px] font-medium uppercase tracking-wide">
                        <span className={`px-2 py-0.5 rounded-full ${item.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : item.paymentStatus === "partial" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                          {item.paymentStatus || "due"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 flex gap-2 justify-center items-center">
                      {!item.convertedSalesOrderId && !item.convertedInvoiceId && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-amber-600 border-amber-200 hover:bg-amber-50 h-8 px-2"
                          onClick={() => handleConvertToSO(item._id)}
                          disabled={processingId === item._id}
                          title="Convert to Sales Order"
                        >
                          {processingId === item._id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <ArrowRight className="w-3 h-3 mr-1" />} To SO
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSendEmail(item._id, item.customerEmail)}
                        disabled={processingId === item._id || !!item.convertedSalesOrderId || !!item.convertedInvoiceId}
                        className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                        title={item.convertedSalesOrderId ? "Cannot resend after converting to Sales Order" : "Send PDF via Email"}
                      >
                        {processingId === item._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
