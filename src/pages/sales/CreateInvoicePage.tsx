import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import { createInvoice } from "@/services/sales.service";
import api from "@/utils/api";
import { Plus, Trash2 } from "lucide-react";
import { CURRENCY_SYMBOL, formatCurrency } from "@/utils/formatCurrency";
import { formatCurrencyValue } from "@/functions/formatcurrencyvalue";
import { fetchInventoryItem } from "@/hooks/fetchInventoryItems";

type InvoiceItem = {
  itemName: string;
  quantity: number | string;
  price: number | string;
  amount: number | string;
  vatExempt?: boolean;
};

type InventoryItem = {
  _id: string;
  name: string;
  quantity: number;
  sellingPrice: number | string;
  price?: number | string;
};

type SalesOrderItem = {
  itemName?: string;
  quantity?: number;
  price?: { _bsontype?: string; toString?: () => string } | number | string;
  amount?: { _bsontype?: string; toString?: () => string } | number | string;
};

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const sourceSalesOrder = location.state?.sourceSalesOrder;
  const FIXED_VAT_RATE = 13;

  const [loading, setLoading] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [taxRate] = useState(FIXED_VAT_RATE);
  const [taxIncluded, setTaxIncluded] = useState(sourceSalesOrder?.taxIncluded || false);
  const [paymentStatus, setPaymentStatus] = useState(sourceSalesOrder?.paymentStatus || "due");
  const [amountPaid, setAmountPaid] = useState(Number(sourceSalesOrder?.amountPaid || 0));
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [items, setItems] = useState<InvoiceItem[]>(
    sourceSalesOrder?.items?.map((item: SalesOrderItem) => ({
      itemName: item.itemName || "",
      quantity: item.quantity || 1,
      price:
        typeof item.price === "object" && item.price?._bsontype === "Decimal128"
          ? item.price.toString()
          : item.price || 0,
      amount:
        typeof item.amount === "object" && item.amount?._bsontype === "Decimal128"
          ? item.amount.toString()
          : item.amount || 0,
    })) || [{ itemName: "", quantity: 1, price: 0, amount: 0 }]
  );
  const [customerName, setCustomerName] = useState(sourceSalesOrder?.customerName || "");
  const [customerEmail, setCustomerEmail] = useState(sourceSalesOrder?.customerEmail || "");
  const [customerPhone, setCustomerPhone] = useState(sourceSalesOrder?.customerPhone || "");
  const [vatNo, setVatNo] = useState(sourceSalesOrder?.vatNo || "");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    const fetchInventory = async () => {
      const response = await fetchInventoryItem();
      if (response?.ok) {
        const data = await response.json();
        setInventoryItems(data.inventory || []);
      }
    };
    fetchInventory();
  }, []);

  useEffect(() => {
    let newSubtotal = 0;
    const updatedItems = items.map((item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const amount = quantity * price;
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
      const selectedItem = inventoryItems.find((inv) => inv.name === value);
      newItems[index] = {
        ...newItems[index],
        itemName: value as string,
        price: selectedItem ? Number(selectedItem.sellingPrice || 0) : newItems[index].price,
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error("Customer name is required.");
      return;
    }

    if (items.length === 0 || !items[0].itemName) {
      toast.error("Please add at least one item.");
      return;
    }

    setLoading(true);
    try {
      const invoiceData = {
        customerName,
        customerEmail,
        customerPhone,
        vatNo,
        items: items.map((item) => ({
          itemName: item.itemName,
          quantity: String(item.quantity),
          price: String(item.price),
          amount: String(item.amount),
          vatExempt: false,
        })),
        taxRate,
        taxIncluded,
        subtotal,
        tax,
        totalAmount,
        paymentStatus,
        amountPaid,
        sourceSalesOrderId: sourceSalesOrder?._id || undefined,
      };

      const res = await createInvoice(invoiceData);
      toast.success("Invoice created successfully!");

      if (sendEmail && customerEmail && res.data?._id) {
        toast.info("Generating and sending PDF...");
        await api.post(`/sales/invoices/${res.data._id}/send`, { email: customerEmail, taxRate });
        toast.success("Invoice emailed to customer!");
      }

      navigate("/sales/invoice");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "An unknown error occurred."
          : "An unknown error occurred.";
      toast.error(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Create New Invoice</h1>
        <p className="text-slate-500 mt-1">Generate an invoice with line items.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Customer Name *</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Enter customer name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Customer Email</label>
              <input
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                type="email"
                required={sendEmail}
                className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="customer@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Customer Phone</label>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                type="tel"
                className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. 977-9812345678"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Buyer VAT / PAN</label>
              <input
                value={vatNo}
                onChange={(e) => setVatNo(e.target.value)}
                className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Enter buyer VAT or PAN"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Payment Status</label>
              <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="due">Due / Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            {paymentStatus === "partial" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Amount Paid</label>
                <input type="number" min="0" step="0.01" value={amountPaid} onChange={(e) => setAmountPaid(Number(e.target.value))} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
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
                        onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                        className="w-full rounded border p-2 text-sm outline-none bg-white"
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

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <div className="w-64 space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Tax Rate (%):</span>
                <span className="font-medium text-slate-900">13%</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={taxIncluded}
                    onChange={(e) => setTaxIncluded(e.target.checked)}
                    className="rounded border-gray-300 w-4 h-4 text-emerald-600"
                  />
                  <span className="text-xs">Prices include VAT</span>
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

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
         

          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/sales/invoice")}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px]">
              {loading ? "Processing..." : "Create Invoice"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
