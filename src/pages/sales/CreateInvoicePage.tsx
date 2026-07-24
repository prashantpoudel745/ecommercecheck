import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createInvoice } from "@/services/sales.service";
import api from "@/utils/api";
import { Plus, Trash2 } from "lucide-react";

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  
  const [items, setItems] = useState([{ itemName: "", quantity: 1, price: 0, amount: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // Recalculate totals whenever items or taxRate changes
  useEffect(() => {
    let newSubtotal = 0;
    const updatedItems = items.map(item => {
      const amount = (Number(item.quantity) || 0) * (Number(item.price) || 0);
      newSubtotal += amount;
      return { ...item, amount };
    });
    
    // Only update items if amounts changed to prevent infinite loops
    if (JSON.stringify(updatedItems) !== JSON.stringify(items)) {
      setItems(updatedItems);
    }
    
    setSubtotal(newSubtotal);
    const newTax = (newSubtotal * (Number(taxRate) || 0)) / 100;
    setTax(newTax);
    setTotalAmount(newSubtotal + newTax);
  }, [items, taxRate]);

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
      // 1. Create Invoice
      const invoiceData = {
        customerName,
        customerEmail,
        items,
        subtotal,
        tax,
        totalAmount
      };
      
      const res = await createInvoice(invoiceData);
      toast.success("Invoice created successfully!");
      
      // 2. Send Email if checked
      if (sendEmail && customerEmail && res.data?._id) {
        toast.info("Generating and sending PDF...");
        await api.post(`/sales/invoices/${res.data._id}/send`, { email: customerEmail, taxRate });
        toast.success("Invoice emailed to customer!");
      }

      navigate("/sales/invoice");
    } catch (error: any) {
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create New Invoice</h1>
        <p className="text-slate-500 mt-1">Generate an invoice with line items.</p>
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
              <input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} type="email" required={sendEmail} className="w-full rounded-md border p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="customer@example.com" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Line Items</h2>
            <Button type="button" onClick={handleAddItem} variant="outline" size="sm" className="flex items-center gap-2">
              <Plus size={14} /> Add Item
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
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
                      <input required value={item.itemName} onChange={e => handleItemChange(index, "itemName", e.target.value)} className="w-full rounded border p-2 text-sm outline-none" placeholder="Description" />
                    </td>
                    <td className="p-2">
                      <input required type="number" min="1" value={item.quantity} onChange={e => handleItemChange(index, "quantity", e.target.value)} className="w-full rounded border p-2 text-sm outline-none" />
                    </td>
                    <td className="p-2">
                      <input required type="number" min="0" step="0.01" value={item.price} onChange={e => handleItemChange(index, "price", e.target.value)} className="w-full rounded border p-2 text-sm outline-none" />
                    </td>
                    <td className="p-2 font-medium text-slate-700">
                      ${item.amount.toFixed(2)}
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
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Tax Rate (%):</span>
                <input type="number" min="0" max="100" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} className="w-20 rounded border p-1 text-right outline-none" />
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax Amount:</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} className="rounded border-gray-300 w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
            <span className="text-sm font-medium text-slate-700">Send Invoice via Email upon Creation</span>
          </label>
          
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/sales/invoice")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px]">
              {loading ? "Processing..." : "Create Invoice"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
