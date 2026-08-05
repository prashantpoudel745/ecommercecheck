import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDebitNote, fetchSuppliers } from "@/services/purchase.service";
import { useEffect } from "react";

const REASONS = [
  { value: "GOODS_RETURNED",       label: "Goods Returned to Supplier" },
  { value: "PRICE_DECREASE",       label: "Price Decrease Agreed" },
  { value: "VAT_ADJUSTMENT",       label: "VAT Adjustment" },
  { value: "QUALITY_DEFECT",       label: "Quality Defect" },
  { value: "OVERCHARGE_CORRECTION",label: "Overcharge Correction" },
  { value: "OTHER",                label: "Other" },
];

const PAYMENT_METHODS = [
  "CASH","CHEQUE","BANK_TRANSFER","ESEWA","KHALTI","FONEPAY","CONNECTIPS","IME_PAY","OTHER"
];
const VAT_RATE = 0.15;

interface LineItem { itemName: string; quantity: number; price: number; vatExempt: boolean; }

export default function CreateDebitNotePage() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");

  const [form, setForm] = useState({
    supplierName:    "",
    supplierPAN:     "",
    purchaseBillRef: "",
    reason:          "GOODS_RETURNED",
    returnType:      "PARTIAL",
    approvedBy:      "",
    remarks:         "",
  });

  const [items, setItems] = useState<LineItem[]>([
    { itemName: "", quantity: 1, price: 0, vatExempt: false },
  ]);

  const [panError, setPanError] = useState("");

  useEffect(() => {
    fetchSuppliers().then((d) => setSuppliers(d?.data || [])).catch(() => {});
  }, []);

  const handleItemChange = (i: number, field: keyof LineItem, value: any) => {
    const updated = [...items];
    (updated[i] as any)[field] = value;
    setItems(updated);
  };

  const addItem = () => setItems([...items, { itemName: "", quantity: 1, price: 0, vatExempt: false }]);
  const removeItem = (i: number) => items.length > 1 && setItems(items.filter((_, idx) => idx !== i));

  const calcTotals = () => {
    let taxable = 0, exempt = 0;
    items.forEach((it) => {
      const amt = it.quantity * it.price;
      if (it.vatExempt) exempt += amt; else taxable += amt;
    });
    const vat = taxable * VAT_RATE;
    return { taxable, exempt, vat, total: taxable + vat + exempt };
  };

  const { taxable, exempt, vat, total } = calcTotals();

  const validatePAN = (val: string) => {
    if (val && !/^\d{9}$/.test(val)) setPanError("PAN must be exactly 9 numeric digits");
    else setPanError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (panError) return;
    if (!form.supplierName.trim()) { setError("Supplier name is required"); return; }
    if (items.some((it) => !it.itemName.trim())) { setError("All items must have a name"); return; }

    setLoading(true); setError("");
    try {
      await createDebitNote({ ...form, items });
      setSuccess("Debit Note created successfully!");
      setTimeout(() => navigate("/purchase/debit-notes"), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create debit note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Create Debit Note</h1>
            <p className="text-slate-400 text-sm">IRD Compliant — Supplier Purchase Adjustment</p>
          </div>
          <span className="ml-auto bg-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full border border-amber-500/30">
            IRD Required
          </span>
        </div>

        {error   && <div className="mb-4 p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm">{error}</div>}
        {success && <div className="mb-4 p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Supplier Info */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              Supplier Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Supplier Name <span className="text-red-400">*</span></label>
                <input list="supplier-list" value={form.supplierName}
                  onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Supplier name" required />
                <datalist id="supplier-list">
                  {suppliers.map((s: any) => <option key={s._id} value={s.name || s.supplierName} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Supplier PAN
                  <span className="ml-2 text-xs text-amber-400">(9 digits)</span>
                </label>
                <input value={form.supplierPAN}
                  onChange={(e) => { setForm({ ...form, supplierPAN: e.target.value }); validatePAN(e.target.value); }}
                  className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${panError ? "border-red-500" : "border-white/20"}`}
                  placeholder="123456789" maxLength={9} />
                {panError && <p className="text-red-400 text-xs mt-1">{panError}</p>}
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Original Purchase Bill Ref</label>
                <input value={form.purchaseBillRef}
                  onChange={(e) => setForm({ ...form, purchaseBillRef: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. FY2082/83-PB-000001" />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Approved By</label>
                <input value={form.approvedBy}
                  onChange={(e) => setForm({ ...form, approvedBy: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Supervisor name" />
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              Adjustment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Reason <span className="text-red-400">*</span></label>
                <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full bg-slate-800 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Return Type</label>
                <div className="flex gap-3 mt-1">
                  {["PARTIAL", "FULL"].map((t) => (
                    <button type="button" key={t}
                      onClick={() => setForm({ ...form, returnType: t })}
                      className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${form.returnType === t ? "bg-blue-600 border-blue-500 text-white" : "bg-white/5 border-white/20 text-slate-300 hover:bg-white/10"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-300 mb-1">Remarks</label>
                <textarea value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2} placeholder="Additional notes..." />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Items
              </h2>
              <button type="button" onClick={addItem}
                className="bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-400 border border-emerald-600/40 text-sm px-4 py-1.5 rounded-lg transition-all">
                + Add Item
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-xs text-slate-400 px-1">
                <div className="col-span-4">Item Name</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Price (Rs)</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-1 text-center">VAT?</div>
                <div className="col-span-1"></div>
              </div>
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <input value={item.itemName}
                      onChange={(e) => handleItemChange(i, "itemName", e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Item name" required />
                  </div>
                  <div className="col-span-2">
                    <input type="number" min="0.01" step="0.01" value={item.quantity}
                      onChange={(e) => handleItemChange(i, "quantity", Number(e.target.value))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <input type="number" min="0" step="0.01" value={item.price}
                      onChange={(e) => handleItemChange(i, "price", Number(e.target.value))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-slate-300 text-sm">
                      Rs. {(item.quantity * item.price).toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <input type="checkbox" checked={!item.vatExempt}
                      onChange={(e) => handleItemChange(i, "vatExempt", !e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-500" title="VAT Applicable" />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button type="button" onClick={() => removeItem(i)}
                      className="text-red-400 hover:text-red-300 text-lg leading-none" title="Remove">×</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">IRD Totals Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Taxable Amount (15% VAT applies)</span>
                <span>Rs. {taxable.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>VAT Exempt Amount</span>
                <span>Rs. {exempt.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>VAT @ 15%</span>
                <span>Rs. {vat.toFixed(2)}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between text-xl font-bold text-white">
                <span>Total Amount</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading || !!panError}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 rounded-2xl text-white font-semibold text-lg transition-all shadow-lg shadow-blue-900/30">
            {loading ? "Creating Debit Note…" : "Create Debit Note"}
          </button>
        </form>
      </div>
    </div>
  );
}
