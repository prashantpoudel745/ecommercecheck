import { useState } from "react";
import { useAccounting } from "@/hooks/useAccounting";
import { CURRENCY_SYMBOL, formatCurrency } from "@/utils/formatCurrency";
import { recordPayment, Voucher } from "../../services/accounting.service";
import VoucherEntry from "./VoucherEntry";
import { 
  Plus, 
  X, 
  FileText, 
  DollarSign, 
  Eye, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Search
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
import { Badge } from "@/components/ui/badge";

export default function VoucherBook() {
  const { 
    vouchers, 
    accounts, 
    loading, 
    error, 
    refresh 
  } = useAccounting();

  const [showEntry, setShowEntry] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentVoucher, setPaymentVoucher] = useState<Voucher | null>(null);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentAccountId: "",
    narration: "",
    title: "",
    description: "",
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const openPaymentModal = (voucher: Voucher) => {
    setPaymentVoucher(voucher);
    setPaymentData({
      amount: voucher.amountDue || 0,
      paymentAccountId: "",
      narration: `Payment for ${voucher.voucherNumber}`,
      title: "",
      description: "",
    });
    setShowPaymentModal(true);
  };

  const handleRecordPayment = async () => {
    if (!paymentVoucher) return;
    if (!paymentData.paymentAccountId) return;

    setPaymentLoading(true);
    try {
      await recordPayment(paymentVoucher._id, {
        amount: paymentData.amount,
        paymentAccountId: paymentData.paymentAccountId,
        narration: paymentData.narration,
        title: paymentData.title,
        description: paymentData.description,
      });
      setShowPaymentModal(false);
      setPaymentVoucher(null);
      refresh();
    } catch (err: any) {
      // console.error(err);
    } finally {
      setPaymentLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-500 hover:bg-green-600 border-none">Paid</Badge>;
      case "PARTIAL":
        return <Badge className="bg-amber-500 hover:bg-amber-600 border-none">Partial</Badge>;
      case "UNPAID":
        return <Badge className="bg-rose-500 hover:bg-rose-600 border-none">Unpaid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const cashBankAccounts = accounts.filter(
    (a: any) => a?.accountGroup?.name?.toLowerCase().includes("cash") || 
                a?.accountGroup?.name?.toLowerCase().includes("bank") ||
                a?.name?.toLowerCase().includes("cash") ||
                a?.name?.toLowerCase().includes("bank")
  );

  const filteredVouchers = vouchers.filter(v => {
    const matchesSearch =
      v?.voucherNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v?.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v?.narration?.toLowerCase().includes(searchTerm.toLowerCase());
    const voucherStatus = v?.paymentStatus || "PAID";
    const matchesStatus = statusFilter === "ALL" || voucherStatus === statusFilter;
    return Boolean(matchesSearch && matchesStatus);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
            Voucher Book
          </h2>
          <p className="text-muted-foreground">Digital day book and transaction journal.</p>
        </div>
        <Button onClick={() => setShowEntry(true)} className="shadow-lg">
          <Plus className="w-4 h-4 mr-2" /> New Voucher
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search vouchers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-none shadow-sm focus-visible:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Status</option>
          <option value="PAID">Paid</option>
          <option value="PARTIAL">Partial</option>
          <option value="UNPAID">Unpaid</option>
        </select>
      </div>

      <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl transition-all duration-300">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Date</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Voucher No</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Party / Type</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-600">Amount</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                      Loading your financial history...
                    </td>
                  </tr>
                ) : filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                      No vouchers found.
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map((voucher) => (
                    <tr key={voucher._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-900 font-medium">
                            {new Date(voucher.date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          {voucher.voucherNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{voucher.partyName || "General"}</span>
                          <span className="text-[10px] uppercase text-gray-500 font-bold">{voucher.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {getStatusBadge(voucher.paymentStatus || "PAID")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-lg text-gray-900">
                           {CURRENCY_SYMBOL}{voucher.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedVoucher(voucher)}>
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                          {voucher.paymentStatus !== "PAID" && (
                            <Button variant="ghost" size="icon" onClick={() => openPaymentModal(voucher)}>
                              <DollarSign className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
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

      {/* New Voucher Modal */}
      {showEntry && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-none">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50">
              <CardTitle>Create Journal Entry / Voucher</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowEntry(false)}>
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="overflow-y-auto p-0">
              <VoucherEntry onVoucherAdded={() => { setShowEntry(false); refresh(); }} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Voucher Detail Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in zoom-in-95 duration-200">
          <Card className="w-full max-w-2xl shadow-2xl border-none">
            <CardHeader className="border-b bg-indigo-50/30">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold text-indigo-900">{selectedVoucher.voucherNumber}</CardTitle>
                  <CardDescription>{new Date(selectedVoucher.date).toDateString()} • {selectedVoucher.type}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedVoucher(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Total</p>
                  <p className="font-bold text-lg text-gray-900">{CURRENCY_SYMBOL}{selectedVoucher.totalAmount?.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl border border-green-100 text-center">
                  <p className="text-[10px] uppercase font-bold text-green-500 mb-1">Paid</p>
                  <p className="font-bold text-lg text-green-700">{CURRENCY_SYMBOL}{(selectedVoucher.amountPaid || 0).toFixed(2)}</p>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-center">
                  <p className="text-[10px] uppercase font-bold text-rose-500 mb-1">Due</p>
                  <p className="font-bold text-lg text-rose-700">{CURRENCY_SYMBOL}{(selectedVoucher.amountDue || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Ledger Distribution</h4>
                <div className="border rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left">Account</th>
                        <th className="px-4 py-2 text-right">Debit</th>
                        <th className="px-4 py-2 text-right">Credit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedVoucher.entries.map((entry, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3">
                            <span className="font-bold text-gray-800">
                              {typeof entry.account === 'object' ? (entry.account as any).name : entry.account}
                            </span>
                            <p className="text-[10px] text-gray-500 italic mt-0.5">{entry.description}</p>
                          </td>
                          <td className="px-4 py-3 text-right font-mono">
                            {entry.type === 'DEBIT' ? formatCurrency(entry.amount) : "-"}
                          </td>
                          <td className="px-4 py-3 text-right font-mono">
                            {entry.type === 'CREDIT' ? formatCurrency(entry.amount) : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedVoucher.narration && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 italic text-sm text-slate-700">
                  "{selectedVoucher.narration}"
                </div>
              )}
            </CardContent>
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50/50">
              <Button variant="outline" onClick={() => setSelectedVoucher(null)}>Close</Button>
              {selectedVoucher.paymentStatus !== "PAID" && (
                <Button onClick={() => { setSelectedVoucher(null); openPaymentModal(selectedVoucher); }} className="bg-green-600">
                  Record Payment
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Simplified Payment Modal */}
      {showPaymentModal && paymentVoucher && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl border-none">
            <CardHeader>
              <CardTitle>Record Payment</CardTitle>
              <CardDescription>Pay due amount for {paymentVoucher.voucherNumber}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-indigo-50/50 rounded-xl text-indigo-900 text-sm">
                <div className="flex justify-between font-bold"><span>Total Due:</span> <span>{CURRENCY_SYMBOL}{paymentVoucher.amountDue.toFixed(2)}</span></div>
              </div>
              <div className="space-y-2">
                <Label>Payment Amount</Label>
                <Input 
                  type="number" 
                  value={paymentData.amount} 
                  onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
                  max={paymentVoucher.amountDue}
                />
              </div>
              <div className="space-y-2">
                <Label>Pay to (Cash/Bank)</Label>
                <select
                  value={paymentData.paymentAccountId}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentAccountId: e.target.value })}
                  className="w-full border rounded-md p-2 h-10 text-sm"
                >
                  <option value="">Select Account</option>
                  {cashBankAccounts.map((acc: any) => (
                    <option key={acc._id} value={acc._id}>{acc.name} ({acc.code})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Title <span className="text-xs text-gray-400">(Optional)</span></Label>
                <Input 
                  placeholder="e.g. Quarterly Settlement" 
                  value={paymentData.title} 
                  onChange={(e) => setPaymentData({ ...paymentData, title: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Description <span className="text-xs text-gray-400">(Optional)</span></Label>
                <Input 
                  placeholder="e.g. Client settled via bank transfer" 
                  value={paymentData.description} 
                  onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Narration</Label>
                <Input value={paymentData.narration} onChange={(e) => setPaymentData({ ...paymentData, narration: e.target.value })} />
              </div>
            </CardContent>
            <div className="flex justify-end gap-3 p-6 pt-0">
              <Button variant="ghost" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
              <Button onClick={handleRecordPayment} disabled={paymentLoading || !paymentData.paymentAccountId} className="font-bold px-6">
                {paymentLoading ? "Saving..." : "Confirm & Pay Now"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
