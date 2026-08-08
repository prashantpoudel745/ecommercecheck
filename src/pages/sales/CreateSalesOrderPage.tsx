import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import { createSalesOrder } from "@/services/sales.service";
import { fetchInventoryItem } from "@/hooks/fetchInventoryItems";
import { Plus, Trash2 } from "lucide-react";
import { CURRENCY_SYMBOL, formatCurrency } from "@/utils/formatCurrency";
import { formatCurrencyValue } from "@/functions/formatcurrencyvalue";

type OrderRow = {
  _id: string;
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  totalAmount?: number | string;
  paymentStatus?: string;
  createdAt?: string;
  pending?: boolean;
};

export default function CreateSalesOrderPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const sourceQuotation = location.state?.sourceQuotation;
  const FIXED_VAT_RATE = 13;

  const [customerName, setCustomerName] = useState(sourceQuotation?.customerName || "");
  const [customerEmail, setCustomerEmail] = useState(sourceQuotation?.customerEmail || "");
  const [customerPhone, setCustomerPhone] = useState(sourceQuotation?.customerPhone || "");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);

  const fetchInventory =async ()=>{
    const response = await fetchInventoryItem();
    if(response.ok){
      const data = await response.json();
      setInventoryItems(data.inventory || [])
    }
  }
  useEffect(()=>{
    fetchInventory();
  },[])
  const [items, setItems] = useState(
    sourceQuotation?.items?.map((item: any) => ({
      itemName: item.itemName || "",
      quantity: item.quantity || 1,
      price: item.price?.$numberDecimal || item.price || 0,
      amount: item.amount?.$numberDecimal || item.amount || 0
    })) || [{ itemName: "", quantity: 1, price: 0, amount: 0 }]
  );
  const [taxRate] = useState(FIXED_VAT_RATE);
  const [taxIncluded, setTaxIncluded] = useState(sourceQuotation?.taxIncluded || false);
  const [paymentStatus, setPaymentStatus] = useState(sourceQuotation?.paymentStatus || "due");
  const [amountPaid, setAmountPaid] = useState(Number(sourceQuotation?.amountPaid || 0));

  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const resetForm = () => {
    setCustomerName(sourceQuotation?.customerName || "");
    setCustomerEmail(sourceQuotation?.customerEmail || "");
    setCustomerPhone(sourceQuotation?.customerPhone || "");
    setDeliveryDate("");
    setItems(
      sourceQuotation?.items?.map((item: any) => ({
        itemName: item.itemName || "",
        quantity: item.quantity || 1,
        price: item.price?.$numberDecimal || item.price || 0,
        amount: item.amount?.$numberDecimal || item.amount || 0,
      })) || [{ itemName: "", quantity: 1, price: 0, amount: 0 }]
    );
    setTaxIncluded(sourceQuotation?.taxIncluded || false);
    setPaymentStatus(sourceQuotation?.paymentStatus || "due");
    setAmountPaid(Number(sourceQuotation?.amountPaid || 0));
    setSubtotal(0);
    setTax(0);
    setTotalAmount(0);
  };

  const createMutation = useMutation({
    mutationFn: (payload: unknown) => createSalesOrder(payload),
    onMutate: async (payload: any) => {
      await queryClient.cancelQueries({ queryKey: ["sales", "orders"] });
      const previous = queryClient.getQueryData<{ data: OrderRow[] }>(["sales", "orders"]);
      const optimisticRow: OrderRow = {
        _id: `temp-order-${Date.now()}`,
        orderNumber: `SO-${Date.now()}`,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        customerPhone: payload.customerPhone,
        totalAmount: payload.totalAmount,
        paymentStatus: payload.paymentStatus,
        createdAt: new Date().toISOString(),
        pending: true,
      };
      queryClient.setQueryData<{ data: OrderRow[] }>(["sales", "orders"], (old) => ({
        data: [optimisticRow, ...(old?.data || [])],
      }));
      return { previous };
    },
    onError: (_err, _payload, context) => {
      queryClient.setQueryData<{ data: OrderRow[] }>(["sales", "orders"], context?.previous);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sales", "orders"] });
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
        deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
        items, 
        taxRate,
        taxIncluded,
        subtotal, 
        tax, 
        totalAmount,
        paymentStatus,
        amountPaid,
        sourceQuotationId: sourceQuotation?._id || undefined
      };
      await createMutation.mutateAsync(data);
      toast.success("Sales Order created successfully!");
      resetForm();
      navigate("/sales/orders");
    } catch (error: any) {
      toast.error(`Error: ${error?.response?.data?.message || error.message || "Unable to create sales order"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-4 max-w-6xl mx-auto w-full">
      <div className="mb-3 rounded-[32px] border border-slate-200 bg-gradient-to-r from-emerald-50 via-white to-slate-50 p-4 shadow-sm">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">Sales</span>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Create Sales Order</h1>
          <p className="mt-2 text-slate-600">Capture sales order details with delivery, payment, and item line items.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="grid gap-3">
          <div className="bg-white rounded-[28px] border border-slate-200 p-4 shadow-sm">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Customer details</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Buyer information</h2>
              </div>
              <p className="text-sm text-slate-500">Optional sales order source quotation data is prefilled.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              <div className="space-y-2 md:col-span-3 lg:col-span-1">
                <label className="text-sm font-medium text-slate-700">Expected Delivery</label>
                <input
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                  type="date"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[28px] border border-slate-200 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Payment Status</label>
              <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100">
                <option value="due">Due / Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            {paymentStatus === "partial" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Amount Paid</label>
                <input type="number" min="0" step="0.01" value={amountPaid} onChange={(e) => setAmountPaid(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Line Items</h2>
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
                                    <select 
                                      required 
                                      value={item.itemName} 
                                      onChange={e => handleItemChange(index, "itemName", e.target.value)} 
                                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                                    >
                                      <option value="">Select Item...</option>
                                      {inventoryItems.map((inv) => (
                                        <option key={inv._id} value={inv.name}>
                                          {inv.name} (Qty: {inv.quantity}, Price: {CURRENCY_SYMBOL}{formatCurrencyValue(inv.price)})
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="p-2">
                                    <input required type="number" min="1" value={item.quantity} onChange={e => handleItemChange(index, "quantity", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" />
                                  </td>
                                  <td className="p-2">
                                    <input required type="number" min="0" step="0.01" value={item.price} onChange={e => handleItemChange(index, "price", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" />
                                  </td>
                                  <td className="p-2 font-medium text-slate-700">
                                    {formatCurrency(item.amount)}
                                  </td>
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

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <div className="w-64 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 space-x-3">
                <div className="flex items-center gap-2">
                  <span>Tax Rate (%):</span>
                  <span className="font-medium text-slate-900">13%</span>
                </div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={taxIncluded} onChange={e => setTaxIncluded(e.target.checked)} className="rounded border-gray-300 w-4 h-4 text-emerald-600" />
                  <span className="text-xs text-slate-600">Prices include VAT</span>
                </label>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax Amount:</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
        </section>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex justify-end items-center gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/sales/orders")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px]">
            {loading ? "Processing..." : "Create Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
