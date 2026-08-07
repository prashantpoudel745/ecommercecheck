import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import { createExpense } from "@/services/purchase.service";
import { formatCurrency } from "@/utils/formatCurrency";

type ExpenseRow = {
  _id: string;
  expenseReference?: string;
  category?: string;
  description?: string;
  amount?: number | string;
  date?: string;
  createdAt?: string;
  proofImageUrl?: string;
  approvalStatus?: string;
  status?: string;
  pending?: boolean;
};

export default function CreateExpensePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");
  const [formData, setFormData] = useState<any>({ category: "OTHER", taxRate: 13, taxIncluded: false });

  const amount = Number(formData.amount || 0);
  const rate = Number(formData.taxRate || 0) / 100;
  const taxAmount = formData.taxIncluded && rate > 0 ? amount - amount / (1 + rate) : amount * rate;
  const subtotal = formData.taxIncluded ? amount - taxAmount : amount;
  const totalAmount = formData.taxIncluded ? amount : amount + taxAmount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProofFile(file);
    if (file) {
      setProofPreview(URL.createObjectURL(file));
    } else {
      setProofPreview("");
    }
  };

  useEffect(() => {
    return () => {
      if (proofPreview) URL.revokeObjectURL(proofPreview);
    };
  }, [proofPreview]);

  const createExpenseMutation = useMutation({
    mutationFn: async (payload: FormData) => createExpense(payload),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["purchase", "expenses"] });

      const previous = queryClient.getQueryData<{ data: ExpenseRow[] }>(["purchase", "expenses"]);

      const optimisticExpense: ExpenseRow = {
        _id: `temp-${Date.now()}`,
        expenseReference: formData.expenseReference || `EXP-${Date.now()}`,
        category: formData.category || "OTHER",
        description: formData.description || "",
        amount: totalAmount,
        date: new Date().toISOString(),
        proofImageUrl: proofPreview || "",
        approvalStatus: "PENDING",
        status: "PENDING",
        pending: true,
      };

      queryClient.setQueryData<{ data: ExpenseRow[] }>(["purchase", "expenses"], (old) => ({
        data: [optimisticExpense, ...(old?.data || [])],
      }));

      return { previous };
    },
    onError: (error: unknown, _payload, context) => {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      queryClient.setQueryData<{ data: ExpenseRow[] }>(["purchase", "expenses"], context?.previous);
      toast.error(`Failed to log Expense: ${apiError?.response?.data?.message || apiError.message || "Unknown error"}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchase", "expenses"] });
      toast.success("Expense logged successfully!");
      navigate("/purchase/expenses");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          payload.append(key, String(value));
        }
      });
      if (proofFile) {
        payload.append("proofImage", proofFile);
      }

      await createExpenseMutation.mutateAsync(payload);
    } catch {
      // mutation handles toast/error lifecycle
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto w-full">
      <div className="mb-6 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 p-5 shadow-sm">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Log an Expense</h1>
        <p className="text-slate-500 mt-1">Record a business expense with proof upload and VAT calculation.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Category</label>
              <select name="category" required onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100">
                <option value="OTHER">Other</option>
                <option value="TRAVEL">Travel</option>
                <option value="UTILITIES">Utilities</option>
                <option value="MEALS">Meals & Entertainment</option>
                <option value="SUPPLIES">Office Supplies</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Amount</label>
              <input name="amount" type="number" required onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">VAT Rate (%)</label>
              <input name="taxRate" type="number" min="0" step="0.01" value={formData.taxRate} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" placeholder="13" />
            </div>
            <div className="space-y-2 flex items-center gap-3 pt-7">
              <input name="taxIncluded" type="checkbox" checked={Boolean(formData.taxIncluded)} onChange={handleInputChange} className="rounded border-gray-300 w-4 h-4 text-emerald-600" />
              <label className="text-sm font-medium text-slate-700">Amount already includes VAT</label>
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea name="description" rows={3} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" placeholder="What was this expense for?"></textarea>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Reference / Receipt Number</label>
              <input name="expenseReference" onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" placeholder="Optional" />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-slate-700">Expense Proof</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleProofChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
              />
              {proofPreview ? (
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <img src={proofPreview} alt="Expense proof preview" className="h-24 w-24 rounded-md object-cover border border-slate-200" />
                  <button
                    type="button"
                    onClick={() => {
                      setProofFile(null);
                      setProofPreview("");
                    }}
                    className="text-sm text-emerald-600 hover:text-emerald-800"
                  >
                    Remove image
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          
          <div className="flex flex-col gap-4 border-t border-slate-100 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span>VAT Amount</span><span>{formatCurrency(taxAmount)}</span></div>
              <div className="flex justify-between"><span>Total Amount</span><span className="font-semibold">{formatCurrency(totalAmount)}</span></div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                type="submit" 
                disabled={loading} 
                className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[120px]"
              >
                {loading ? "Saving..." : "Save Record"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/purchase/expenses")}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
