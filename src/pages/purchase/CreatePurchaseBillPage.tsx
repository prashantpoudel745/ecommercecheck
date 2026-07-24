import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createPurchaseBill } from "@/services/purchase.service";

export default function CreatePurchaseBillPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createPurchaseBill(formData);
      toast.success("Purchase Bill recorded successfully!");
      navigate("/purchase/bills");
    } catch (error: any) {
      toast.error(`Failed to record Bill: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Record Purchase Bill</h1>
        <p className="text-slate-500 mt-1">Record a bill received from a supplier.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Supplier Name</label>
              <input name="supplierName" required onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Enter supplier name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Bill Number (from Supplier)</label>
              <input name="billNumber" required onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. INV-2023-01" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Due Date</label>
              <input name="dueDate" type="date" required onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Total Amount</label>
              <input name="totalAmount" type="number" required onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0.00" />
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
              onClick={() => navigate("/purchase/bills")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
