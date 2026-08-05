import { useEffect, useState } from "react";
import { fetchSalesOrders, convertSalesOrderToInvoice } from "@/services/sales.service";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { toast } from "@/utils/notify";

export default function SalesOrdersPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchSalesOrders()
      .then((res) => setData(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConvertToInvoice = async (id: string) => {
    setProcessingId(id);
    try {
      await convertSalesOrderToInvoice(id);
      toast.success("Successfully converted to Invoice!");
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to convert to Invoice");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Sales Orders</h1>
          <p className="text-xs sm:text-sm text-slate-500">Manage your confirmed sales orders</p>
        </div>
        <Link to="/sales/orders/new">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2">
            <Plus size={16} />
            Create Order
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Order Number</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Customer</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4 hidden sm:table-cell">Order Date</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Total Amount</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Status</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No sales orders found.</td></tr>
              ) : (
                data.map((item: any) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3 sm:px-6 sm:py-4 font-medium text-slate-900">{item.orderNumber}</td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">
                      <div className="font-medium text-slate-900">{item.customerName}</div>
                      <div className="text-xs text-slate-500">{item.customerEmail || ""}{item.customerEmail && item.customerPhone ? " • " : ""}{item.customerPhone || ""}</div>
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 hidden sm:table-cell">{new Date(item.orderDate || item.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 font-medium">{formatCurrency(item.totalAmount)}</td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 space-y-1">
                      {item.linkedInvoiceId ? (
                        <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-700">Invoiced</span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-1 rounded bg-amber-100 text-amber-700">Sales Order</span>
                      )}
                      <div className="text-[11px] font-medium uppercase tracking-wide">
                        <span className={`px-2 py-0.5 rounded-full ${item.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : item.paymentStatus === "partial" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                          {item.paymentStatus || "due"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4 flex gap-2 justify-center items-center">
                      {!item.linkedInvoiceId && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50 h-8 px-2"
                          onClick={() => handleConvertToInvoice(item._id)}
                          disabled={processingId === item._id}
                          title="Convert to Invoice"
                        >
                          {processingId === item._id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <ArrowRight className="w-3 h-3 mr-1" />} To Invoice
                        </Button>
                      )}
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
