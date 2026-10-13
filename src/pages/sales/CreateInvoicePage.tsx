import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import { createInvoice } from "@/services/sales.service";
import api from "@/utils/api";
import { Plus, Trash2, Lock, ShieldCheck, Calendar, CheckCircle2 } from "lucide-react";
import { CURRENCY_SYMBOL, formatCurrency } from "@/utils/formatCurrency";
import { formatCurrencyValue } from "@/functions/formatcurrencyvalue";
import { fetchInventoryItem } from "@/hooks/fetchInventoryItems";

type InvoiceItem = {
  itemName: string;
  quantity: number | string;
  price: number | string;
  amount: number | string;
  vatExempt?: boolean;
};

type InventoryItem = {
  _id: string;
  name: string;
  quantity: number;
  sellingPrice: number | string;
  price?: number | string;
};

type SalesOrderItem = {
  itemName?: string;
  quantity?: number;
  price?: { _bsontype?: string; toString?: () => string } | number | string;
  amount?: { _bsontype?: string; toString?: () => string } | number | string;
};

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const sourceSalesOrder = location.state?.sourceSalesOrder;
  const FIXED_VAT_RATE = 13;

  const [loading, setLoading] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [taxRate] = useState(FIXED_VAT_RATE);
  const [taxIncluded, setTaxIncluded] = useState(sourceSalesOrder?.taxIncluded || false);
  const [paymentStatus, setPaymentStatus] = useState(sourceSalesOrder?.paymentStatus || "due");
  const [amountPaid, setAmountPaid] = useState(Number(sourceSalesOrder?.amountPaid || 0));
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [items, setItems] = useState<InvoiceItem[]>(
    sourceSalesOrder?.items?.map((item: SalesOrderItem) => ({
      itemName: item.itemName || "",
      quantity: item.quantity || 1,
      price:
        typeof item.price === "object" && item.price?._bsontype === "Decimal128"
          ? item.price.toString()
          : item.price || 0,
      amount:
        typeof item.amount === "object" && item.amount?._bsontype === "Decimal128"
          ? item.amount.toString()
          : item.amount || 0,
      vatExempt: false,
    })) || [{ itemName: "", quantity: 1, price: 0, amount: 0, vatExempt: false }]
  );
  const [customerName, setCustomerName] = useState(sourceSalesOrder?.customerName || "");
  const [customerEmail, setCustomerEmail] = useState(sourceSalesOrder?.customerEmail || "");
  const [customerPhone, setCustomerPhone] = useState(sourceSalesOrder?.customerPhone || "");
  const [vatNo, setVatNo] = useState(sourceSalesOrder?.vatNo || "");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

  const isPanValid = /^\d{9}$/.test(vatNo.trim());

  const resetForm = () => {
    setSendEmail(false);
    setTaxIncluded(sourceSalesOrder?.taxIncluded || false);
    setPaymentStatus(sourceSalesOrder?.paymentStatus || "due");
    setAmountPaid(Number(sourceSalesOrder?.amountPaid || 0));
    setItems(
      sourceSalesOrder?.items?.map((item: SalesOrderItem) => ({
        itemName: item.itemName || "",
        quantity: item.quantity || 1,
        price:
          typeof item.price === "object" && item.price?._bsontype === "Decimal128"
            ? item.price.toString()
            : item.price || 0,
        amount:
          typeof item.amount === "object" && item.amount?._bsontype === "Decimal128"
            ? item.amount.toString()
            : item.amount || 0,
        vatExempt: false,
      })) || [{ itemName: "", quantity: 1, price: 0, amount: 0, vatExempt: false }]
    );
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setVatNo("");
  };

  useEffect(() => {
    fetchInventoryItem()
      .then((data) => {
        if (Array.isArray(data)) {
          setInventoryItems(data);
        } else if (data && Array.isArray((data as any).inventory)) {
          setInventoryItems((data as any).inventory);
        } else {
          setInventoryItems([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching inventory items:", err);
        setInventoryItems([]);
      });
  }, []);

  useEffect(() => {
    let sub = 0;
    let taxable = 0;

    items.forEach((item) => {
      const lineAmt = Number(item.amount) || 0;
      sub += lineAmt;
      if (!item.vatExempt) {
        taxable += lineAmt;
      }
    });

    let computedTax = 0;
    let computedTotal = 0;

    if (taxIncluded && taxRate > 0) {
      const derivedTaxable = taxable / (1 + taxRate / 100);
      computedTax = taxable - derivedTaxable;
      computedTotal = sub;
    } else {
      computedTax = (taxable * taxRate) / 100;
      computedTotal = sub + computedTax;
    }

    setSubtotal(sub);
    setTax(computedTax);
    setTotalAmount(computedTotal);
  }, [items, taxRate, taxIncluded]);

  const createMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales", "invoices"] });
    },
  });

  const handleAddItem = () => {
    setItems([...items, { itemName: "", quantity: 1, price: 0, amount: 0, vatExempt: false }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    const current = { ...newItems[index] };

    if (field === "itemName") {
      current.itemName = value;
      const found = inventoryItems.find((inv) => inv.name === value);
      if (found) {
        const itemPrice = Number(found.sellingPrice ?? found.price ?? 0);
        current.price = itemPrice;
        current.amount = (Number(current.quantity) || 1) * itemPrice;
      }
    } else if (field === "quantity" || field === "price") {
      (current as any)[field] = value;
      const q = Number(field === "quantity" ? value : current.quantity) || 0;
      const p = Number(field === "price" ? value : current.price) || 0;
      current.amount = q * p;
    } else if (field === "vatExempt") {
      current.vatExempt = Boolean(value);
    }

    newItems[index] = current;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error("Customer name is required.");
      return;
    }

    if (items.length === 0 || !items[0].itemName) {
      toast.error("Please add at least one item.");
      return;
    }

    setLoading(true);
    try {
      const invoiceData = {
        customerName,
        customerEmail,
        customerPhone,
        vatNo: vatNo.trim(),
        items: items.map((item) => ({
          itemName: item.itemName,
          quantity: String(item.quantity),
          price: String(item.price),
          amount: String(item.amount),
          vatExempt: Boolean(item.vatExempt),
        })),
        taxRate,
        taxIncluded,
        subtotal,
        tax,
        totalAmount,
        paymentStatus,
        amountPaid,
        sourceSalesOrderId: sourceSalesOrder?._id || undefined,
      };

      const res = await createMutation.mutateAsync(invoiceData);
      toast.success("Tax invoice issued and posted to ledger!");

      if (sendEmail && customerEmail && res?._id) {
        toast.info("Generating and sending PDF...");
        await api.post(`/sales/invoices/${res.data._id}/send`, { email: customerEmail, taxRate });
        toast.success("Invoice emailed to customer!");
      }

      resetForm();
      navigate("/sales/invoices");
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-2 sm:p-4 text-slate-900">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              New Tax Invoice (नयाँ कर विजक)
            </h1>
            <span className="badge-fiscal">
              <Calendar size={12} className="text-slate-500" />
              FY 2082/83
            </span>
            <span className="badge-cbms">
              <ShieldCheck size={12} />
              CBMS Connected
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Sequential invoice generation compliant with Nepal IRD electronic billing regulations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate("/sales/invoices")}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="invoice-form"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm"
          >
            {loading ? "Issuing Tax Invoice..." : "Save & Issue Tax Invoice"}
          </Button>
        </div>
      </div>

      <form id="invoice-form" onSubmit={handleSubmit} className="space-y-4">
        {/* ── Statutory Metadata Card ──────────────────────── */}
        <div className="enterprise-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Statutory Bill & Customer Metadata
            </h2>
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <Lock size={12} className="text-slate-400" />
              <span>Auto-Sequence: <strong className="text-slate-900">INV-2082-83-MAIN-XXXXXX</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Customer / Entity Name *</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none"
                placeholder="Buyer / Company Name"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">Buyer PAN / VAT Number</label>
                {vatNo.trim().length > 0 && (
                  <span
                    className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${
                      isPanValid ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {isPanValid ? (
                      <>
                        <CheckCircle2 size={11} /> 9 Digits Verified
                      </>
                    ) : (
                      "Must be 9 digits"
                    )}
                  </span>
                )}
              </div>
              <input
                value={vatNo}
                onChange={(e) => setVatNo(e.target.value)}
                maxLength={9}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono shadow-sm focus:border-slate-900 focus:outline-none"
                placeholder="9-digit Buyer PAN"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none"
              >
                <option value="due">Due / Credit</option>
                <option value="paid">Paid (Cash / Bank)</option>
                <option value="partial">Partial Payment</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Customer Email</label>
              <input
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                type="email"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none"
                placeholder="billing@customer.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Customer Phone</label>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                type="tel"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none"
                placeholder="98XXXXXXXX"
              />
            </div>

            {paymentStatus === "partial" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Amount Paid (NPR)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono shadow-sm focus:border-slate-900 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Line Items Table ─────────────────────────────── */}
        <div className="enterprise-card space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Invoice Line Items
              </h2>
              <p className="text-[11px] text-slate-400">
                Items marked 'Exempt' will be excluded from 13% VAT calculation.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
            >
              <Plus size={13} /> Add Line Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-2.5 w-[42%]">Item / Service Description</th>
                  <th className="px-3 py-2.5 w-[14%] text-center">Qty</th>
                  <th className="px-3 py-2.5 w-[18%]">Rate (NPR)</th>
                  <th className="px-3 py-2.5 w-[12%] text-center">Tax Status</th>
                  <th className="px-3 py-2.5 w-[16%] text-right">Line Total</th>
                  <th className="px-2 py-2.5 w-[4%]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50">
                    <td className="p-2">
                      <select
                        required
                        value={item.itemName}
                        onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                        className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-slate-900 focus:outline-none"
                      >
                        <option value="">Select Item from Inventory...</option>
                        {(Array.isArray(inventoryItems) ? inventoryItems : []).map((inv) => (
                          <option key={inv._id} value={inv.name}>
                            {inv.name} (Stock: {inv.quantity}, Price: {CURRENCY_SYMBOL}
                            {formatCurrencyValue(inv.price)})
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-2">
                      <input
                        required
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-center font-mono focus:border-slate-900 focus:outline-none"
                      />
                    </td>

                    <td className="p-2">
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, "price", e.target.value)}
                        className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono focus:border-slate-900 focus:outline-none"
                      />
                    </td>

                    <td className="p-2 text-center">
                      <label className="inline-flex items-center gap-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={item.vatExempt}
                          onChange={(e) => handleItemChange(index, "vatExempt", e.target.checked)}
                          className="rounded border-slate-300 h-3.5 w-3.5 text-slate-900"
                        />
                        <span className="text-[11px] text-slate-600">Exempt</span>
                      </label>
                    </td>

                    <td className="p-2 text-right font-mono font-medium text-slate-900 tabular-nums">
                      {formatCurrency(item.amount)}
                    </td>

                    <td className="p-2 text-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Statutory Summary Breakdown ──────────────────── */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pt-4 border-t border-slate-100 gap-4">
            <div className="text-xs text-slate-500 space-y-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={taxIncluded}
                  onChange={(e) => setTaxIncluded(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900"
                />
                <span>Unit prices already include 13% Nepal VAT</span>
              </label>
              <p className="text-[11px] text-slate-400">
                Amount in Words and CBMS transaction hash generated upon issuance.
              </p>
            </div>

            <div className="w-full sm:w-72 rounded-lg bg-slate-50/80 border border-slate-200/80 p-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxable Amount:</span>
                <span className="font-mono tabular-nums">
                  {formatCurrency(
                    items.reduce(
                      (acc, cur) => acc + (cur.vatExempt ? 0 : Number(cur.amount) || 0),
                      0
                    )
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>13% VAT Amount:</span>
                <span className="font-mono tabular-nums font-medium text-indigo-700">
                  {formatCurrency(tax)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="font-mono tabular-nums">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
