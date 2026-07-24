import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createCreditNote } from "@/services/sales.service";

export default function CreateCreditNotePage() {
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
      await createCreditNote(formData);
      toast.success("Credit Note created successfully!");
      navigate("/sales/credit-notes");
    } catch (error: any) {
      toast.error(`Failed to create Credit Note: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create New Credit Note</h1>
        <p className="text-slate-500 mt-1">Fill out the details below to issue a credit note.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Customer Name</label>
              <input name="customerName" required onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Credit Amount</label>
              <input name="amount" type="number" required onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-slate-700">Reason</label>
              <input name="reason" onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
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
              onClick={() => navigate("/sales/credit-notes")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
