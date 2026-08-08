import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import { createCustomer } from "@/services/sales.service";

type CustomerRow = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
  status?: string;
  pending?: boolean;
};

export default function CreateCustomerPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const resetForm = () => setFormData({});

  const createMutation = useMutation({
    mutationFn: (payload: unknown) => createCustomer(payload),
    onMutate: async (payload: any) => {
      await queryClient.cancelQueries({ queryKey: ["sales", "customers"] });
      const previous = queryClient.getQueryData<{ data: CustomerRow[] }>(["sales", "customers"]);
      const optimisticRow: CustomerRow = {
        _id: `temp-customer-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        createdAt: new Date().toISOString(),
        status: "ACTIVE",
        pending: true,
      };
      queryClient.setQueryData<{ data: CustomerRow[] }>(["sales", "customers"], (old) => ({
        data: [optimisticRow, ...(old?.data || [])],
      }));
      return { previous };
    },
    onError: (_err, _payload, context) => {
      queryClient.setQueryData<{ data: CustomerRow[] }>(["sales", "customers"], context?.previous);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sales", "customers"] });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createMutation.mutateAsync(formData);
      toast.success("Customer added successfully!");
      resetForm();
      navigate("/sales/customers");
    } catch (error: any) {
      toast.error(`Failed to add Customer: ${error?.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-4 max-w-5xl mx-auto w-full">
      <div className="mb-3 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 p-5 shadow-sm">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Add New Customer</h1>
        <p className="text-slate-500 mt-1">Create a customer profile with a clean and easy-to-read entry form.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <input name="name" required onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" placeholder="Enter customer name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input name="email" type="email" required onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" placeholder="customer@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <input name="phone" type="tel" onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" placeholder="e.g. 977-9812345678" />
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
              onClick={() => navigate("/sales/customers")}
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
