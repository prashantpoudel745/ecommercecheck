import { useEffect, useState } from "react";
import { fetchPurchaseOrders } from "@/services/purchase.service";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function PurchaseOrdersPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchaseOrders()
      .then((res) => setData(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
          <p className="text-slate-500">Manage purchase orders to suppliers</p>
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
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">PO Number</th>
                <th className="px-6 py-4">Supplier Name</th>
                <th className="px-6 py-4">Order Date</th>
                <th className="px-6 py-4">Expected Delivery</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No purchase orders found.</td></tr>
              ) : (
                data.map((item: any) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.orderNumber}</td>
                    <td className="px-6 py-4">{item.supplierName}</td>
                    <td className="px-6 py-4">{new Date(item.orderDate || item.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{item.expectedDeliveryDate ? new Date(item.expectedDeliveryDate).toLocaleDateString() : "-"}</td>
                    <td className="px-6 py-4 font-medium">${item.totalAmount?.$numberDecimal || 0}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                        {item.status || "PENDING"}
                      </span>
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
