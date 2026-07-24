import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createExpense } from "@/services/purchase.service";

export default function CreateExpensePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({ category: "OTHER" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createExpense(formData);
      toast.success("Expense logged successfully!");
      navigate("/purchase/expenses");
    } catch (error: any) {
      toast.error(`Failed to log Expense: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Log an Expense</h1>
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
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea name="description" rows={3} onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="What was this expense for?"></textarea>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Reference / Receipt Number</label>
              <input name="expenseReference" onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Optional" />
            </div>
          </div>
          
          <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
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
        </form>
      </div>
    </div>
  );
}
