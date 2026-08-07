import { useState } from "react";
import { useAccounting } from "@/hooks/useAccounting";
import { CurrencyUtil } from "@/utils/currency.util";
import { recordPayment, sendInvoice, approveVoucher, deleteVoucher } from "../../services/accounting.service";
import { Voucher } from "../../../types/accounting.types";
import VoucherEntry from "./VoucherEntry";
import { 
  Plus, 
  X, 
  DollarSign, 
  Eye, 
  Calendar,
  Search,
  Mail,
  Loader2,
  CheckCircle,
  XCircle,
  Undo2
} from "lucide-react";
import { toast } from "@/utils/notify";
import { EmailConfirmationDialog } from "@/components/common/EmailConfirmationDialog";
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
import { CURRENCY_SYMBOL } from "@/utils/formatCurrency";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "../ui/dialog";

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
    paymentMethod: "Cash",
    paymentAccountId: "",
    transactionId: "",
    narration: "",
    title: "",
    description: "",
  });
  const [paymentType, setPaymentType] = useState<"COMPLETE" | "PARTIAL">("COMPLETE");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("ALL");
  const [sendingInvoice, setSendingInvoice] = useState(false);
  const [emailConfirmData, setEmailConfirmData] = useState<{ id: string; email: string; name: string } | null>(null);

  const handleSendInvoice = async (id: string, email: string) => {
    if (!email) {
      const emailPrompt = prompt("Enter client email address to send invoice:");
      if (!emailPrompt) return;
      email = emailPrompt;
    }

    setSendingInvoice(true);
    try {
      await sendInvoice(id, { email: email, currencySymbol: CURRENCY_SYMBOL });
      toast.success("Invoice generated and sent successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send invoice");
    } finally {
      setSendingInvoice(false);
      setEmailConfirmData(null);
    }
  };

  const openPaymentModal = (voucher: Voucher) => {
    setPaymentVoucher(voucher);
    setPaymentType("COMPLETE");
    
    const cashAcc = accounts.find(a => a.type === "ASSET" && /Cash|Bank/i.test(a.name));
    
    setPaymentData({
      amount: Number(voucher.amountDue) || 0,
      paymentMethod: "Cash",
      paymentAccountId: cashAcc ? cashAcc._id : "",
      transactionId: "",
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
        paymentMethod: paymentData.paymentMethod,
        transactionId: paymentData.transactionId,
        narration: paymentData.narration,
        title: paymentData.title,
        description: paymentData.description,
      });
      setShowPaymentModal(false);
      setPaymentVoucher(null);
      refresh();
    } catch (err) {
      // console.error(err);
    } finally {
      setPaymentLoading(false);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
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

  const getDocStatusBadge = (status: string) => {
    switch (status) {
      case "POSTED":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none">POSTED</Badge>;
      case "DRAFT":
        return <Badge className="bg-slate-500 hover:bg-slate-600 border-none">DRAFT</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-500 hover:bg-red-600 border-none">CANCELLED</Badge>;
      default:
        return <Badge variant="secondary">{status || "POSTED"}</Badge>;
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveVoucher(id);
      toast.success("Voucher Approved and Posted!");
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve voucher");
    }
  };

  const handleCancel = async (id: string, status: string) => {
    const isDraft = status === "DRAFT";
    const msg = isDraft 
      ? "Are you sure you want to reject and delete this drafted voucher?"
      : "Are you sure? Cancelling a posted voucher will generate a reversing journal entry.";
    
    if (!confirm(msg)) return;
    
    try {
      await deleteVoucher(id);
      toast.success(isDraft ? "Draft rejected successfully" : "Voucher cancelled successfully");
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel voucher");
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
    
    let matchesTab = true;
    if (activeTab === "RECEIVABLE") {
      matchesTab = v.type === "SALES" || v.type === "RECEIPT";
    } else if (activeTab === "PAYABLE") {
      matchesTab = v.type === "PURCHASE" || v.type === "PAYMENT" || v.type === "EXPENSE";
    }

    return Boolean(matchesSearch && matchesStatus && matchesTab);
  });

  return (
    <div className="space-y-6">
      <EmailConfirmationDialog
        isOpen={!!emailConfirmData}
        onOpenChange={(open) => !open && !sendingInvoice && setEmailConfirmData(null)}
        customerName={emailConfirmData?.name || ""}
        isProcessing={sendingInvoice}
        onConfirm={() => emailConfirmData && handleSendInvoice(emailConfirmData.id, emailConfirmData.email)}
      />
      {/* STICKY HEADER GROUP: title, new voucher button, search, status filter */}
      <div className="sticky -top-6 z-30 bg-gray-50/95 backdrop-blur-md pt-1 pb-4 space-y-4 border-b border-gray-100">
        <div className=" mx-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="mx-4">
            <h2 className="text-3xl font-bold tracking-tight bg-black bg-clip-text text-transparent">
              Voucher Book
            </h2>
            <p className="text-muted-foreground">Digital day book and transaction journal.</p>
          </div>
          <Button onClick={() => setShowEntry(true)} className="shadow-lg bg-emerald-500 hover:bg-emerald-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> New Voucher
          </Button>
        </div>

        <div className="flex space-x-1 border-b border-gray-200 mx-4">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`py-2 px-4 text-sm font-medium border-b-2 outline-none transition-colors ${
              activeTab === "ALL"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            All Vouchers
          </button>
          <button
            onClick={() => setActiveTab("RECEIVABLE")}
            className={`py-2 px-4 text-sm font-medium border-b-2 outline-none transition-colors ${
              activeTab === "RECEIVABLE"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Receivables (Clients)
          </button>
          <button
            onClick={() => setActiveTab("PAYABLE")}
            className={`py-2 px-4 text-sm font-medium border-b-2 outline-none transition-colors ${
              activeTab === "PAYABLE"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Payables (Suppliers)
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mx-4">
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
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Doc Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600">Payment</th>
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
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          onClick={() => openPaymentModal(voucher)}
                          title="Record Payment"
                        >
                          <DollarSign className="w-3.5 h-3.5 mr-1" />
                          Pay
                        </Button>
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
                        {getDocStatusBadge(voucher.status)}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {getPaymentStatusBadge(voucher.paymentStatus || "PAID")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-lg text-gray-900">
                           {CURRENCY_SYMBOL}{CurrencyUtil.format(voucher.totalAmount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedVoucher(voucher)}>
                            <Eye className="w-4 h-4 text-blue-600" title="View" />
                          </Button>
                          {voucher.status === "DRAFT" && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => handleApprove(voucher._id)}>
                                <CheckCircle className="w-4 h-4 text-emerald-600" title="Approve & Post" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleCancel(voucher._id, voucher.status)}>
                                <XCircle className="w-4 h-4 text-rose-600" title="Reject Draft" />
                              </Button>
                            </>
                          )}
                          {voucher.status === "POSTED" && (
                            <Button variant="ghost" size="icon" onClick={() => handleCancel(voucher._id, voucher.status)}>
                              <Undo2 className="w-4 h-4 text-rose-600" title="Reverse Voucher" />
                            </Button>
                          )}
                          {voucher.paymentStatus !== "PAID" && voucher.status === "POSTED" && (
                            <Button variant="ghost" size="icon" onClick={() => openPaymentModal(voucher)}>
                              <DollarSign className="w-4 h-4 text-green-600" title="Record Payment" />
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
                  <p className="font-bold text-lg text-gray-900">{CURRENCY_SYMBOL}{CurrencyUtil.format(selectedVoucher.totalAmount)}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl border border-green-100 text-center">
                  <p className="text-[10px] uppercase font-bold text-green-500 mb-1">Paid</p>
                  <p className="font-bold text-lg text-green-700">{CURRENCY_SYMBOL}{CurrencyUtil.format(selectedVoucher.amountPaid)}</p>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-center">
                  <p className="text-[10px] uppercase font-bold text-rose-500 mb-1">Due</p>
                  <p className="font-bold text-lg text-rose-700">{CURRENCY_SYMBOL}{CurrencyUtil.format(selectedVoucher.amountDue)}</p>
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
                              {typeof entry.account === 'object' ? entry.account.name : entry.account}
                            </span>
                            <p className="text-[10px] text-gray-500 italic mt-0.5">{entry.description}</p>
                          </td>
                          <td className="px-4 py-3 text-right font-mono">
                            {entry.type === 'DEBIT' ? CurrencyUtil.format(entry.amount) : "-"}
                          </td>
                          <td className="px-4 py-3 text-right font-mono">
                            {entry.type === 'CREDIT' ? CurrencyUtil.format(entry.amount) : "-"}
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
              {selectedVoucher.type === "SALES" && (
                <Button 
                  variant="secondary" 
                  onClick={() => setEmailConfirmData({ id: selectedVoucher._id, email: selectedVoucher.partyName?.split(" (")[1]?.replace(")", "") || "", name: selectedVoucher.partyName || "Client" })}
                  disabled={sendingInvoice}
                  className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                >
                  {sendingInvoice ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                  {sendingInvoice ? "Sending..." : "Email Invoice"}
                </Button>
              )}
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
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for {paymentVoucher?.partyName} (Voucher {paymentVoucher?.voucherNumber})
            </DialogDescription>
          </DialogHeader>
          
          {paymentVoucher && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-indigo-50/50 rounded-xl text-indigo-900 text-sm">
                <div className="flex justify-between font-bold">
                  <span>Total Due:</span> 
                  <span>{CURRENCY_SYMBOL}{CurrencyUtil.format(paymentVoucher.amountDue)}</span>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="flex gap-4">
                  <Button 
                    type="button"
                    variant={paymentType === "COMPLETE" ? "default" : "outline"}
                    className={paymentType === "COMPLETE" ? "w-1/2 bg-emerald-500 hover:bg-emerald-600" : "w-1/2"}
                    onClick={() => {
                      setPaymentType("COMPLETE");
                      setPaymentData({...paymentData, amount: Number(paymentVoucher?.amountDue) || 0});
                    }}
                  >
                    Complete Pay
                  </Button>
                  <Button 
                    type="button"
                    variant={paymentType === "PARTIAL" ? "default" : "outline"}
                    className={paymentType === "PARTIAL" ? "w-1/2 bg-amber-500 hover:bg-amber-600" : "w-1/2"}
                    onClick={() => setPaymentType("PARTIAL")}
                  >
                    Partial Pay
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      disabled={paymentType === "COMPLETE"}
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({...paymentData, amount: Number(e.target.value)})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Method</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={paymentData.paymentMethod}
                      onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Digital Wallet">Digital Wallet</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account">Pay From/To</Label>
                    <select
                      id="account"
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={paymentData.paymentAccountId}
                      onChange={(e) => setPaymentData({...paymentData, paymentAccountId: e.target.value})}
                    >
                      <option value="">Select Account</option>
                      {cashBankAccounts.map((a: any) => (
                        <option key={a._id} value={a._id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="transactionId">Tx ID (Optional)</Label>
                    <Input
                      id="transactionId"
                      placeholder="e.g. TXN-12345"
                      value={paymentData.transactionId}
                      onChange={(e) => setPaymentData({...paymentData, transactionId: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="narration">Narration / Remarks</Label>
                    <Input
                      id="narration"
                      value={paymentData.narration}
                      onChange={(e) => setPaymentData({...paymentData, narration: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
            <Button onClick={handleRecordPayment} disabled={paymentLoading || !paymentData.paymentAccountId} className="font-bold px-6">
              {paymentLoading ? "Saving..." : "Confirm & Pay Now"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}