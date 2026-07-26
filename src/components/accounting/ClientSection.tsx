import { useState, useMemo, useEffect } from "react";
import { useAccounting } from "@/hooks/useAccounting";
import { formatCurrency } from "@/utils/formatCurrency";
import { CurrencyUtil } from "@/utils/currency.util";
import { 
  Users, 
  Search, 
  ChevronRight, 
  History,
  TrendingDown,
  TrendingUp,
  Filter,
  RefreshCw,
  Info,
  Plus
} from "lucide-react";
import { 
  getAccountGroups, 
  createAccount 
} from "../../services/accounting.service";
import toast from "react-hot-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export default function ClientSection() {
  const { vouchers, accounts, loading, refresh } = useAccounting();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "Customer" | "Vendor" | "Lead/Guest">("all");
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [groups, setGroups] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newParty, setNewParty] = useState({
    code: "",
    name: "",
    accountGroup: "",
    openingBalance: 0,
    description: ""
  });

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groupData = await getAccountGroups();
        setGroups(groupData || []);
      } catch (error) {
  // Intentionally ignore errors.
      }
    };
    fetchGroups();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createAccount(newParty);
      toast.success("Party created successfully");
      setShowForm(false);
      setNewParty({ code: "", name: "", accountGroup: "", openingBalance: 0, description: "" });
      if (refresh) refresh();
    } catch (error) {
      toast.error("Failed to create party");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extract unique parties from vouchers or special ledger accounts (Sundry Debtors/Creditors)
  const parties = useMemo(() => {
    // Get accounts that are likely parties (Vendors/Clients)
    const partyAccounts = accounts.filter(acc => {
      const g = acc.accountGroup;
      const groupName = (typeof g === 'object' && g !== null) ? g.name : "";
      return (
        groupName?.toLowerCase().includes("debtor") || 
        groupName?.toLowerCase().includes("creditor") ||
        acc.name?.toLowerCase().includes("client") ||
        acc.name?.toLowerCase().includes("vendor")
      );
    });

    // Also extract names from vouchers if they don't have a formal account yet
    const voucherParties = Array.from(new Set(vouchers.map(v => v.partyName).filter(Boolean)));

    const result = partyAccounts.map(acc => {
      const g = acc?.accountGroup;
      const groupNature = (typeof g === 'object' && g !== null) ? g.nature : "ASSET";
      
      return {
        name: acc?.name || "Unknown",
        balance: acc?.currentBalance || 0,
        id: acc?._id,
        type: groupNature === "LIABILITY" ? "Vendor" : "Customer",
        code: acc?.code || "N/A",
        group: (typeof g === 'object' && g !== null) ? g.name : "Uncategorized"
      };
    });

    // Add parties from vouchers that aren't in accounts yet
    voucherParties.forEach(name => {
      if (!result.find(r => r.name === name)) {
        // Calculate balance from vouchers
        const partyVouchers = vouchers.filter(v => v?.partyName === name);
        const totalDue = partyVouchers.reduce(
          (sum, v) => sum.plus(CurrencyUtil.parse(v?.amountDue || 0)),
          CurrencyUtil.parse(0)
        );
        result.push({
          name: name!,
          balance: totalDue.toFixed(2),
          id: `name-${name}`,
          type: "Lead/Guest",
          code: "GUEST",
          group: "Voucher-only"
        });
      }
    });

    return result;
  }, [vouchers, accounts]);

  const filteredParties = parties.filter(p => {
    const matchesSearch =
      p?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p?.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || p?.type === typeFilter;
    return Boolean(matchesSearch && matchesType);
  });

  const selectedPartyLedger = useMemo(() => {
    if (!selectedParty) return [];
    return vouchers
      .filter(v => v?.partyName === selectedParty)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedParty, vouchers]);

  if (selectedParty) {
    const party = parties.find(p => p.name === selectedParty);
    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedParty(null)}>
            <ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back to List
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{selectedParty}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] uppercase font-bold text-indigo-600 border-indigo-100">{party?.type}</Badge>
              <span className="text-xs text-slate-500 font-mono tracking-tight">{party?.code}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Balance</span>
            <span className={`text-2xl font-black tracking-tighter ${CurrencyUtil.parse(party?.balance || 0).greaterThan(0) ? "text-rose-600" : "text-emerald-600"}`}>
              {formatCurrency(CurrencyUtil.parse(party?.balance || 0).abs())}
              <span className="text-xs ml-1 font-bold">{CurrencyUtil.parse(party?.balance || 0).greaterThan(0) ? "DR" : "CR"}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <History size={120} />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-white/70 text-xs uppercase font-bold tracking-wider">Total Sales / Transacted</CardDescription>
              <CardTitle className="text-3xl font-black tracking-tight">
                {formatCurrency(
                  selectedPartyLedger
                    .filter(v => ["SALES", "PURCHASE", "CREDIT_NOTE", "DEBIT_NOTE"].includes(v.type))
                    .reduce((sum, v) => sum.plus(CurrencyUtil.parse(v.totalAmount || 0)), CurrencyUtil.parse(0))
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-xs text-indigo-100 font-medium bg-white/10 w-fit px-2 py-1 rounded-full border border-white/5">
                <History className="w-3 h-3" /> {
                  selectedPartyLedger.filter(v => ["SALES", "PURCHASE", "CREDIT_NOTE", "DEBIT_NOTE"].includes(v.type)).length
                } Records
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp size={120} className="text-emerald-600" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400 text-xs uppercase font-bold tracking-wider">Total Collection / Paid</CardDescription>
              <CardTitle className="text-3xl font-black text-emerald-600 tracking-tight">
                {formatCurrency(selectedPartyLedger.filter(v => ['RECEIPT', 'PAYMENT'].includes(v.type)).reduce((sum, v) => sum.plus(CurrencyUtil.parse(v.totalAmount || 0)), CurrencyUtil.parse(0)))}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-xs text-emerald-500 font-bold bg-emerald-50 w-fit px-2 py-1 rounded-full border border-emerald-100">
                <TrendingUp className="w-3 h-3" /> Payments Collected
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-white relative overflow-hidden group">
             <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingDown size={120} className="text-rose-600" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400 text-xs uppercase font-bold tracking-wider">Outstanding Due</CardDescription>
              <CardTitle className="text-3xl font-black text-rose-600 tracking-tight">
                {formatCurrency(
                  party?.type === "Vendor"
                    ? CurrencyUtil.parse(party?.balance || 0).negated().greaterThan(0)
                      ? CurrencyUtil.parse(party?.balance || 0).negated()
                      : CurrencyUtil.parse(0)
                    : CurrencyUtil.parse(party?.balance || 0).greaterThan(0)
                      ? CurrencyUtil.parse(party?.balance || 0)
                      : CurrencyUtil.parse(0)
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-xs text-rose-500 font-bold bg-rose-50 w-fit px-2 py-1 rounded-full border border-rose-100">
                <TrendingDown className="w-3 h-3" /> Follow-up Required
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">Financial History & Segmented Payments</CardTitle>
            <CardDescription>Detailed breakdown of all vouchers and payments for this party.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/80 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider">Voucher #</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider">Title</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider">Description</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider">Bill #</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider">Updated By</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-600 uppercase text-[10px] tracking-wider">Total</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-600 uppercase text-[10px] tracking-wider">Paid</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-600 uppercase text-[10px] tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedPartyLedger.map((v) => (
                    <tr key={v._id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                        {new Date(v.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">{v.voucherNumber}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-[150px] truncate">
                        {v.title || <span className="text-gray-300 italic">—</span>}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 max-w-[180px] truncate">
                        {v.description || <span className="text-gray-300 italic">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-black text-slate-400 tracking-tighter uppercase">{v.referenceNumber || "-"}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[10px] uppercase">
                          {v.updatedBy || "Admin"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={v.paymentStatus === "PAID" ? "default" : "outline"} className={
                          v.paymentStatus === "PAID" ? "bg-emerald-500" : 
                          v.paymentStatus === "PARTIAL" ? "border-amber-500 text-amber-600 shadow-sm" : 
                          "border-rose-500 text-rose-600 shadow-sm"
                        }>
                          {v.paymentStatus}
                        </Badge>
                      </td>
                      <td className={`px-6 py-4 text-right font-black ${
                        v.type === 'SALES' ? "text-emerald-600" :
                        v.type === 'RECEIPT' ? "text-cyan-600" :
                        v.type === 'PURCHASE' ? "text-rose-600" :
                        v.type === 'PAYMENT' ? "text-indigo-600" :
                        "text-slate-900"
                      }`}>
                        {v.type === 'SALES' || v.type === 'RECEIPT' ? '+' : '-'} {formatCurrency(v.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-right text-emerald-600 font-bold">{formatCurrency(v.amountPaid || 0)}</td>
                      <td className="px-6 py-4 text-right text-rose-600 font-bold">{formatCurrency(v.amountDue || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="sticky top-6 z-30 bg-gray-50/95 backdrop-blur-md pt-2 pb-4 mb-6 border-b border-gray-100">
        <div className="flex flex-col space-y-4 px-3">
          {/* Title and Button Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-3xl font-bold tracking-tight bg-black bg-clip-text text-transparent flex items-center gap-3">
              <Users className="w-8 h-8 text-black" />
              Party Ledgers
            </h2>
            <Button onClick={() => setShowForm(!showForm)} className="bg-black hover:bg-gray-700 shadow-lg shadow-indigo-100 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> {showForm ? "Cancel" : "Add New Party"}
            </Button>
          </div>
          
          {/* Search and Filter Row */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search clients or vendors..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-slate-200 focus-visible:ring-indigo-500 shadow-sm h-10"
              />
            </div>
            <div className="relative w-full sm:w-52">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as "all" | "Customer" | "Vendor" | "Lead/Guest")}
                className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="Customer">Customer</option>
                <option value="Vendor">Vendor</option>
                <option value="Lead/Guest">Lead/Guest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <Card className="border-indigo-100 shadow-2xl animate-in slide-in-from-top-4 duration-300 bg-white/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-indigo-900">Register New Party</CardTitle>
            <CardDescription>Create a new ledger for your client or vendor.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold">Party Name</Label>
                <Input 
                  value={newParty.name} 
                  onChange={e => setNewParty({...newParty, name: e.target.value})} 
                  placeholder="e.g. Acme Corp" 
                  required 
                  disabled={isSubmitting}
                  className="bg-white border-slate-200 focus-visible:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold">Account Code</Label>
                <Input 
                  value={newParty.code} 
                  onChange={e => setNewParty({...newParty, code: e.target.value})} 
                  placeholder="e.g. CUST-001" 
                  required 
                  disabled={isSubmitting}
                  className="bg-white border-slate-200 focus-visible:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold">Under Group</Label>
                <select 
                  value={newParty.accountGroup} 
                  onChange={e => setNewParty({...newParty, accountGroup: e.target.value})} 
                  className="w-full border-slate-200 border rounded-md p-2 h-10 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none transition-all" 
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select Group</option>
                  {groups.filter(g => g.nature === 'ASSET' || g.nature === 'LIABILITY').map(g => (
                    <option key={g._id} value={g._id}>{g.name} ({g.nature})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-600 font-semibold">Opening Bal</Label>
                <Input 
                  type="number" 
                  value={newParty.openingBalance} 
                  onChange={e => setNewParty({...newParty, openingBalance: e.target.value ? CurrencyUtil.parse(e.target.value).toNumber() : 0})} 
                  placeholder="0.00" 
                  disabled={isSubmitting}
                  className="bg-white border-slate-200 focus-visible:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-4 flex justify-between items-center border-t border-slate-100 pt-4">
                {newParty.accountGroup ? (
                   <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Determined Nature: <span className="uppercase">{groups.find(g => g._id === newParty.accountGroup)?.nature || 'Unknown'}</span>
                  </div>
                ) : <div />}
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)} disabled={isSubmitting}>Cancel</Button>
                  <Button type="submit" className="px-8 shadow-lg" disabled={isSubmitting}>
                    {isSubmitting ? "Generating Ledger..." : "Register Party"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl">
       
        <CardContent>
          <div className="rounded-xl border overflow-x-auto shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider">Party / Ledger</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider">Group</th>
                  <th className="px-6 py-4 text-left font-bold text-slate-600 uppercase text-[10px] tracking-wider">Type</th>
                  <th className="px-6 py-4 text-right font-bold text-slate-600 uppercase text-[10px] tracking-wider">Current Balance</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 opacity-20" />
                      Decrypting ledger data...
                    </td>
                  </tr>
                ) : filteredParties.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                      No parties found. Start by adding one!
                    </td>
                  </tr>
                ) : (
                  filteredParties.map((party) => (
                    <tr 
                      key={party.id} 
                      className="hover:bg-indigo-50/40 transition-all cursor-pointer group"
                      onClick={() => setSelectedParty(party.name)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            {party.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{party.name}</div>
                            <div className="text-[10px] font-mono text-slate-400">{party.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {party.group}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         <Badge variant="outline" className={`text-[10px] font-black uppercase ${party.type === 'Vendor' ? 'text-amber-600 border-amber-100 bg-amber-50' : 'text-blue-600 border-blue-100 bg-blue-50'}`}>
                          {party.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                           <span className={`font-black text-base tracking-tighter ${CurrencyUtil.parse(party.balance).greaterThan(0) ? "text-rose-600" : "text-emerald-600"}`}>
                            {formatCurrency(CurrencyUtil.parse(party.balance).abs())}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {CurrencyUtil.parse(party.balance).greaterThan(0) ? "Debit" : "Credit"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all inline opacity-0 group-hover:opacity-100" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-700">
        <Info className="w-5 h-5 text-indigo-500 mt-0.5" />
        <p className="text-sm text-indigo-700">
          <strong>Pro Tip:</strong> Party ledgers are automatically updated when you record sales, purchases, or payments. Use the search to quickly find a customer and review their collection history.
        </p>
      </div>
    </div>
  );
}
