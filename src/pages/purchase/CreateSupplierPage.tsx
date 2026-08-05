import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import { createSupplier } from "@/services/purchase.service";

export default function CreateSupplierPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [panError, setPanError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // IRD Compliance: validate PAN/VAT before submission
    const panVal = formData.taxNumber || "";
    if (panVal && !/^\d{9}$/.test(panVal)) {
      setPanError("PAN/VAT must be exactly 9 numeric digits (IRD Nepal requirement).");
      return;
    }
    setPanError("");

    setLoading(true);
    
    try {
      await createSupplier(formData);
      toast.success("Supplier registered successfully!");
      navigate("/purchase/suppliers");
    } catch (error: any) {
      toast.error(`Failed to register Supplier: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Register New Supplier</h1>
        <p className="text-slate-500 mt-1">Add a new vendor to your supplier database.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Company Name</label>
              <input name="companyName" required onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Contact Person</label>
              <input name="contactPerson" onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <input name="email" type="email" onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone Number</label>
              <input name="phone" type="tel" onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                PAN / VAT Number
                <span className="ml-1 text-xs text-amber-600 font-normal">(9 digits — IRD Required)</span>
              </label>
              <input
                name="taxNumber"
                maxLength={9}
                pattern="\d{9}"
                onChange={(e) => {
                  handleInputChange(e);
                  if (e.target.value && !/^\d{9}$/.test(e.target.value)) {
                    setPanError("PAN/VAT must be exactly 9 numeric digits.");
                  } else {
                    setPanError("");
                  }
                }}
                className={`w-full rounded-md border p-2 focus:ring-2 outline-none ${
                  panError ? "border-red-400 focus:ring-red-400" : "focus:ring-emerald-500"
                }`}
                placeholder="e.g. 123456789"
              />
              {panError && <p className="text-xs text-red-500 mt-1">{panError}</p>}
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-slate-700">Address</label>
              <textarea name="address" rows={2} onChange={handleInputChange} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>
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
              onClick={() => navigate("/purchase/suppliers")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
