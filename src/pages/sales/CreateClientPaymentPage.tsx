import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import { convertInvoiceToPayment, fetchInvoiceById } from "@/services/sales.service";
import { getAccounts } from "@/services/accounting.service";
import { formatCurrency } from "@/utils/formatCurrency";

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
  const [accounts, setAccounts] = useState<any[]>([]);
  const [paymentType, setPaymentType] = useState<"COMPLETE" | "PARTIAL">("COMPLETE");
  const [formData, setFormData] = useState<any>({ paymentMethod: "BANK_TRANSFER", amount: "0.00" });

  useEffect(() => {
    getAccounts()
      .then((data) => {
        const accountsList = Array.isArray(data) ? data : [];
        setAccounts(accountsList);
      })
      .catch(() => setAccounts([]));
  }, []);

  useEffect(() => {
    const loadInvoice = async () => {
      if (!invoiceId) return;
      try {
        const response = await fetchInvoiceById(invoiceId);
        setInvoice(response.data || response.invoice || null);
      } catch (error) {
        toast.error("Unable to load invoice details.");
      } finally {
        setInvoiceLoading(false);
      }
    };

    loadInvoice();
  }, [invoiceId]);

  const cashBankAccounts = useMemo(
    () =>
      accounts.filter((account) => {
        const groupName = account.accountGroup?.name?.toLowerCase?.() || "";
        const accountName = account.name?.toLowerCase?.() || "";
        return (
          account.type === "ASSET" &&
          (groupName.includes("cash") ||
            groupName.includes("bank") ||
            accountName.includes("cash") ||
            accountName.includes("bank"))
        );
      }),
    [accounts]
  );

  useEffect(() => {
    if (!invoice) return;
    const dueAmount = parseMoney(invoice.amountDue ?? invoice.totalAmount ?? 0);
    const defaultAccount = cashBankAccounts[0]?._id || "";
    setFormData((prev: any) => ({
      ...prev,
      customerName: invoice.customerName || prev.customerName || "",
      customerPhone: invoice.customerPhone || invoice.phone || prev.customerPhone || "",
      amount: dueAmount > 0 ? dueAmount.toFixed(2) : "0.00",
      paymentAccountId: prev.paymentAccountId || defaultAccount,
    }));
    setPaymentType(dueAmount > 0 ? "COMPLETE" : "PARTIAL");
  }, [invoice, cashBankAccounts]);

  const dueAmount = parseMoney(invoice?.amountDue ?? 0);
  const totalAmount = parseMoney(invoice?.totalAmount ?? 0);
  const paidAmount = parseMoney(invoice?.amountPaid ?? 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentTypeChange = (nextType: "COMPLETE" | "PARTIAL") => {
    setPaymentType(nextType);
    if (nextType === "COMPLETE") {
      setFormData((prev: any) => ({ ...prev, amount: dueAmount > 0 ? dueAmount.toFixed(2) : prev.amount }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice?._id) {
      toast.error("Select an invoice first.");
      return;
    }
    if (!formData.paymentAccountId) {
      toast.error("Please select a payment account.");
      return;
    }

    setLoading(true);
    try {
      const amount = paymentType === "COMPLETE" ? dueAmount : Number(formData.amount || 0);
      await convertInvoiceToPayment(invoice._id, {
        ...formData,
        amount,
        customerPhone: formData.customerPhone || invoice.customerPhone || invoice.phone || "",
      });
      toast.success("Invoice payment recorded successfully!");
      navigate("/sales/invoice");
    } catch (error: any) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (invoiceLoading) {
    return <div className="p-4 max-w-5xl mx-auto w-full text-slate-500">Loading invoice...</div>;
  }

  return (
    <div className="p-4 sm:p-4 max-w-5xl mx-auto w-full">
      <div className="mb-3 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 p-5 shadow-sm">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Client Payment</h1>
        <p className="text-slate-500 mt-1">Settle this invoice partially or in full.</p>
      </div>

      {invoice ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-7 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 rounded-xl border border-slate-100 p-4">
            <div>
              <p className="text-xs text-slate-500">Invoice</p>
              <p className="font-semibold text-slate-900">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Customer</p>
              <p className="font-semibold text-slate-900">{invoice.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Outstanding Due</p>
              <p className="font-semibold text-amber-700">{formatCurrency(dueAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total</p>
              <p className="font-semibold text-slate-900">{formatCurrency(totalAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Already Paid</p>
              <p className="font-semibold text-emerald-700">{formatCurrency(paidAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Status</p>
              <p className="font-semibold text-slate-900 uppercase">{invoice.paymentStatus || "due"}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Payment Type</label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={paymentType === "COMPLETE" ? "default" : "outline"}
                    className={paymentType === "COMPLETE" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                    onClick={() => handlePaymentTypeChange("COMPLETE")}
                  >
                    Pay in Full
                  </Button>
                  <Button
                    type="button"
                    variant={paymentType === "PARTIAL" ? "default" : "outline"}
                    className={paymentType === "PARTIAL" ? "bg-amber-500 hover:bg-amber-600" : ""}
                    onClick={() => handlePaymentTypeChange("PARTIAL")}
                  >
                    Partial Pay
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Amount</label>
                <input
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentType === "COMPLETE" ? dueAmount.toFixed(2) : formData.amount}
                  onChange={handleInputChange}
                  disabled={paymentType === "COMPLETE"}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Payment Method</label>
                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100">
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CARD">Credit/Debit Card</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Deposit To</label>
                <select
                  name="paymentAccountId"
                  value={formData.paymentAccountId || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="" disabled>Select cash/bank account</option>
                  {cashBankAccounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.name} {account.code ? `(${account.code})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Payment Reference</label>
                <input name="paymentReference" onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" placeholder="e.g. Transaction ID" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Notes</label>
                <input name="notes" onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100" placeholder="Optional payment note" />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
              <Button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[140px]">
                {loading ? "Saving..." : "Save Payment"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/sales/invoice")}>Cancel</Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-slate-500">
          No invoice was selected. Return to the invoice list and choose <span className="font-medium text-slate-700">To Pay</span> for a due invoice.
        </div>
      )}
    </div>
  );
}