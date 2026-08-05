import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import { createQuotation } from "@/services/sales.service";
import { fetchInventoryItem } from "@/hooks/fetchInventoryItems";
import { Plus, Trash2 } from "lucide-react";
import { CURRENCY_SYMBOL, formatCurrency } from "@/utils/formatCurrency";
import { formatCurrencyValue } from "@/functions/formatcurrencyvalue";

export default function CreateQuotationPage() {
  const navigate = useNavigate();
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
      await createQuotation(data);
      toast.success("Quotation created successfully!");
      navigate("/sales/quotations");
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Create New Quotation</h1>
        <p className="text-slate-500 mt-1">Generate a quotation with dynamic line items.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Customer Name *</label>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} required className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Enter customer name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Customer Email</label>
              <input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} type="email" className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="customer@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Customer Phone</label>
              <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} type="tel" className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. 977-9812345678" />
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
                        onChange={e => handleItemChange(index, "itemName", e.target.value)} 
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
                      <input required type="number" min="1" value={item.quantity} onChange={e => handleItemChange(index, "quantity", e.target.value)} className="w-full rounded border p-2 text-sm outline-none" />
                    </td>
                    <td className="p-2">
                      <input required type="number" min="0" step="0.01" value={item.price} onChange={e => handleItemChange(index, "price", e.target.value)} className="w-full rounded border p-2 text-sm outline-none" />
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
              <div className="flex justify-between items-center text-slate-600">
                <span>Tax Rate (%):</span>
                <span className="font-medium text-slate-900">13%</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={taxIncluded} onChange={e => setTaxIncluded(e.target.checked)} className="rounded border-gray-300 w-4 h-4 text-emerald-600" />
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
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex justify-end items-center gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/sales/quotations")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px]">
            {loading ? "Processing..." : "Create Quotation"}
          </Button>
        </div>
      </form>
    </div>
  );
}
