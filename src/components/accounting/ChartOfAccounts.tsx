import { useState, useEffect } from "react";
import { formatCurrency } from "@/utils/formatCurrency";
import { 
  getAccounts, 
  createAccount, 
  getAccountGroups, 
  createAccountGroup,
  seedDefaults, 
  migrateLegacy 
} from "../../services/accounting.service";
import { 
  Plus, 
  FolderTree, 
  RefreshCw, 
  Database,
  Search,
  ChevronRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [newAccount, setNewAccount] = useState({
    code: "",
    name: "",
    accountGroup: "",
    openingBalance: 0,
    description: ""
  });
  const [newGroup, setNewGroup] = useState({
    name: "",
    parentGroup: "",
    nature: "ASSET" as "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE",
    description: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accData, groupData] = await Promise.all([
        getAccounts(), 
        getAccountGroups()
      ]);
      setAccounts(accData || []);
      setGroups(groupData || []);
    } catch (error) {
  // Intentionally ignore errors.
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    if(!confirm("Seed default groups and chart of accounts?")) return;
    try {
        await seedDefaults();
        fetchData();
    } catch(e: any) { 
        console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAccount(newAccount);
      fetchData();
      setShowForm(false);
      setNewAccount({ code: "", name: "", accountGroup: "", openingBalance: 0, description: "" });
    } catch (error) {
      console.error("Failed to create account", error);
    }
  };

  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const createdGroup = await createAccountGroup({
        name: newGroup.name,
        parentGroup: newGroup.parentGroup || undefined,
        nature: newGroup.nature,
        description: newGroup.description
      });
      await fetchData();
      setShowGroupForm(false);
      setNewGroup({ name: "", parentGroup: "", nature: "ASSET", description: "" });
      // Automatically select this group in the ledger form if it was open
      if (createdGroup?._id) {
        setNewAccount(prev => ({ ...prev, accountGroup: createdGroup._id }));
      }
    } catch (error) {
      console.error("Failed to create group", error);
    }
  };

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch =
      acc?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc?.accountGroup?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const accountGroupId = typeof acc?.accountGroup === "object" ? acc?.accountGroup?._id : acc?.accountGroup;
    const matchesGroup = groupFilter === "all" || accountGroupId === groupFilter;
    return Boolean(matchesSearch && matchesGroup);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Chart of Accounts
          </h2>
          <p className="text-muted-foreground">Manage your ledger accounts and financial structure.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSeed} className="flex items-center gap-2">
            <Database className="w-4 h-4" /> Seed Logic
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setShowGroupForm(!showGroupForm);
            }} 
            className=" text-white hover:text-slate-900 bg-slate-900 "
          >
            <FolderTree className="w-4 h-4 mr-2" /> Add Group
          </Button>
          <Button 
            onClick={() => {
              setShowForm(!showForm);
            }} 
            className="text-white hover:text-slate-900 bg-slate-900 "
          >
            <Plus className="w-4 h-4 mr-2" /> Add Ledger
          </Button>
        </div>
      </div>

      {showGroupForm && (
        <Card className="border-blue-100 shadow-xl animate-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle>Create New Account Group</CardTitle>
            <CardDescription>Groups help categorize your ledger accounts (e.g. Current Assets, Indirect Expenses).</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGroupSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Group Name</Label>
                <Input value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value})} placeholder="e.g. Cash-in-Hand" required />
              </div>
              <div className="space-y-2">
                <Label>Parent Group (Optional)</Label>
                <select 
                  value={newGroup.parentGroup} 
                  onChange={e => {
                    const parentId = e.target.value;
                    const parent = groups.find(g => g._id === parentId);
                    setNewGroup({
                      ...newGroup, 
                      parentGroup: parentId,
                      nature: parent ? parent.nature : newGroup.nature
                    });
                  }} 
                  className="w-full border rounded-md p-2 h-10 text-sm"
                >
                  <option value="">None (Top-Level)</option>
                  {groups.map(g => (
                    <option key={g._id} value={g._id}>{g.name} ({g.nature})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Nature</Label>
                <select 
                  value={newGroup.nature} 
                  onChange={e => setNewGroup({...newGroup, nature: e.target.value as any})} 
                  className="w-full border rounded-md p-2 h-10 text-sm" 
                  disabled={!!newGroup.parentGroup}
                  required
                >
                  <option value="ASSET">ASSET</option>
                  <option value="LIABILITY">LIABILITY</option>
                  <option value="EQUITY">EQUITY</option>
                  <option value="REVENUE">REVENUE</option>
                  <option value="EXPENSE">EXPENSE</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={newGroup.description} onChange={e => setNewGroup({...newGroup, description: e.target.value})} placeholder="Optional description" />
              </div>
              <div className="md:col-span-4 flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowGroupForm(false)}>Cancel</Button>
                <Button type="submit" className="px-8 shadow-lg">Save Group</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card className="border-blue-100 shadow-xl animate-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle>Create New Ledger</CardTitle>
            <CardDescription>Add a new account to your chart of accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Account Name</Label>
                <Input value={newAccount.name} onChange={e => setNewAccount({...newAccount, name: e.target.value})} placeholder="e.g. Petty Cash" required />
              </div>
              <div className="space-y-2">
                <Label>Account Code</Label>
                <Input value={newAccount.code} onChange={e => setNewAccount({...newAccount, code: e.target.value})} placeholder="e.g. 1001" required />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Under Group</Label>
                  <button 
                    type="button" 
                    onClick={() => setShowGroupForm(true)} 
                    className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Quick Add Group
                  </button>
                </div>
                <select 
                  value={newAccount.accountGroup} 
                  onChange={e => setNewAccount({...newAccount, accountGroup: e.target.value})} 
                  className="w-full border rounded-md p-2 h-10 text-sm" 
                  required
                >
                  <option value="">Select Group</option>
                  {groups.map(g => (
                    <option key={g._id} value={g._id}>{g.name} ({g.nature})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Opening Bal</Label>
                <Input type="number" value={newAccount.openingBalance} onChange={e => setNewAccount({...newAccount, openingBalance: Number(e.target.value)})} placeholder="0.00" />
              </div>
              {newAccount.accountGroup && (
                <div className="lg:col-span-1 flex items-end pb-2">
                  <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Nature: {groups.find(g => g._id === newAccount.accountGroup)?.nature || 'Unknown'}
                  </div>
                </div>
              )}
              <div className="md:col-span-4 flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" className="px-8 shadow-lg">Save Account</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 pb-4 gap-3">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search accounts..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-none focus-visible:ring-blue-500"
            />
          </div>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Groups</option>
              {groups.map((g) => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchData} className={loading ? "animate-spin" : ""}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Account Code</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Ledger Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Group</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-600">Current Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 opacity-20" />
                      Loading accounts...
                    </td>
                  </tr>
                ) : filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      No accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((account) => (
                    <tr key={account._id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 font-mono text-xs text-blue-600 bg-blue-50/10">{account.code}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{account.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          {account.accountGroup?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`font-bold text-base ${account.currentBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {formatCurrency(Math.abs(account.currentBalance))}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-gray-400">
                            {["ASSET", "EXPENSE"].includes(account.type) 
                              ? (account.currentBalance >= 0 ? "Debit" : "Credit") 
                              : (account.currentBalance >= 0 ? "Credit" : "Debit")}
                          </span>
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

      <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex gap-3 items-start">
        <Info className="w-5 h-5 text-blue-500 mt-0.5" />
        <p className="text-sm text-blue-700">
          <strong>Tip:</strong> Accounts are grouped by their nature (Asset, Liability, Equity, Revenue, Expense). This structure automatically generates your Balance Sheet and Profit & Loss statements.
        </p>
      </div>
    </div>
  );
}
