import { useEffect, useState } from "react";
import { fetchCreditNotes } from "@/services/sales.service";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

export default function CreditNotesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreditNotes()
      .then((res) => setData(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Credit Notes</h1>
          <p className="text-xs sm:text-sm text-slate-500">Manage customer credit notes and refunds</p>
        </div>
        <Link to="/sales/credit-notes/new">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2">
            <Plus size={16} />
            Create Credit Note
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Credit Note #</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Customer Name</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Date</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Amount</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No credit notes found.</td></tr>
              ) : (
                data.map((item: any) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.creditNoteNumber}</td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">{item.customerName}</td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">{new Date(item.date || item.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(item.amount)}</td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                        {item.status || "ISSUED"}
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
