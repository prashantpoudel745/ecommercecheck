import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import { createSupplierPayment } from "@/services/purchase.service";
import { getAccounts } from "@/services/accounting.service";

type SupplierPaymentRow = {
  _id: string;
  paymentReference?: string;
  supplierName?: string;
  amount?: number | string;
  createdAt?: string;
  pending?: boolean;
};

export default function CreateSupplierPaymentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({ paymentMethod: "BANK_TRANSFER" });
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    getAccounts()
      .then((data) => {
        const accountsList = Array.isArray(data) ? data : [];
        setAccounts(accountsList);
      })
      .catch(() => setAccounts([]));
  }, []);

  const cashBankAccounts = useMemo(
    () =>
      accounts.filter((account) => {
        const groupName = account.accountGroup?.name?.toLowerCase?.() || "";
        const accountName = account.name?.toLowerCase?.() || "";
        return (
          account.type === "ASSET" &&
          (groupName.includes("cash") ||
            groupName.includes("bank") ||
            accountName.includes("cash") ||
            accountName.includes("bank"))
        );
      }),
    [accounts]
  );

  const resetForm = () => setFormData({ paymentMethod: "BANK_TRANSFER" });

  const createMutation = useMutation({
    mutationFn: (payload: any) => createSupplierPayment(payload),
    onMutate: async (payload: any) => {
      await queryClient.cancelQueries({ queryKey: ["purchase", "payments"] });
      const previous = queryClient.getQueryData<{ data: SupplierPaymentRow[] }>(["purchase", "payments"]);
      const optimisticRow: SupplierPaymentRow = {
        _id: `temp-payment-${Date.now()}`,
        paymentReference: payload.paymentReference || `PAY-${Date.now()}`,
        supplierName: payload.supplierName,
        amount: payload.amount,
        createdAt: new Date().toISOString(),
        pending: true,
      };
      queryClient.setQueryData<{ data: SupplierPaymentRow[] }>(["purchase", "payments"], (old) => ({
        data: [optimisticRow, ...(old?.data || [])],
      }));
      return { previous };
    },
    onError: (_err, _payload, context) => {
      queryClient.setQueryData<{ data: SupplierPaymentRow[] }>(["purchase", "payments"], context?.previous);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchase", "payments"] });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createMutation.mutateAsync(formData);
      toast.success("Payment recorded successfully!");
      resetForm();
      navigate("/purchase/supplier-payment");
    } catch (error: any) {
      toast.error(`Failed to record Payment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-4 max-w-5xl mx-auto w-full">
      <div className="mb-3 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 p-5 shadow-sm">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Record Supplier Payment</h1>
        <p className="text-slate-500 mt-1">Log payment details in a clearer, more structured entry form.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Supplier Name</label>
              <input name="supplierName" required onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" placeholder="Enter supplier name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Amount Paid</label>
              <input name="amount" type="number" required onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Payment Method</label>
              <select name="paymentMethod" required onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100">
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CARD">Credit/Debit Card</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Pay From</label>
              <select
                name="paymentAccountId"
                required
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                defaultValue=""
              >
                <option value="" disabled>Select cash/bank account</option>
                {cashBankAccounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.name} {account.code ? `(${account.code})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Payment Reference</label>
              <input name="paymentReference" onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" placeholder="e.g. Transaction ID" />
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
              onClick={() => navigate("/purchase/supplier-payment")}
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
