import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import { fetchExpenseById } from "@/services/purchase.service";
import { formatCurrency } from "@/utils/formatCurrency";

type ExpenseDetails = {
  _id?: string;
  expenseReference?: string;
  category?: string;
  amount?: number | string;
  status?: string;
  description?: string;
  date?: string | number;
  createdAt?: string | number;
  taxRate?: number | string;
  proofImageUrl?: string;
};

export default function ExpenseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState<ExpenseDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchExpenseById(id)
      .then((res) => {
        setExpense(res.data || null);
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || error.message || "Unable to load expense.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-6 text-slate-600">Loading expense...</div>;
  }

  if (!expense) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-slate-700">
          <p>Expense not found.</p>
          <Button className="mt-4" onClick={() => navigate("/purchase/expenses")}>Back to expenses</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Expense Details</h1>
          <p className="text-slate-500">Review the expense proof and record details.</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/purchase/expenses")}>Back to expenses</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Reference</p>
            <p className="font-semibold text-slate-900">{expense.expenseReference || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Category</p>
            <p className="font-semibold text-slate-900">{expense.category || "Other"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Amount</p>
            <p className="font-semibold text-slate-900">{formatCurrency(expense.amount)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
            <p className="font-semibold text-slate-900">{expense.status || "PENDING"}</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Description</p>
          <p className="text-slate-700">{expense.description || "No description provided."}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Date</p>
            <p className="font-semibold text-slate-900">{new Date(expense.date || expense.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">VAT Rate</p>
            <p className="font-semibold text-slate-900">{expense.taxRate ?? 0}%</p>
          </div>
        </div>

        {expense.proofImageUrl ? (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Proof image</p>
            <a href={expense.proofImageUrl} target="_blank" rel="noreferrer noopener" className="block rounded-xl border border-slate-200 overflow-hidden max-w-md">
              <img src={expense.proofImageUrl} alt="Expense proof" className="w-full object-cover" />
            </a>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-slate-500">No proof image attached.</div>
        )}
      </div>
    </div>
  );
}
