import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import { createCustomerPayment } from "@/services/sales.service";
import { getAccounts } from "@/services/accounting.service";

export default function CreateCustomerPaymentPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    getAccounts()
      .then((data) => {
        const accountsList = Array.isArray(data) ? data : (data as any)?.accounts ?? [];
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createCustomerPayment(formData);
      toast.success("Customer Payment recorded successfully!");
      navigate("/sales/customer-payment");
    } catch (error: any) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-4 max-w-5xl mx-auto w-full">
      <div className="mb-3 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 p-5 shadow-sm">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Record Customer Payment</h1>
        <p className="text-slate-500 mt-1">Fill out the details below to record an incoming payment.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Customer Name</label>
              <input name="customerName" required onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Payment Amount</label>
              <input name="amount" type="number" required onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Deposit To</label>
              <select
                name="paymentAccountId"
                required
                onChange={(e) => setFormData({ ...formData, paymentAccountId: e.target.value })}
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
              onClick={() => navigate("/sales/customer-payment")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
