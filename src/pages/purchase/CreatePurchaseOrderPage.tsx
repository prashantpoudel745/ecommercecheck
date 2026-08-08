import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getAccounts } from "@/services/accounting.service";
import { Account } from "../../../types/accounting.types";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import { createPurchaseOrder } from "@/services/purchase.service";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

type PurchaseOrderRow = {
  _id: string;
  orderNumber?: string;
  supplierName?: string;
  totalAmount?: number | string;
  createdAt?: string;
  pending?: boolean;
};

export default function CreatePurchaseOrderPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const [supplierName, setSupplierName] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentAccountId, setPaymentAccountId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    getAccounts()
      .then((accountsList) => {
        const paymentAccounts = (accountsList || []).filter((account: Account) => {
          const name = account.name?.toLowerCase?.() || "";
          const groupValue = typeof account.accountGroup === "string" ? account.accountGroup : account.accountGroup?.name || "";
          const groupName = groupValue.toLowerCase();
          return (
            account.type === "ASSET" &&
            (groupName.includes("cash") || groupName.includes("bank") || name.includes("cash") || name.includes("bank"))
          );
        });

        setAccounts(paymentAccounts);
        if (paymentAccounts.length > 0 && !paymentAccountId) {
          setPaymentAccountId(paymentAccounts[0]._id);
        }
      })
      .catch(console.error);
  }, [paymentAccountId]);

  const [items, setItems] = useState([{ itemName: "", quantity: 1, price: 0, amount: 0 }]);
  const [taxRate, setTaxRate] = useState(15);

  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const resetForm = () => {
    setSupplierName("");
    setSupplierEmail("");
    setSupplierPhone("");
    setExpectedDeliveryDate("");
    setPaymentMethod("CASH");
    setPaymentAccountId("");
    setTransactionId("");
    setItems([{ itemName: "", quantity: 1, price: 0, amount: 0 }]);
    setTaxRate(15);
    setSubtotal(0);
    setTax(0);
    setTotalAmount(0);
  };

  const createMutation = useMutation({
    mutationFn: (payload: unknown) => createPurchaseOrder(payload),
    onMutate: async (payload: any) => {
      await queryClient.cancelQueries({ queryKey: ["purchase", "orders"] });
      const previous = queryClient.getQueryData<{ data: PurchaseOrderRow[] }>(["purchase", "orders"]);
      const optimisticRow: PurchaseOrderRow = {
        _id: `temp-po-${Date.now()}`,
        orderNumber: `PO-${Date.now()}`,
        supplierName: payload.supplierName,
        totalAmount: payload.totalAmount,
        createdAt: new Date().toISOString(),
        pending: true,
      };
      queryClient.setQueryData<{ data: PurchaseOrderRow[] }>(["purchase", "orders"], (old) => ({
        data: [optimisticRow, ...(old?.data || [])],
      }));
      return { previous };
    },
    onError: (_err, _payload, context) => {
      queryClient.setQueryData<{ data: PurchaseOrderRow[] }>(["purchase", "orders"], context?.previous);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchase", "orders"] });
    },
  });

  useEffect(() => {
    let newSubtotal = 0;
    const updatedItems = items.map((item: any) => {
      const amount = (Number(item.quantity) || 0) * (Number(item.price) || 0);
      newSubtotal += amount;
      return { ...item, amount };
    });

    if (JSON.stringify(updatedItems) !== JSON.stringify(items)) {
      setItems(updatedItems);
    }

    setSubtotal(newSubtotal);
    const newTax = (newSubtotal * (Number(taxRate) || 0)) / 100;
    setTax(newTax);
    setTotalAmount(newSubtotal + newTax);
  }, [items, taxRate]);

  const handleAddItem = () => setItems([...items, { itemName: "", quantity: 1, price: 0, amount: 0 }]);
  const handleRemoveItem = (index: number) => { if (items.length > 1) setItems(items.filter((_, i) => i !== index)); };
  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !items[0].itemName) {
      toast.error("Please add at least one item.");
      return;
    }

    setLoading(true);
    try {
      const data = { 
        supplierName, 
        supplierEmail, 
        supplierPhone,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined,
        items, 
        taxRate,
        subtotal, 
        tax, 
        totalAmount,
        paymentMethod,
        paymentAccountId,
        transactionId,
      };
      await createMutation.mutateAsync(data);
      toast.success("Purchase Order created successfully!");
      resetForm();
      navigate("/purchase/orders");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create purchase order";
      toast.error(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-4 max-w-6xl mx-auto w-full">
      <div className="mb-3 rounded-[32px] border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 p-4 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Create Purchase Order</h1>
        <p className="mt-2 text-slate-600">Issue a purchase order and track supplier payment details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <section className="grid gap-3">
          <div className="bg-white rounded-[28px] border border-slate-200 p-4 shadow-sm">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Supplier details</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Vendor information</h2>
              </div>
              <p className="text-sm text-slate-500">Enter supplier contact, delivery, and payment information.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Supplier Name *</label>
                <input
                  value={supplierName}
                  onChange={e => setSupplierName(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  placeholder="Enter supplier name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Supplier Email</label>
                <input
                  value={supplierEmail}
                  onChange={e => setSupplierEmail(e.target.value)}
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  placeholder="supplier@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Supplier Phone</label>
                <input
                  value={supplierPhone}
                  onChange={e => setSupplierPhone(e.target.value)}
                  type="tel"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  placeholder="e.g. 977-01-1234567"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Expected Delivery Date</label>
                <input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={e => setExpectedDeliveryDate(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="DIGITAL_WALLET">Digital Wallet</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Pay From Account</label>
                <select
                  value={paymentAccountId}
                  onChange={e => setPaymentAccountId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="">Select Account</option>
                  {accounts.map(acc => (
                    <option key={acc._id} value={acc._id}>{acc.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Transaction ID</label>
                <input
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[28px] border border-slate-200 p-4 shadow-sm">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Purchase items</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Order line items</h2>
              </div>
              <Button type="button" onClick={handleAddItem} variant="outline" size="sm" className="flex items-center gap-2">
                <Plus size={14} /> Add Item
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium">
                  <tr>
                    <th className="p-3 w-1/2">Item Name</th>
                    <th className="p-3 w-24">Qty</th>
                    <th className="p-3 w-32">Price</th>
                    <th className="p-3 w-32">Amount</th>
                    <th className="p-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2">
                        <input
                          required
                          value={item.itemName}
                          onChange={e => handleItemChange(index, "itemName", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                          placeholder="Description"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          required
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleItemChange(index, "quantity", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          required
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={e => handleItemChange(index, "price", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                        />
                      </td>
                      <td className="p-2 font-medium text-slate-700">{formatCurrency(item.amount)}</td>
                      <td className="p-2 text-center">
                        <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-400 hover:text-red-600 p-1">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <div className="w-full max-w-xs space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Tax Rate (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={e => setTaxRate(Number(e.target.value))}
                    className="w-20 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-right text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax Amount:</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-slate-200 pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/purchase/orders")} className="px-4">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4">
              {loading ? "Creating..." : "Create Purchase Order"}
            </Button>
          </div>
        </section>
      </form>
    </div>
  );
}
