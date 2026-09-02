import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import { createSupplier } from "@/services/purchase.service";

type SupplierRow = {
  _id: string;
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
  status?: string;
  pending?: boolean;
};

export default function CreateSupplierPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const resetForm = () => setFormData({});

  const createMutation = useMutation({
    mutationFn: (payload: any) => createSupplier(payload),
    onMutate: async (payload: any) => {
      await queryClient.cancelQueries({ queryKey: ["purchase", "suppliers"] });
      const previous = queryClient.getQueryData<{ data: SupplierRow[] }>(["purchase", "suppliers"]);
      const optimisticRow: SupplierRow = {
        _id: `temp-supplier-${Date.now()}`,
        companyName: payload.companyName,
        contactPerson: payload.contactPerson,
        phone: payload.phone,
        email: payload.email,
        createdAt: new Date().toISOString(),
        status: "ACTIVE",
        pending: true,
      };
      queryClient.setQueryData<{ data: SupplierRow[] }>(["purchase", "suppliers"], (old) => ({
        data: [optimisticRow, ...(old?.data || [])],
      }));
      return { previous };
    },
    onError: (_err, _payload, context) => {
      queryClient.setQueryData<{ data: SupplierRow[] }>(["purchase", "suppliers"], context?.previous);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchase", "suppliers"] });
    },
  });
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
      await createMutation.mutateAsync(formData);
      toast.success("Supplier registered successfully!");
      resetForm();
      navigate("/purchase/suppliers");
    } catch (error: any) {
      toast.error(`Failed to register Supplier: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-4 max-w-5xl mx-auto w-full">
      <div className="mb-3 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 p-5 shadow-sm">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Register New Supplier</h1>
        <p className="text-slate-500 mt-1">Capture the billing and tax detail you need for vendor management.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Company Name</label>
              <input name="companyName" required onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" placeholder="Supplier company name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Contact Person</label>
              <input name="contactPerson" onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" placeholder="Primary contact" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <input name="email" type="email" onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" placeholder="vendor@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone Number</label>
              <input name="phone" type="tel" onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" placeholder="e.g. 977-01-1234567" />
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
                className={`w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:outline-none focus:ring-4 ${
                  panError ? "border-red-400 focus:ring-red-100" : "focus:border-emerald-500 focus:ring-emerald-100"
                }`}
                placeholder="e.g. 123456789"
              />
              {panError && <p className="text-xs text-red-500 mt-1">{panError}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Address</label>
              <textarea name="address" rows={3} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" placeholder="Physical address / mailing address"></textarea>
            </div>
          </div>
          
          <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
            <Button 
              type="submit" 
              disabled={loading} 
              className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[120px] rounded-xl shadow-sm"
            >
              {loading ? "Saving..." : "Save Record"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/purchase/suppliers")}
              className="rounded-xl"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
