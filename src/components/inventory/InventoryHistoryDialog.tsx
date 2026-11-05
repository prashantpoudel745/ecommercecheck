import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Clock3, FileText, Loader2, Package } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency, type DecimalValue } from "@/utils/formatCurrency";
import type { Product } from "../../../types/inventory.types";

const API_BASE = import.meta.env.VITE_API_URL || "";

type Movement = {
  _id: string;
  movementType: string;
  quantity: number;
  enteredQuantity?: number;
  unit?: string;
  conversionFactor?: number;
  unitCost: DecimalValue;
  enteredUnitCost?: DecimalValue;
  totalCost: DecimalValue;
  voucherNumber?: string;
  date: string;
  balanceBefore: number;
  balanceAfter: number;
};

const movementLabels: Record<string, string> = {
  PURCHASE: "Stock received",
  SALE: "Stock sold",
  RETURN_IN: "Customer return received",
  RETURN_OUT: "Return sent out",
  DAMAGE: "Damaged stock removed",
  ADJUSTMENT: "Stock adjustment",
  OPENING_STOCK: "Opening stock added",
  CANCELLED: "Voucher cancellation",
};

export function InventoryHistoryDialog({ item, open, onOpenChange }: {
  item: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [history, setHistory] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !item) return;

    const controller = new AbortController();
    const loadHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/api/inventory/${item._id}/history`, {
          credentials: "include",
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load item history");
        setHistory(data.history || []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Unable to load item history");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadHistory();
    return () => controller.abort();
  }, [item, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden p-0 gap-0">
        <DialogHeader className="p-5 pb-4 border-b border-slate-200 pr-12">
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <Package className="h-5 w-5 text-indigo-600" /> {item?.name} — Item History
          </DialogTitle>
          <DialogDescription>
            Complete stock movement ledger: additions, sales, quantities, rates, values, and references.
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <Stat label="Current quantity" value={`${item?.quantity ?? 0} ${item?.baseUnit || "PCS"}`} />
            <Stat label="Current rate" value={formatCurrency(item?.price ?? 0)} />
            <Stat label="Movements" value={String(history.length)} />
            <Stat label="Tags" value={item?.tags?.length ? item.tags.map((tag) => `#${tag}`).join(", ") : "No tags"} />
          </div>

          {loading ? (
            <div className="py-14 flex items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading item history…</div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
          ) : history.length === 0 ? (
            <div className="py-14 text-center text-sm text-slate-500">
              <Clock3 className="h-7 w-7 mx-auto mb-2 text-slate-300" />
              No stock movements have been recorded for this item yet.
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-3 space-y-4">
              {history.map((movement) => {
                const incoming = movement.quantity >= 0;
                return (
                  <div key={movement._id} className="relative ml-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <span className={`absolute -left-[31px] top-5 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white ${incoming ? "bg-emerald-500" : "bg-rose-500"}`}>
                      {incoming ? <ArrowDownLeft className="h-3 w-3 text-white" /> : <ArrowUpRight className="h-3 w-3 text-white" />}
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <p className="font-bold text-sm text-slate-900">{movementLabels[movement.movementType] || movement.movementType}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(movement.date).toLocaleString()}</p>
                        {movement.voucherNumber && <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-700"><FileText className="h-3.5 w-3.5" /> {movement.voucherNumber}</p>}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-2 text-xs sm:text-right">
                        <Metric label="Quantity" value={`${incoming ? "+" : ""}${movement.enteredQuantity ?? movement.quantity} ${movement.unit || item?.baseUnit || "PCS"}`} className={incoming ? "text-emerald-700" : "text-rose-700"} />
                        <Metric label="Rate" value={formatCurrency(movement.enteredUnitCost ?? movement.unitCost)} />
                        <Metric label="Value" value={formatCurrency(movement.totalCost)} />
                        <Metric label="Balance" value={`${movement.balanceAfter} ${item?.baseUnit || "PCS"}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><p className="text-[10px] uppercase tracking-wide font-bold text-slate-500">{label}</p><p className="mt-1 text-sm font-bold text-slate-900 truncate">{value}</p></div>;
}

function Metric({ label, value, className = "text-slate-900" }: { label: string; value: string; className?: string }) {
  return <div><p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p><p className={`font-bold mt-0.5 ${className}`}>{value}</p></div>;
}
