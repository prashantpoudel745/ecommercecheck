import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import { createQuotation } from "@/services/sales.service";
import { fetchInventoryItem } from "@/hooks/fetchInventoryItems";
import { Plus, Trash2 } from "lucide-react";
import { CURRENCY_SYMBOL, formatCurrency } from "@/utils/formatCurrency";
import { formatCurrencyValue } from "@/functions/formatcurrencyvalue";

type QuotationRow = {
  _id: string;
  quotationNumber?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  totalAmount?: number | string;
  paymentStatus?: string;
  createdAt?: string;
  pending?: boolean;
};

export default function CreateQuotationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const FIXED_VAT_RATE = 13;
  
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);

  const fetchInventory =async ()=>{
    const response = await fetchInventoryItem();
    if(response.ok){
      const data = await response.json();
      console.log(data);
      setInventoryItems(data.inventory || [])
    }
  }
  useEffect(()=>{
    fetchInventory();
  },[])
  
  const [items, setItems] = useState([{ itemName: "", quantity: 1, price: 0, amount: 0 }]);
  const [taxRate] = useState(FIXED_VAT_RATE);
  const [taxIncluded, setTaxIncluded] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("due");
  const [amountPaid, setAmountPaid] = useState(0);
  
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const resetForm = () => {
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setItems([{ itemName: "", quantity: 1, price: 0, amount: 0 }]);
    setPaymentStatus("due");
    setAmountPaid(0);
    setTaxIncluded(false);
    setSubtotal(0);
    setTax(0);
    setTotalAmount(0);
  };

  const createMutation = useMutation({
    mutationFn: (payload: unknown) => createQuotation(payload),
    onMutate: async (payload: any) => {
      await queryClient.cancelQueries({ queryKey: ["sales", "quotations"] });
      const previous = queryClient.getQueryData<{ data: QuotationRow[] }>(["sales", "quotations"]);
      const optimisticRow: QuotationRow = {
        _id: `temp-quotation-${Date.now()}`,
        quotationNumber: `QT-${Date.now()}`,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        customerPhone: payload.customerPhone,
        totalAmount: payload.totalAmount,
        paymentStatus: payload.paymentStatus,
        createdAt: new Date().toISOString(),
        pending: true,
      };
      queryClient.setQueryData<{ data: QuotationRow[] }>(["sales", "quotations"], (old) => ({
        data: [optimisticRow, ...(old?.data || [])],
      }));
      return { previous };
    },
    onError: (_err, _payload, context) => {
      queryClient.setQueryData<{ data: QuotationRow[] }>(["sales", "quotations"], context?.previous);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sales", "quotations"] });
    },
  });

  useEffect(() => {
    let newSubtotal = 0;
    const updatedItems = items.map(item => {
      const amount = (Number(item.quantity) || 0) * (Number(item.price) || 0);
      newSubtotal += amount;
      return { ...item, amount };
    });
    
    if (JSON.stringify(updatedItems) !== JSON.stringify(items)) {
      setItems(updatedItems);
    }
    
    setSubtotal(newSubtotal);
    const rate = Number(taxRate) || 0;

    if (taxIncluded && rate > 0) {
      const taxable = newSubtotal / (1 + rate / 100);
      const newTax = newSubtotal - taxable;
      setTax(newTax);
      setTotalAmount(newSubtotal);
    } else {
      const newTax = (newSubtotal * rate) / 100;
      setTax(newTax);
      setTotalAmount(newSubtotal + newTax);
    }
  }, [items, taxRate, taxIncluded]);

  const handleAddItem = () => {
    setItems([...items, { itemName: "", quantity: 1, price: 0, amount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    if (field === "itemName") {
      const selectedItem = inventoryItems.find((inv: any) => inv.name === value);
      newItems[index] = { 
        ...newItems[index], 
        itemName: value as string,
        price: selectedItem ? Number(selectedItem.sellingPrice || 0) : newItems[index].price
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
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
        customerName,
          customerEmail,
          customerPhone,
        items,
        taxRate,
        taxIncluded,
        subtotal,
        tax,
        totalAmount,
        paymentStatus,
        amountPaid,
      };
      await createMutation.mutateAsync(data);
      toast.success("Quotation created successfully!");
      resetForm();
      navigate("/sales/quotations");
    } catch (error: any) {
      toast.error(`Error: ${error?.response?.data?.message || error.message || "Unable to create quotation"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto w-full">
      <div className="mb-6 rounded-[32px] border border-slate-200 bg-gradient-to-r from-emerald-50 via-white to-slate-50 p-6 shadow-sm">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">Sales</span>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Create New Quotation</h1>
          <p className="mt-2 text-slate-600">Create a quotation with customer, item, and payment details before converting it into a sales order.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="grid gap-6">
          <div className="bg-white rounded-[28px] border border-slate-200 p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Customer Details</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Buyer information</h2>
              </div>
              <p className="text-sm text-slate-500">Add contact details for the quotation recipient.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Customer Name *</label>
                <input
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  placeholder="Enter customer name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Customer Email</label>
                <input
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  placeholder="customer@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Customer Phone</label>
                <input
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  type="tel"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  placeholder="977-9812345678"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[28px] border border-slate-200 p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Quotation settings</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Payment & item details</h2>
              </div>
              <p className="text-sm text-slate-500">Configure payment status and add line items.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="due">Due / Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              {paymentStatus === "partial" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Amount Paid</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Line Items</h3>
                  <p className="text-sm text-slate-500">List the products or services included in this quote.</p>
                </div>
                <Button type="button" onClick={handleAddItem} variant="outline" size="sm" className="flex items-center gap-2">
                  <Plus size={14} /> Add Item
                </Button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-white text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold uppercase tracking-[0.08em]">Item</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-[0.08em] text-right">Qty</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-[0.08em] text-right">Price</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-[0.08em] text-right">Amount</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-slate-50">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <select
                            required
                            value={item.itemName}
                            onChange={e => handleItemChange(index, "itemName", e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                          >
                            <option value="">Select Item...</option>
                            {inventoryItems.map((inv) => (
                              <option key={inv._id} value={inv.name}>
                                {inv.name} (Qty: {inv.quantity}, {CURRENCY_SYMBOL}{formatCurrencyValue(inv.price)})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            required
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e => handleItemChange(index, "quantity", e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-right text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <input
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={e => handleItemChange(index, "price", e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-right text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-700">{formatCurrency(item.amount)}</td>
                        <td className="px-4 py-3 text-center">
                          <button type="button" onClick={() => handleRemoveItem(index)} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-red-500 transition hover:bg-red-50 hover:text-red-600">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
              <div className="rounded-[30px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">Quotation totals</h3>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex justify-between"><span>Subtotal</span><span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between"><span>Tax ({taxRate}%)</span><span className="font-medium text-slate-900">{formatCurrency(tax)}</span></div>
                  <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900"><span>Total</span><span>{formatCurrency(totalAmount)}</span></div>
                </div>
              </div>
              <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Review the totals and submit when you are ready. This quotation can be converted into a sales order later.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => navigate("/sales/quotations")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[180px] rounded-2xl">
            {loading ? "Processing..." : "Create Quotation"}
          </Button>
        </div>
      </form>
    </div>
  );
}
