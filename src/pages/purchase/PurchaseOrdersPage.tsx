import { useEffect, useState } from "react";
import { fetchPurchaseOrders, convertPurchaseOrderToBill } from "@/services/purchase.service";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { toast } from "@/utils/notify";

export default function PurchaseOrdersPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchPurchaseOrders()
      .then((res) => setData(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConvertToBill = async (id: string) => {
    setProcessingId(id);
    try {
      await convertPurchaseOrderToBill(id);
      toast.success("Successfully converted to Purchase Bill!");
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to convert to Purchase Bill");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-3">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Purchase Orders</h1>
          <p className="text-xs sm:text-sm text-slate-500">Manage purchase orders to suppliers</p>
        </div>
        <Link to="/purchase/orders/new">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2">
            <Plus size={16} />
            Create Purchase Order
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-3 py-3 sm:px-4 sm:py-4">PO Number</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Supplier Name</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Order Date</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Expected Delivery</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Total Amount</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Status</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-4 text-center text-slate-400">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-4 text-center text-slate-400">No purchase orders found.</td></tr>
              ) : (
                data.map((item: any) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-medium text-slate-900">{item.orderNumber}</td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4">
                      <div className="font-medium text-slate-900">{item.supplierName}</div>
                      <div className="text-xs text-slate-500">{item.supplierEmail || item.supplierPhone ? `${item.supplierEmail || ""}${item.supplierEmail && item.supplierPhone ? " • " : ""}${item.supplierPhone || ""}` : ""}</div>
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4">{new Date(item.orderDate || item.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4">{item.expectedDeliveryDate ? new Date(item.expectedDeliveryDate).toLocaleDateString() : "-"}</td>
                    <td className="px-4 py-4 font-medium">{formatCurrency(item.totalAmount)}</td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4">
                      {item.linkedPurchaseBillId ? (
                        <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-700">Billed</span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-1 rounded bg-amber-100 text-amber-700">Purchase Order</span>
                      )}
                    </td>
                    <td className="px-3 py-3 sm:px-4 sm:py-4 flex gap-2 justify-center items-center">
                      {!item.linkedPurchaseBillId && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-amber-600 border-amber-200 hover:bg-amber-50 h-8 px-2"
                          onClick={() => handleConvertToBill(item._id)}
                          disabled={processingId === item._id}
                          title="Convert to Bill"
                        >
                          {processingId === item._id ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <ArrowRight className="w-3 h-3 mr-1" />} To Bill
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
