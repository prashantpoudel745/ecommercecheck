import { useState, useEffect } from "react";
import { CurrencyUtil } from "@/utils/currency.util";
import { 
  getJournalEntries, 
  createJournalEntry, 
  getAccounts 
} from "../../services/accounting.service";
import { 
  Plus, 
  BookOpen, 
  Calendar, 
  FileText, 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  RefreshCw,
  Info
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/utils/notify";
import { getUserFriendlyErrorMessage } from "@/utils/errorHandler";
import { formatCurrency, CURRENCY_SYMBOL } from "@/utils/formatCurrency";
import { JournalEntry,Account } from "../../../types/accounting.types";

export default function JournalEntryList() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New Entry State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState([{ accountId: "", debit: 0, credit: 0 }, { accountId: "", debit: 0, credit: 0 }]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedEntries, fetchedAccounts] = await Promise.all([
        getJournalEntries(),
        getAccounts()
      ]);
      setEntries(fetchedEntries);
      setAccounts(fetchedAccounts);
    } catch (error) {
      // console.error("Failed to fetch data", error);
      const friendlyMessage = getUserFriendlyErrorMessage(error);
      toast.error(friendlyMessage);
    } finally {
        setLoading(false);
    }
  };

  const handleLineChange = (index: number, field: string, value) => {
    const newLines = [...lines];
    (newLines[index] )[field] = value;
    setLines(newLines);
  };

  const addLine = () => {
    setLines([...lines, { accountId: "", debit: 0, credit: 0 }]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) {
      toast.error("At least two lines are required for a journal entry.");
      return;
    }
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formattedEntries = lines.map(line => ({
        account: line.accountId,
        debit: line.debit ? CurrencyUtil.parse(line.debit).toNumber() : 0,
        credit: line.credit ? CurrencyUtil.parse(line.credit).toNumber() : 0
      }));

      await createJournalEntry({
        date,
        description,
        entries: formattedEntries
      });
      
      toast.success("Journal entry posted successfully");
      fetchData();
      setShowForm(false);
      setDescription("");
      setLines([{ accountId: "", debit: 0, credit: 0 }, { accountId: "", debit: 0, credit: 0 }]);
    } catch (error) {
      const friendlyMessage = getUserFriendlyErrorMessage(error);
      toast.error(friendlyMessage);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = (type: 'debit' | 'credit') => {
      return lines.reduce((sum, line) => sum + CurrencyUtil.parse(line[type] || 0).toNumber(), 0);
  }

  const isBalanced = Math.abs(calculateTotal('debit') - calculateTotal('credit')) < 0.01;
  const totalAmount = calculateTotal('debit');

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-600" />
            General Ledger
          </h2>
          <p className="text-muted-foreground">Record manual journal entries and track financial adjustments.</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)} 
          className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-100"
        >
          <Plus className="w-4 h-4 mr-2" /> {showForm ? "Cancel" : "Post Journal Entry"}
        </Button>
      </div>

      {showForm && (
        <Card className="border-purple-100 shadow-2xl animate-in slide-in-from-top-4 duration-300 bg-white/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-purple-900">New Journal Entry Override</CardTitle>
            <CardDescription>Ensure total debits equal total credits before posting.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold">Entry Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="pl-4 border-slate-200" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 font-semibold">Narrative / Description</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Adjustment for..." className="pl-4 border-slate-200" required />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 overflow-hidden bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/80 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-[10px]">Account Ledger</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-[10px] w-32">Debit ({CURRENCY_SYMBOL})</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-[10px] w-32">Credit ({CURRENCY_SYMBOL})</th>
                      <th className="px-4 py-3 text-center font-bold text-slate-500 uppercase text-[10px] w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {lines.map((line, index) => (
                      <tr key={index} className="hover:bg-slate-50/30 transition-colors">
                        <td className="p-3">
                          <select 
                            value={line.accountId}
                            onChange={(e) => handleLineChange(index, 'accountId', e.target.value)}
                            className="w-full border-slate-200 border rounded-md p-2 h-10 text-sm focus-visible:ring-2 focus-visible:ring-purple-500 outline-none transition-all"
                            required
                          >
                            <option value="">Select Account</option>
                            {accounts.map(acc => (
                                <option key={acc._id} value={acc._id}>{acc.code} - {acc.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3">
                          <Input 
                            type="number" 
                            step="0.01"
                            value={line.debit} 
                            onChange={(e) => handleLineChange(index, 'debit', e.target.value)}
                            className="border-slate-200 font-mono text-emerald-600 font-bold"
                            min="0"
                          />
                        </td>
                        <td className="p-3">
                          <Input 
                            type="number" 
                            step="0.01"
                            value={line.credit} 
                            onChange={(e) => handleLineChange(index, 'credit', e.target.value)}
                            className="border-slate-200 font-mono text-rose-600 font-bold"
                            min="0"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button 
                            type="button" 
                            onClick={() => removeLine(index)} 
                            className="text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50/50 font-bold">
                    <tr>
                      <td className="px-4 py-3 text-right text-slate-400 text-xs uppercase">Totals:</td>
                      <td className="px-4 py-3 font-mono text-emerald-600 text-base tracking-tighter">{formatCurrency(calculateTotal('debit'))}</td>
                      <td className="px-4 py-3 font-mono text-rose-600 text-base tracking-tighter">{formatCurrency(calculateTotal('credit'))}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="flex justify-between items-center">
                 <Button type="button" variant="outline" size="sm" onClick={addLine} className="text-slate-600 border-slate-200 hover:bg-slate-100">
                    <PlusCircle className="w-4 h-4 mr-2" /> Add Transaction Line
                 </Button>
                 <div className="flex items-center gap-4">
                    {!isBalanced && (
                      <div className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 flex items-center gap-2 animate-pulse">
                        <Info className="w-4 h-4" /> Difference: {formatCurrency(calculateTotal('debit') - calculateTotal('credit'))}
                      </div>
                    )}
                    <Button
                      type="submit"
                      disabled={!isBalanced || totalAmount === 0 || isSubmitting}
                      className="px-4 shadow-lg"
                    >
                      {isSubmitting ? "Posting..." : "Authorize & Post Entry"}
                    </Button>
                 </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">Historical Journal Entries</CardTitle>
            <CardDescription>Archive of manual adjustments and authorized ledger posts.</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchData} className={loading ? "animate-spin text-slate-600" : "text-slate-400 hover:text-slate-900"}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 border-y border-slate-100">
                <tr>
                  <th className="px-4 py-4 text-left font-bold text-slate-500 uppercase text-[10px] tracking-wider">Date</th>
                  <th className="px-4 py-4 text-left font-bold text-slate-500 uppercase text-[10px] tracking-wider">Narrative</th>
                  <th className="px-4 py-4 text-left font-bold text-slate-500 uppercase text-[10px] tracking-wider">Affected Ledgers (Double Entry)</th>
                  <th className="px-4 py-4 text-right font-bold text-slate-500 uppercase text-[10px] tracking-wider">Total Impact</th>
                  <th className="px-4 py-4 text-center font-bold text-slate-500 uppercase text-[10px] tracking-wider">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-20 text-center text-slate-400 italic">
                      <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-4 opacity-10" />
                      Auditing general ledger...
                    </td>
                  </tr>
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-20 text-center text-slate-400 italic">
                      No journal entries recorded yet.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr key={entry._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-4 whitespace-nowrap font-medium text-slate-500">
                          {new Date(entry.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-900 group-hover:text-purple-600 transition-colors">{entry.description}</td>
                      <td className="px-4 py-4">
                          <div className="flex flex-col gap-2 min-w-[200px]">
                              {entry.entries.map((line, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-[11px] bg-slate-50/50 p-1.5 rounded border border-slate-100/50 group-hover:bg-white transition-colors">
                                      <span className="font-semibold text-slate-700">{line.account.name}</span>
                                      {Number(line.debit) > 0 ? 
                                        <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-600 border-emerald-100 font-black">DR {formatCurrency(line.debit)}</Badge> : 
                                        <Badge variant="outline" className="text-[9px] bg-rose-50 text-rose-600 border-rose-100 font-black">CR {formatCurrency(line.credit)}</Badge>
                                      }
                                  </div>
                              ))}
                          </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right font-black tracking-tighter text-base text-slate-900">
                          {formatCurrency(entry.totalAmount)}
                      </td>
                       <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1 text-emerald-600 font-black text-[10px] uppercase">
                          <CheckCircle2 className="w-3 h-3" />
                          {entry.status}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl flex gap-3 items-start">
        <Info className="w-5 h-5 text-purple-500 mt-0.5" />
        <p className="text-sm text-purple-700">
          <strong>Security Note:</strong> All journal entries are cryptographically linked to your ledger audit trail. Manual overrides should only be performed for corrections or opening balance adjustments.
        </p>
      </div>
    </div>
  );
}

