import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import { createPurchaseBill } from "@/services/purchase.service";
import { getAccounts } from "@/services/accounting.service";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

type PurchaseBillRow = {
  _id: string;
  billNumber?: string;
  supplierName?: string;
  totalAmount?: number | string;
  createdAt?: string;
  pending?: boolean;
};

export default function CreatePurchaseBillPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<any>({
    supplierName: "",
    supplierBillNumber: "",
    supplierPAN: "",
    supplierPhone: "",
    dueDate: "",
    paymentStatus: "due",
    amountPaid: 0,
    paymentMethod: "BANK_TRANSFER",
    paymentAccountId: "",
    transactionId: "",
    taxRate: 13,
    taxIncluded: false,
    items: [{ itemName: "", quantity: 1, price: 0, amount: 0, vatExempt: false }],
  });

  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    getAccounts()
      .then((data) => {
        const accountsList = Array.isArray(data) ? data : data?.accounts ?? [];
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
          (groupName.includes("cash") || groupName.includes("bank") || accountName.includes("cash") || accountName.includes("bank"))
        );
      }),
    [accounts]
  );

  const handleInputChange = (e: any) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { itemName: "", quantity: 1, price: 0, amount: 0, vatExempt: false }] });
  const removeItem = (index: number) => setFormData({ ...formData, items: formData.items.filter((_: any, i: number) => i !== index) });
  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const [computed, setComputed] = useState({ taxable: 0, exempt: 0, subtotal: 0, tax: 0, total: 0 });

  useEffect(() => {
    let taxable = 0;
    let exempt = 0;
    const updated = formData.items.map((it: any) => {
      const qty = Number(it.quantity) || 0;
      const price = Number(it.price) || 0;
      const amount = qty * price;
      if (it.vatExempt) exempt += amount; else taxable += amount;
      return { ...it, amount };
    });
    if (JSON.stringify(updated) !== JSON.stringify(formData.items)) {
      setFormData({ ...formData, items: updated });
    }

    const rate = Number(formData.taxRate) || 0;
    let tax = 0;
    let subtotal = 0;
    let total = 0;

    if (formData.taxIncluded && rate > 0) {
      const taxableWithoutVat = taxable / (1 + rate / 100);
      tax = taxable - taxableWithoutVat;
      subtotal = taxableWithoutVat + exempt;
      total = taxable + exempt;
    } else {
      tax = (taxable * rate) / 100;
      subtotal = taxable + exempt;
      total = subtotal + tax;
    }

    setComputed({ taxable, exempt, subtotal, tax, total });
  }, [formData.items, formData.taxRate, formData.taxIncluded]);

  const createMutation = useMutation({
    mutationFn: (payload: unknown) => createPurchaseBill(payload),
    onMutate: async (payload: any) => {
      await queryClient.cancelQueries({ queryKey: ["purchase", "bills"] });
      const previous = queryClient.getQueryData<{ data: PurchaseBillRow[] }>(["purchase", "bills"]);
      const optimistic: PurchaseBillRow = {
        _id: `temp-bill-${Date.now()}`,
        billNumber: payload.supplierBillNumber || `BILL-${Date.now()}`,
        supplierName: payload.supplierName,
        totalAmount: payload.totalAmount,
        createdAt: new Date().toISOString(),
        pending: true,
      };
      queryClient.setQueryData<{ data: PurchaseBillRow[] }>(["purchase", "bills"], (old) => ({ data: [optimistic, ...(old?.data || [])] }));
      return { previous };
    },
    onError: (_err, _payload, context) => {
      queryClient.setQueryData<{ data: PurchaseBillRow[] }>(["purchase", "bills"], context?.previous);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchase", "bills"] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierName) { toast.error("Supplier name required"); return; }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        taxableAmount: computed.taxable,
        exemptAmount: computed.exempt,
        subtotal: computed.subtotal,
        tax: computed.tax,
        totalAmount: computed.total,
      };
      await createMutation.mutateAsync(payload);
      toast.success("Purchase bill saved!");
      navigate("/purchase/bills");
    } catch (err: any) {
      toast.error(`Error: ${err?.message || 'Unable to save bill'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-4 max-w-6xl mx-auto w-full">
      <div className="mb-3 rounded-[32px] border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 p-4 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Record Purchase Bill</h1>
        <p className="mt-2 text-slate-600">Capture supplier billing details with tax, payment, and line item tracking.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <section className="grid gap-3">
          <div className="bg-white rounded-[28px] border border-slate-200 p-4 shadow-sm">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Bill details</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Supplier billing info</h2>
              </div>
              <p className="text-sm text-slate-500">Record the supplier bill number, due date, and payment details.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Supplier Name</label>
                <input name="supplierName" required onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" placeholder="Enter supplier name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Supplier VAT Bill Number</label>
                <input name="supplierBillNumber" required onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" placeholder="e.g. INV-2023-01" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Supplier PAN / VAT Number</label>
                <input name="supplierPAN" onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" placeholder="Enter supplier PAN or VAT" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Supplier Phone</label>
                <input name="supplierPhone" onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" placeholder="e.g. 977-01-1234567" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Due Date</label>
                <input name="dueDate" type="date" required onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Payment Status</label>
                <select name="paymentStatus" value={formData.paymentStatus} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
                  <option value="due">Due / Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              {formData.paymentStatus === "partial" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Amount Paid</label>
                  <input name="amountPaid" type="number" min="0" step="0.01" value={formData.amountPaid} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" placeholder="0.00" />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Payment Account</label>
                <select name="paymentAccountId" value={formData.paymentAccountId || ""} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
                  <option value="">Select cash/bank account</option>
                  {cashBankAccounts.map((account) => (
                    <option key={account._id} value={account._id}>{account.name} {account.code ? `(${account.code})` : ""}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Payment Method</label>
                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100">
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CREDIT_CARD">Credit/Debit Card</option>
                  <option value="DIGITAL_WALLET">Digital Wallet</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Transaction ID</label>
                <input name="transactionId" value={formData.transactionId} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" placeholder="Optional" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[28px] border border-slate-200 p-4 shadow-sm">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Purchase items</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Line items</h2>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="flex items-center gap-2">
                <Plus size={14} /> Add Item
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-3">Item Name</th>
                    <th className="w-24 p-3">Qty</th>
                    <th className="w-32 p-3">Cost</th>
                    <th className="w-32 p-3">Amount</th>
                    <th className="w-24 p-3 text-center">VAT</th>
                    <th className="w-12 p-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {formData.items.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="p-2">
                        <input required value={item.itemName} onChange={(e) => handleItemChange(index, "itemName", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" placeholder="Item name" />
                      </td>
                      <td className="p-2">
                        <input required type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" />
                      </td>
                      <td className="p-2">
                        <input required type="number" min="0" step="0.01" value={item.price} onChange={(e) => handleItemChange(index, "price", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" />
                      </td>
                      <td className="p-2 font-medium text-slate-700">{formatCurrency(item.amount)}</td>
                      <td className="p-2 text-center">
                        <input type="checkbox" checked={!item.vatExempt} onChange={(e) => handleItemChange(index, "vatExempt", !e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-emerald-600" title="VAT applicable" />
                      </td>
                      <td className="p-2 text-center">
                        <button type="button" onClick={() => removeItem(index)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <div className="w-full max-w-xs space-y-3 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Tax Rate (%):</span>
                  <input type="number" min="0" max="100" value={formData.taxRate} onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })} className="w-20 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-right text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <input id="taxIncluded" name="taxIncluded" type="checkbox" checked={Boolean(formData.taxIncluded)} onChange={(e) => setFormData({ ...formData, taxIncluded: e.target.checked })} className="rounded border-gray-300 w-4 h-4 text-emerald-600" />
                  <label htmlFor="taxIncluded" className="text-sm font-medium text-slate-700 mb-0">Prices include VAT</label>
                </div>
                <div className="flex justify-between text-slate-600"><span>Taxable:</span><span>{formatCurrency(computed.taxable)}</span></div>
                <div className="flex justify-between text-slate-600"><span>Non-taxable:</span><span>{formatCurrency(computed.exempt)}</span></div>
                <div className="flex justify-between text-slate-600"><span>Subtotal:</span><span>{formatCurrency(computed.subtotal)}</span></div>
                <div className="flex justify-between text-slate-600"><span>Tax:</span><span>{formatCurrency(computed.tax)}</span></div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold text-slate-900"><span>Total:</span><span>{formatCurrency(computed.total)}</span></div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
            <Button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[120px] rounded-2xl">{loading ? "Saving..." : "Save Record"}</Button>
            <Button type="button" variant="outline" onClick={() => navigate("/purchase/bills")}>Cancel</Button>
          </div>
        </section>
      </form>
    </div>
  );
}
