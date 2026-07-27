import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createPurchaseBill } from "@/services/purchase.service";
import { getAccounts } from "@/services/accounting.service";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

export default function CreatePurchaseBillPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    paymentStatus: "due",
    amountPaid: 0,
    taxRate: 0,
    items: [{ itemName: "", quantity: 1, price: 0, amount: 0 }],
  });
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    getAccounts()
      .then((data) => setAccounts(data || []))
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

  const updateItems = (items: any[]) => {
    setFormData({ ...formData, items });
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const items = [...formData.items];
    const nextItem = { ...items[index], [field]: value };
    const quantity = Number(nextItem.quantity || 0);
    const price = Number(nextItem.price || 0);
    nextItem.amount = quantity * price;
    items[index] = nextItem;
    updateItems(items);
  };

  const addItem = () => {
    updateItems([...formData.items, { itemName: "", quantity: 1, price: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (formData.items.length <= 1) return;
    updateItems(formData.items.filter((_: any, itemIndex: number) => itemIndex !== index));
  };

  const subtotal = formData.items.reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);
  const tax = (subtotal * Number(formData.taxRate || 0)) / 100;
  const totalAmount = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const validItems = formData.items.filter((item: any) => item.itemName && Number(item.quantity) > 0);
      if (validItems.length === 0) {
        toast.error("Please add at least one purchase item.");
        return;
      }
      await createPurchaseBill({
        ...formData,
        items: validItems,
        subtotal,
        tax,
        totalAmount,
      });
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
              <label className="text-sm font-medium text-slate-700">Payment Status</label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="due">Due / Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            {formData.paymentStatus === "partial" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Amount Paid</label>
                <input
                  name="amountPaid"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amountPaid}
                  onChange={handleInputChange}
                  className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="0.00"
                />
              </div>
            )}
            {formData.paymentStatus !== "due" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Payment Account</label>
                <select
                  name="paymentAccountId"
                  required
                  onChange={(e) => setFormData({ ...formData, paymentAccountId: e.target.value })}
                  className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
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
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Line Items</h2>
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
                    <th className="w-12 p-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {formData.items.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="p-2">
                        <input
                          required
                          value={item.itemName}
                          onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                          className="w-full rounded border p-2 text-sm outline-none"
                          placeholder="Item name"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          required
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="w-full rounded border p-2 text-sm outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          required
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, "price", e.target.value)}
                          className="w-full rounded border p-2 text-sm outline-none"
                        />
                      </td>
                      <td className="p-2 font-medium text-slate-700">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="p-2 text-center">
                        <button type="button" onClick={() => removeItem(index)} className="p-1 text-red-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <div className="w-64 space-y-3 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Tax Rate (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                    className="w-20 rounded border p-1 text-right outline-none"
                  />
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax:</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold text-slate-900">
                  <span>Total:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>
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
