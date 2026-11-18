import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import { convertInvoiceToPayment, createCustomerPayment, fetchInvoiceById } from "@/services/sales.service";
import { getAccountGroups, getAccounts } from "@/services/accounting.service";
import { formatCurrency } from "@/utils/formatCurrency";
import type { Account, AccountGroup } from "../../../types/accounting.types";
import { Building2, DollarSign, Wallet } from "lucide-react";

const parseMoney = (value: any) => {
  if (value == null) return 0;
  if (typeof value === "object" && "$numberDecimal" in value) {
    return Number(value.$numberDecimal) || 0;
  }
  return Number(value) || 0;
};

export default function CreateClientPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get("invoiceId") || "";

  const [loading, setLoading] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(Boolean(invoiceId));
  const [invoice, setInvoice] = useState<any>(location.state?.invoice || null);

  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [paymentType, setPaymentType] = useState<"COMPLETE" | "PARTIAL">("COMPLETE");
  const [formData, setFormData] = useState<any>({
    paymentMethod: "BANK_TRANSFER",
    amount: "0.00",
    paymentAccountId: "",
    customerName: "",
    customerPhone: "",
    paymentReference: "",
    notes: "",
  });

  // 1. Load account groups
  useEffect(() => {
    getAccountGroups()
      .then((data) => {
        const groupsList = Array.isArray(data) ? data : [];
        setGroups(groupsList);
        // Default to Bank Accounts or Cash-in-Hand group if available
        const defaultGrp = groupsList.find((g: any) => /bank|cash/i.test(g.name));
        if (defaultGrp) {
          setSelectedGroupId(defaultGrp._id);
        }
      })
      .catch(() => setGroups([]));
  }, []);

  // 2. Load all ledger accounts
  useEffect(() => {
    getAccounts()
      .then((data) => {
        const accountsList = Array.isArray(data) ? data : [];
        setAccounts(accountsList);
      })
      .catch(() => setAccounts([]));
  }, []);

  // 3. Load invoice if invoiceId param is present
  useEffect(() => {
    const loadInvoice = async () => {
      if (!invoiceId) return;
      try {
        const response = await fetchInvoiceById(invoiceId);
        setInvoice(response.data || response.invoice || null);
      } catch {
        toast.error("Unable to load invoice details.");
      } finally {
        setInvoiceLoading(false);
      }
    };

    loadInvoice();
  }, [invoiceId]);

  // Filtered ledgers based on the selected account group
  const filteredLedgers = useMemo(() => {
    if (!selectedGroupId) return accounts;
    return accounts.filter((account) => {
      const grpId = typeof account.accountGroup === "object" ? account.accountGroup?._id : account.accountGroup;
      return String(grpId) === String(selectedGroupId);
    });
  }, [accounts, selectedGroupId]);

  // Auto-select first ledger in the filtered group if current paymentAccountId is not in filtered list
  useEffect(() => {
    if (filteredLedgers.length > 0) {
      const exists = filteredLedgers.some((a) => String(a._id) === String(formData.paymentAccountId));
      if (!exists) {
        setFormData((prev: any) => ({ ...prev, paymentAccountId: filteredLedgers[0]._id }));
      }
    }
  }, [filteredLedgers, formData.paymentAccountId]);

  // Sync state when invoice loads
  useEffect(() => {
    if (invoice) {
      const due = parseMoney(invoice.amountDue ?? invoice.totalAmount ?? 0);
      setFormData((prev: any) => ({
        ...prev,
        customerName: invoice.customerName || prev.customerName || "",
        customerPhone: invoice.customerPhone || invoice.phone || prev.customerPhone || "",
        amount: due > 0 ? due.toFixed(2) : prev.amount || "0.00",
      }));
      setPaymentType(due > 0 ? "COMPLETE" : "PARTIAL");
    }
  }, [invoice]);

  const dueAmount = invoice ? parseMoney(invoice?.amountDue ?? 0) : 0;
  const totalAmount = invoice ? parseMoney(invoice?.totalAmount ?? 0) : 0;
  const paidAmount = invoice ? parseMoney(invoice?.amountPaid ?? 0) : 0;

  // Handle group change: updates selected group and resets / re-points paymentAccountId
  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
    const ledgersInGroup = accounts.filter((a) => {
      const grpId = typeof a.accountGroup === "object" ? a.accountGroup?._id : a.accountGroup;
      return String(grpId) === String(groupId);
    });
    setFormData((prev: any) => ({
      ...prev,
      paymentAccountId: ledgersInGroup[0]?._id || "",
    }));
  };

  // Handle ledger change: updates paymentAccountId (the selected ledger account used for payment)
  const handleLedgerChange = (ledgerId: string) => {
    setFormData((prev: any) => ({
      ...prev,
      paymentAccountId: ledgerId,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentTypeChange = (nextType: "COMPLETE" | "PARTIAL") => {
    setPaymentType(nextType);
    if (nextType === "COMPLETE" && dueAmount > 0) {
      setFormData((prev: any) => ({ ...prev, amount: dueAmount.toFixed(2) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.paymentAccountId) {
      toast.error("Please select a ledger account for this payment.");
      return;
    }

    if (!invoice?._id && !formData.customerName) {
      toast.error("Please provide the customer or party name.");
      return;
    }

    const payAmount = paymentType === "COMPLETE" && dueAmount > 0 ? dueAmount : Number(formData.amount || 0);
    if (!payAmount || payAmount <= 0) {
      toast.error("Please enter a valid payment amount greater than zero.");
      return;
    }

    setLoading(true);
    try {
      if (invoice?._id) {
        // 1. Settle specific invoice with the selected ledger account
        await convertInvoiceToPayment(invoice._id, {
          ...formData,
          amount: payAmount,
          customerPhone: formData.customerPhone || invoice.customerPhone || invoice.phone || "",
        });
        toast.success("Invoice payment recorded successfully!");
        navigate("/sales/invoice");
      } else {
        // 2. Direct client / party payment using the selected ledger account
        const targetParty = formData.customerName;
        await createCustomerPayment({
          ...formData,
          customerName: targetParty,
          amount: payAmount,
        });
        toast.success(`Client payment for ${targetParty} recorded successfully!`);
        navigate("/sales/customer-payment");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  if (invoiceLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto w-full text-slate-500 text-center">
        Loading invoice details...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-5">
      {/* Page Header */}
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-sm">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Client Payment</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Record an incoming party payment and update your ledger receivables.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-7 space-y-6">
        {/* INVOICE SUMMARY BANNER (if an invoice is selected) */}
        {invoice && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-slate-50 rounded-xl border border-slate-100 p-4 text-xs">
            <div>
              <p className="text-slate-500">Invoice No</p>
              <p className="font-bold text-slate-900 mt-0.5">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-slate-500">Customer</p>
              <p className="font-bold text-slate-900 mt-0.5 truncate">{invoice.customerName}</p>
            </div>
            <div>
              <p className="text-slate-500">Outstanding Due</p>
              <p className="font-bold text-amber-700 mt-0.5">{formatCurrency(dueAmount)}</p>
            </div>
            <div>
              <p className="text-slate-500">Total Amount</p>
              <p className="font-bold text-slate-900 mt-0.5">{formatCurrency(totalAmount)}</p>
            </div>
            <div>
              <p className="text-slate-500">Already Paid</p>
              <p className="font-bold text-emerald-700 mt-0.5">{formatCurrency(paidAmount)}</p>
            </div>
            <div>
              <p className="text-slate-500">Invoice Status</p>
              <span className="inline-block mt-0.5 font-bold uppercase text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                {invoice.paymentStatus || "due"}
              </span>
            </div>
          </div>
        )}

        {/* PAYMENT FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Payment Type */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Payment Type</label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={paymentType === "COMPLETE" ? "default" : "outline"}
                  className={paymentType === "COMPLETE" ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex-1" : "flex-1"}
                  onClick={() => handlePaymentTypeChange("COMPLETE")}
                >
                  Pay in Full {dueAmount > 0 ? `(${formatCurrency(dueAmount)})` : ""}
                </Button>
                <Button
                  type="button"
                  variant={paymentType === "PARTIAL" ? "default" : "outline"}
                  className={paymentType === "PARTIAL" ? "bg-amber-600 hover:bg-amber-700 text-white font-bold flex-1" : "flex-1"}
                  onClick={() => handlePaymentTypeChange("PARTIAL")}
                >
                  Partial Pay
                </Button>
              </div>
            </div>

            {/* 2. Amount */}
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-semibold text-slate-700">
                Payment Amount (NPR) <span className="text-rose-500">*</span>
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={paymentType === "COMPLETE" && dueAmount > 0 ? dueAmount.toFixed(2) : formData.amount}
                onChange={handleInputChange}
                disabled={paymentType === "COMPLETE" && dueAmount > 0}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-base shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
              />
            </div>

            {/* 3. Payment Method */}
            <div className="space-y-2">
              <label htmlFor="paymentMethod" className="text-sm font-semibold text-slate-700">Payment Method</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
              >
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash in Hand</option>
                <option value="CHEQUE">Cheque</option>
                <option value="DIGITAL_WALLET">Digital Wallet (eSewa / Khalti)</option>
                <option value="CARD">Credit / Debit Card</option>
              </select>
            </div>

            {/* 4. Select Group (AFTER Payment Method) */}
            <div className="space-y-2">
              <label htmlFor="select-group" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Select Group <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-group"
                value={selectedGroupId}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
              >
                <option value="">-- All Account Groups ({groups.length}) --</option>
                {groups.map((grp) => (
                  <option key={grp._id} value={grp._id}>
                    {grp.name} ({grp.nature})
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Select Ledger Account (USED INSTEAD OF Deposit Into FIELD) */}
            <div className="space-y-2">
              <label htmlFor="select-ledger" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-600" />
                Select Ledger Account <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-ledger"
                name="paymentAccountId"
                required
                value={formData.paymentAccountId || ""}
                onChange={(e) => handleLedgerChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
              >
                <option value="" disabled>
                  {selectedGroupId
                    ? `-- Select Ledger in ${groups.find((g) => g._id === selectedGroupId)?.name || "Group"} (${filteredLedgers.length}) --`
                    : `-- Select Ledger Account (${filteredLedgers.length}) --`}
                </option>
                {filteredLedgers.map((acc) => {
                  const bal = parseMoney(acc.currentBalance);
                  return (
                    <option key={acc._id} value={acc._id}>
                      {acc.name} ({acc.code || "No Code"}) {bal !== 0 ? `· Bal: NPR ${bal.toFixed(2)}` : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 6. Customer / Party Name (if no pre-selected invoice) */}
            {!invoice && (
              <div className="space-y-2">
                <label htmlFor="customerName" className="text-sm font-semibold text-slate-700">
                  Customer / Party Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="customerName"
                  name="customerName"
                  required
                  value={formData.customerName || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  placeholder="e.g. Acme Corp or Customer Name"
                />
              </div>
            )}

            {/* 7. Payment Reference */}
            <div className="space-y-2">
              <label htmlFor="paymentReference" className="text-sm font-semibold text-slate-700">Payment Reference / Tx ID</label>
              <input
                id="paymentReference"
                name="paymentReference"
                value={formData.paymentReference || ""}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                placeholder="e.g. Cheque # or Bank Txn ID"
              />
            </div>

            {/* 8. Remarks / Notes */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="notes" className="text-sm font-semibold text-slate-700">Remarks / Notes</label>
              <input
                id="notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                placeholder="Optional notes for this payment"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
            <Button
              type="submit"
              disabled={loading || !formData.paymentAccountId || (!invoice?._id && !formData.customerName)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 h-11"
            >
              {loading ? "Recording Payment..." : "Record Payment Now"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => navigate(invoice ? "/sales/invoice" : "/sales/customer-payment")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
