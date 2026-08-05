import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import { createExpense } from "@/services/purchase.service";
import { formatCurrency } from "@/utils/formatCurrency";

export default function CreateExpensePage() {
  const navigate = useNavigate();
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

      await createExpense(payload);
      toast.success("Expense logged successfully!");
      navigate("/purchase/expenses");
    } catch (error: any) {
      toast.error(`Failed to log Expense: ${error?.response?.data?.message || error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Log an Expense</h1>
        <p className="text-slate-500 mt-1">Record a business expense.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Category</label>
              <select name="category" required onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="OTHER">Other</option>
                <option value="TRAVEL">Travel</option>
                <option value="UTILITIES">Utilities</option>
                <option value="MEALS">Meals & Entertainment</option>
                <option value="SUPPLIES">Office Supplies</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Amount</label>
              <input name="amount" type="number" required onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">VAT Rate (%)</label>
              <input name="taxRate" type="number" min="0" step="0.01" value={formData.taxRate} onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="13" />
            </div>
            <div className="space-y-2 flex items-center gap-3 pt-7">
              <input name="taxIncluded" type="checkbox" checked={Boolean(formData.taxIncluded)} onChange={handleInputChange} className="rounded border-gray-300 w-4 h-4 text-emerald-600" />
              <label className="text-sm font-medium text-slate-700">Amount already includes VAT</label>
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea name="description" rows={3} onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="What was this expense for?"></textarea>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Reference / Receipt Number</label>
              <input name="expenseReference" onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Optional" />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-slate-700">Expense Proof</label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleProofChange}
                className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
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
