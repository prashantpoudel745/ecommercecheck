import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPurchaseBills, convertPurchaseBillToPayment } from "@/services/purchase.service";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";
import { getAccounts } from "@/services/accounting.service";
import { formatCurrency } from "@/utils/formatCurrency";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { CurrencyUtil } from "@/utils/currency.util";
import { Account } from "../../../types/accounting.types";
import { toast } from "@/utils/notify";
export default function PurchaseBillsPage() {
  const queryClient = useQueryClient();

  const { data: response, isLoading: loading } = useQuery({
    queryKey: ["purchase", "bills"],
    queryFn: fetchPurchaseBills,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const data = (response?.data || []) as any[];

  const paymentMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => convertPurchaseBillToPayment(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.setQueryData<{ data: any[] }>(["purchase", "bills"], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((bill) => bill._id === id ? { ...bill, status: "PAID", amountPaid: bill.totalAmount, amountDue: 0 } : bill),
        };
      });
      toast.success("Successfully processed payment for this bill!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to process payment");
    },
  });

  // Payment Modal State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({
    amount: "0.00",
    paymentMethod: "CASH",
    paymentAccountId: "",
    transactionId: ""
  });
  const [paymentType, setPaymentType] = useState<"COMPLETE" | "PARTIAL">("COMPLETE");
  const [processing, setProcessing] = useState(false);

  const parseAmount = (value: any) => {
    if (value == null) return 0;
    if (typeof value === "object" && "$numberDecimal" in value) {
      return Number(value.$numberDecimal);
    }
    return Number(value) || 0;
  };

  const getBillDueAmount = (bill: any) => {
    if (!bill) return 0;
    if (bill.amountDue !== undefined && bill.amountDue !== null) {
      return parseAmount(bill.amountDue);
    }
    return CurrencyUtil.sub(parseAmount(bill.totalAmount), parseAmount(bill.amountPaid));
  };

  useEffect(() => {
    getAccounts()
      .then((res) => {
        const accountsList = Array.isArray(res) ? res : [];
        setAccounts(
          accountsList.filter((acc) => {
            const name = acc.name?.toLowerCase() || "";
            const groupName = typeof acc.accountGroup === "string"
              ? (acc.accountGroup || "").toLowerCase()
              : (acc.accountGroup?.name || "").toLowerCase();
            return (
              acc.type === "ASSET" &&
              (name.includes("cash") || name.includes("bank") || groupName.includes("cash") || groupName.includes("bank"))
            );
          })
        );
      })
      .catch(console.error);
  }, []);

  const openPaymentModal = (bill: any) => {
    setSelectedBill(bill);
    setPaymentType("COMPLETE");

    const defaultAcc = accounts.length > 0 ? accounts[0]._id : "";
    const dueAmount = getBillDueAmount(bill);
    const formattedDue = CurrencyUtil.format(dueAmount);

    setPaymentData({
      amount: formattedDue,
      paymentMethod: "CASH",
      paymentAccountId: defaultAcc,
      transactionId: ""
    });
    setShowPaymentModal(true);
  };

  const submitPayment = async () => {
    if (!selectedBill) return;
    if (!paymentData.paymentAccountId) {
      toast.error("Please select a payment account");
      return;
    }
    
    setProcessing(true);
    try {
      await paymentMutation.mutateAsync({
        id: selectedBill._id,
        payload: {
          ...paymentData,
          amount: CurrencyUtil.format(paymentData.amount),
        },
      });
      setShowPaymentModal(false);
    } catch (err: any) {
      // handled in mutation error
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-3">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Purchase Bills</h1>
          <p className="text-xs sm:text-sm text-slate-500">Manage invoices and bills from your suppliers</p>
        </div>
        <Link to="/purchase/bills/new">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2">
            <Plus size={16} />
            Record Bill
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Bill Number</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Supplier Name</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Bill Date</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Due Date</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Total Amount</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Amount Paid</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Amount Due</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4">Status</th>
                <th className="px-3 py-3 sm:px-4 sm:py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-4 text-center text-slate-400">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-4 text-center text-slate-400">No purchase bills found.</td></tr>
              ) : (
                data.map((item) => {
                  const it = item as Record<string, unknown>;
                  const totalAmount = parseAmount(it['totalAmount']);
                  const amountPaid = parseAmount(it['amountPaid']);
                  const amountDue = it['amountDue'] !== undefined && it['amountDue'] !== null
                    ? parseAmount(it['amountDue'])
                    : CurrencyUtil.sub(totalAmount, amountPaid);
                  const isPaid = (it['status'] as string) === "PAID" || Number((amountDue as unknown as number) || 0) <= 0;

                  const key = String(it['_id'] ?? Math.random().toString(36).slice(2, 9));
                  const billNumberDisplay = String(it['billNumber'] ?? "");
                  const supplierNameDisplay = String(it['supplierName'] ?? "");
                  const supplierContact = (it['supplierEmail'] || it['supplierPhone']) ? `${it['supplierEmail'] ?? ""}${it['supplierEmail'] && it['supplierPhone'] ? " • " : ""}${it['supplierPhone'] ?? ""}` : "";

                  const billDateVal = it['billDate'] ?? it['createdAt'];
                  const billDateStr = billDateVal ? new Date(String(billDateVal)).toLocaleDateString() : "-";
                  const dueDateStr = it['dueDate'] ? new Date(String(it['dueDate'])).toLocaleDateString() : "-";

                  return (
                    <tr key={key} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 font-medium text-slate-900">{billNumberDisplay}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-4">
                        <div className="font-medium text-slate-900">{supplierNameDisplay}</div>
                        <div className="text-xs text-slate-500">{supplierContact}</div>
                      </td>
                      <td className="px-3 py-3 sm:px-4 sm:py-4">{billDateStr}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-4">{dueDateStr}</td>
                      <td className="px-4 py-4 font-medium">{formatCurrency(totalAmount)}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-4 text-emerald-600">{formatCurrency(amountPaid)}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-4 text-red-500 font-medium">{formatCurrency(amountDue)}</td>
                      <td className="px-3 py-3 sm:px-4 sm:py-4">
                        {isPaid ? (
                          <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-700">Paid</span>
                        ) : (
                          <span className="text-xs font-medium px-2 py-1 rounded bg-amber-100 text-amber-700">Purchase Bill</span>
                        )}
                      </td>
                      <td className="px-3 py-3 sm:px-4 sm:py-4 flex gap-2 justify-center items-center">
                        {!isPaid && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-200 hover:bg-green-50 h-8 px-2"
                            onClick={() => openPaymentModal(it)}
                            title="Process Payment"
                          >
                            <ArrowRight className="w-3 h-3 mr-1" /> Pay Bill
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Record a payment for Bill {selectedBill ? String((selectedBill as Record<string, unknown>)['billNumber'] ?? "") : ""}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center border border-slate-100">
              <div>
                <p className="text-sm text-slate-500">Total Bill Amount</p>
                <p className="font-semibold text-slate-700">{formatCurrency(parseAmount(selectedBill?.totalAmount))}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-amber-600 font-medium">Due Amount</p>
                <p className="font-bold text-amber-700 text-lg">{formatCurrency(getBillDueAmount(selectedBill))}</p>
              </div>
            </div>

            <div className="flex gap-4 mb-2">
              <Button 
                type="button"
                variant={paymentType === "COMPLETE" ? "default" : "outline"}
                className={paymentType === "COMPLETE" ? "w-1/2 bg-emerald-500 hover:bg-emerald-600" : "w-1/2"}
                onClick={() => {
                  setPaymentType("COMPLETE");
                  const due = selectedBill?.dueAmount !== undefined && selectedBill?.dueAmount !== null
                    ? parseAmount(selectedBill.dueAmount)
                    : CurrencyUtil.sub(parseAmount(selectedBill?.totalAmount), parseAmount(selectedBill?.amountPaid));
                  setPaymentData({...paymentData, amount: CurrencyUtil.format(due)});
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
                <Label>Currently Paying Amount</Label>
                <Input 
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentType === "COMPLETE" ? CurrencyUtil.format(getBillDueAmount(selectedBill)) : paymentData.amount}
                  disabled={paymentType === "COMPLETE"}
                  onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select 
                  value={paymentData.paymentMethod} 
                  onValueChange={(val) => setPaymentData({...paymentData, paymentMethod: val})}
                >
                  <SelectTrigger><SelectValue placeholder="Select Method" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="DIGITAL_WALLET">Digital Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pay From (Account)</Label>
                <Select 
                  value={paymentData.paymentAccountId} 
                  onValueChange={(val) => setPaymentData({...paymentData, paymentAccountId: val})}
                >
                  <SelectTrigger><SelectValue placeholder="Select Account" /></SelectTrigger>
                  <SelectContent>
                    {accounts.map(acc => (
                      <SelectItem key={acc._id} value={acc._id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Transaction ID (Optional)</Label>
                <Input 
                  placeholder="e.g. TXN-987654321" 
                  value={paymentData.transactionId}
                  onChange={(e) => setPaymentData({...paymentData, transactionId: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)} disabled={processing}>Cancel</Button>
            <Button onClick={submitPayment} disabled={processing} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              {processing ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
