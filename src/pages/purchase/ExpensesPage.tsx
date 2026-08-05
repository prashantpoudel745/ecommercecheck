import { useEffect, useState } from "react";
import { fetchExpenses, approveExpense } from "@/services/purchase.service";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { useAuth } from "@/context/AuthContext";
export default function ExpensesPage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const loadExpenses = () => {
    setLoading(true);
    fetchExpenses()
      .then((res) => setData(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleApprove = async (expenseId: string) => {
    try {
      setApprovingId(expenseId);
      await approveExpense(expenseId);
      loadExpenses();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || error.message || "Unable to verify expense.");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Expenses</h1>
          <p className="text-xs sm:text-sm text-slate-500">Track and manage your company expenses</p>
        </div>
        <Link to="/purchase/expenses/new">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2">
            <Plus size={16} />
            Log Expense
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Reference No.</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Category</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Date</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Amount</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Description</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Proof</th>
                <th className="px-3 py-3 sm:px-6 sm:py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">No expenses found.</td></tr>
              ) : (
                data.map((item: any) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.expenseReference || "-"}</td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">{item.category}</td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">{new Date(item.date || item.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-red-500">-{formatCurrency(item.amount)}</td>
                    <td className="px-6 py-4 font-medium text-emerald-600 hover:text-emerald-800">
                      <Link to={`/purchase/expenses/view/${item._id}`} className="underline">{item.expenseReference || "View"}</Link>
                    </td>
                    <td className="px-6 py-4 max-w-[200px] truncate">{item.description || "-"}</td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">
                      {item.proofImageUrl ? (
                        <a href={item.proofImageUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-800">
                          <span className="h-8 w-8 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                            <img src={item.proofImageUrl} alt="Expense proof" className="h-full w-full object-cover" />
                          </span>
                          View
                        </a>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-3 py-3 sm:px-6 sm:py-4">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.approvalStatus === "APPROVED" ? "bg-emerald-100 text-emerald-700" : item.approvalStatus === "REJECTED" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                          {item.approvalStatus || item.status || "PENDING"}
                        </span>
                        {user?.role === "admin" && item.approvalStatus === "PENDING" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={approvingId === item._id}
                            onClick={() => handleApprove(item._id)}
                          >
                            {approvingId === item._id ? "Verifying..." : "Verify"}
                          </Button>
                        ) : null}
                      </div>
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
