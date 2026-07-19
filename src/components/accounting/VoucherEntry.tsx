import { useState, useEffect } from "react";
import { getAccounts, createVoucher } from "../../services/accounting.service";
import { CURRENCY_SYMBOL } from "@/utils/formatCurrency";
import { Plus, Trash2, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function VoucherEntry({ onVoucherAdded }: { onVoucherAdded?: () => void }) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voucher, setVoucher] = useState({
    voucherNumber: "",
    type: "JOURNAL",
    date: new Date().toISOString().split('T')[0],
    narration: "",
    entries: [
      { account: "", type: "DEBIT", amount: 0, description: "" },
      { account: "", type: "CREDIT", amount: 0, description: "" }
    ]
  });

  useEffect(() => {
    getAccounts().then(setAccounts);
  }, []);

  const addRow = () => {
    setVoucher({
      ...voucher,
      entries: [...voucher.entries, { account: "", type: "DEBIT", amount: 0, description: "" }]
    });
  };

  const removeRow = (index: number) => {
    if (voucher.entries.length <= 2) return;
    const newEntries = voucher.entries.filter((_, i) => i !== index);
    setVoucher({ ...voucher, entries: newEntries });
  };

  const updateEntry = (index: number, field: string, value: any) => {
    const newEntries = [...voucher.entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setVoucher({ ...voucher, entries: newEntries });
  };

  const totals = voucher.entries.reduce((acc, entry) => {
    if (entry.type === "DEBIT") acc.dr += Number(entry.amount);
    else acc.cr += Number(entry.amount);
    return acc;
  }, { dr: 0, cr: 0 });

  const difference = Math.abs(totals.dr - totals.cr);
  const isBalanced = difference < 0.01 && totals.dr > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;
    
    setIsSubmitting(true);
    try {
      await createVoucher(voucher);
      if (onVoucherAdded) onVoucherAdded();
      setVoucher({
        voucherNumber: "",
        type: "JOURNAL",
        date: new Date().toISOString().split('T')[0],
        narration: "",
        entries: [
            { account: "", type: "DEBIT", amount: 0, description: "" },
            { account: "", type: "CREDIT", amount: 0, description: "" }
        ]
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to save voucher");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50/30">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Voucher Type</Label>
            <select 
              value={voucher.type} 
              onChange={e => setVoucher({...voucher, type: e.target.value})}
              className="w-full border rounded-xl p-2.5 h-11 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            >
              <option value="JOURNAL">Journal Voucher</option>
              <option value="PAYMENT">Payment Voucher</option>
              <option value="RECEIPT">Receipt Voucher</option>
              <option value="CONTRA">Contra (Bank/Cash)</option>
              <option value="SALES">Sales Invoice</option>
              <option value="PURCHASE">Purchase Bill</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Reference No (Optional)</Label>
            <Input 
              value={voucher.voucherNumber} 
              onChange={e => setVoucher({...voucher, voucherNumber: e.target.value})}
              placeholder="e.g. REF-001"
              className="h-11 rounded-xl bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input 
              type="date" 
              value={voucher.date} 
              onChange={e => setVoucher({...voucher, date: e.target.value})}
              className="h-11 rounded-xl bg-white"
            />
          </div>
        </div>

        <Card className="border-none shadow-xl overflow-hidden rounded-2xl bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Dr/Cr</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Account Ledger</th>
                    <th className="px-4 py-3 text-right font-bold text-slate-500 uppercase tracking-wider text-[10px]">Amount ({CURRENCY_SYMBOL})</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider text-[10px]">Line Narration</th>
                    <th className="px-4 py-3 text-center font-bold text-slate-500 uppercase tracking-wider text-[10px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {voucher.entries.map((entry, index) => (
                    <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 w-24">
                        <select 
                          value={entry.type} 
                          onChange={e => updateEntry(index, 'type', e.target.value)}
                          className={`w-full border-none rounded-lg p-1.5 text-xs font-bold outline-none transition-colors ${
                            entry.type === 'DEBIT' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          <option value="DEBIT">By (Dr)</option>
                          <option value="CREDIT">To (Cr)</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 min-w-[200px]">
                        <select 
                          value={entry.account} 
                          onChange={e => updateEntry(index, 'account', e.target.value)}
                          className="w-full border-none bg-transparent hover:bg-white focus:bg-white rounded-lg p-1.5 outline-none transition-all"
                          required
                        >
                          <option value="">Select Account</option>
                          {accounts.map(acc => (
                            <option key={acc._id} value={acc._id}>{acc.name} ({acc.code})</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 w-32">
                        <Input 
                          type="number" 
                          value={entry.amount} 
                          onChange={e => updateEntry(index, 'amount', Number(e.target.value))}
                          className="border-none bg-transparent hover:bg-white focus:bg-white text-right font-mono font-bold"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input 
                          value={entry.description} 
                          onChange={e => updateEntry(index, 'description', e.target.value)}
                          className="border-none bg-transparent hover:bg-white focus:bg-white text-xs italic"
                          placeholder="Individual line details..."
                        />
                      </td>
                      <td className="px-4 py-3 w-10 text-center">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeRow(index)}
                          className="text-slate-300 hover:text-rose-500 disabled:opacity-30"
                          disabled={voucher.entries.length <= 2}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-50/50 border-t flex justify-between items-center">
              <Button type="button" variant="outline" size="sm" onClick={addRow} className="rounded-xl border-dashed border-slate-300 text-slate-700 hover:bg-slate-100">
                <Plus className="w-4 h-4 mr-2" /> Add Entry Line
              </Button>
              <div className="flex gap-8 text-sm">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Debit</span>
                  <span className="font-bold text-emerald-600">{CURRENCY_SYMBOL}{totals.dr.toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Credit</span>
                  <span className="font-bold text-rose-600">{CURRENCY_SYMBOL}{totals.cr.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {difference > 0 && (
          <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100 animate-in slide-in-from-left-2 duration-200">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Voucher unbalanced by {CURRENCY_SYMBOL}{difference.toFixed(2)}</span>
          </div>
        ) || totals.dr > 0 && (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100 animate-in slide-in-from-left-2 duration-200">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Voucher is perfectly balanced</span>
          </div>
        )}

        <div className="space-y-2">
          <Label>Master Narration / Remarks</Label>
          <textarea 
            value={voucher.narration}
            onChange={e => setVoucher({...voucher, narration: e.target.value})}
            className="w-full border rounded-2xl p-4 min-h-[100px] bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none italic text-sm"
            placeholder="Describe the purpose of this transaction..."
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={!isBalanced || isSubmitting}
            className={`h-12 px-8 rounded-2xl font-bold shadow-lg transition-all ${
              isBalanced 
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? "Posting..." : <><Save className="w-5 h-5 mr-2" /> Finalize & Post Voucher</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
