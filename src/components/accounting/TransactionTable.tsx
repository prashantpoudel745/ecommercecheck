import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transaction } from "../../../types";
import { formatCurrency } from "@/utils/formatCurrency";
import { Badge } from "@/components/ui/badge";
import { Calendar, Hash, User, Tag, Receipt, Trash2, AlertCircle, X, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { deleteVoucher } from "@/services/accounting.service";

export default function TransactionTable({
  transactions,
  onTransactionDeleted,
}: {
  transactions: Transaction[];
  onTransactionDeleted?: () => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (error) {
      return dateString;
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteVoucher(id);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setDeletingId(null);
        if (onTransactionDeleted) onTransactionDeleted();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete transaction");
    } finally {
      setIsDeleting(false);
    }
  };

  if (transactions.length === 0)
    return (
      <div className="text-center py-12 text-slate-400 italic bg-white/50 backdrop-blur-sm rounded-xl border border-dashed">
        <Receipt className="w-12 h-12 mx-auto mb-3 opacity-20" />
        No transactions found
      </div>
    );

  return (
    <div className="rounded-xl border border-slate-100 overflow-hidden shadow-sm bg-white relative">
      {/* Success Overlay */}
      {showSuccess && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in zoom-in-95 duration-300">
            <CheckCircle2 className="w-6 h-6" />
            <span className="font-bold tracking-tight">Transaction Deleted Successfully</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && !showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 space-y-6 animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Are you absolutely sure?</h3>
              <p className="text-slate-500 text-sm leading-relaxed px-4">
                This action will permanently remove this transaction from the ledger and reverse all associated balances. This cannot be undone.
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-xs font-bold border border-rose-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setDeletingId(null)}
                className="flex-1 py-3.5 rounded-2xl font-black text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors text-sm uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={() => handleDelete(deletingId)}
                className="flex-1 py-3.5 rounded-2xl font-black text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Confirm Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="text-[10px] font-black uppercase text-slate-500 tracking-wider h-12 lg:pl-6">
              <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3"/> Date</div>
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase text-slate-500 tracking-wider h-12">
              <div className="flex items-center gap-1.5"><Hash className="w-3 h-3"/> Ref #</div>
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase text-slate-500 tracking-wider h-12">
              <div className="flex items-center gap-1.5"><User className="w-3 h-3"/> Party</div>
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase text-slate-500 tracking-wider h-12">
              <div className="flex items-center gap-1.5"><Tag className="w-3 h-3"/> Type</div>
            </TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase text-slate-500 tracking-wider h-12">Amount</TableHead>
            <TableHead className="text-center text-[10px] font-black uppercase text-slate-500 tracking-wider h-12 w-20 lg:pr-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...transactions]
            .sort((a: any, b: any) => {
              const dateB = new Date(b?.date || b?.updatedAt || 0).getTime();
              const dateA = new Date(a?.date || a?.updatedAt || 0).getTime();
              return dateB - dateA;
            })
            .map((transaction: any) => (
              <TableRow key={transaction._id || transaction.id} className="hover:bg-indigo-50/30 transition-colors group">
                <TableCell className="text-slate-500 font-medium whitespace-nowrap py-4 lg:pl-6">
                  {formatDate(transaction.date || transaction.updatedAt)}
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100/50 w-fit">
                      {transaction.voucherNumber || "-"}
                    </span>
                    {transaction.referenceNumber && (
                      <span className="text-[9px] font-black text-slate-400 px-2 uppercase tracking-tighter">
                        Bill: {transaction.referenceNumber}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {transaction.partyName || transaction.clientname || "-"}
                  </div>
                </TableCell>
                <TableCell className="py-4">
<Badge
  variant="outline"
  className={`text-[10px] font-black uppercase ${
    (transaction.type === "SALES" || transaction.category?.toLowerCase() === "sales")
      ? "bg-emerald-100 text-emerald-800 border-emerald-400" :

    (transaction.type === "RECEIPT")
      ? "bg-sky-100 text-sky-800 border-sky-400" :

    (transaction.type === "PURCHASE" || transaction.category?.toLowerCase() === "purchase")
      ? "bg-rose-100 text-rose-800 border-rose-400" :

    (transaction.type === "PAYMENT")
      ? "bg-violet-100 text-violet-800 border-violet-400" :

    (transaction.type === "REFUND")
      ? "bg-amber-100 text-amber-800 border-amber-400" :

    "bg-gray-100 text-gray-700 border-gray-300"
  }`}
>
  {transaction.type || transaction.category || "General"}
</Badge>
                </TableCell>
                <TableCell
                  className={`text-right font-black tracking-tighter text-base py-4 ${
                    (transaction.type === "SALES" || transaction.category?.toLowerCase() === "sales")
                      ? "text-emerald-600" :
                    (transaction.type === "RECEIPT")
                      ? "text-cyan-600" :
                    (transaction.type === "PURCHASE")
                      ? "text-rose-600" :
                    (transaction.type === "PAYMENT")
                      ? "text-indigo-600" :
                    "text-slate-600"
                  }`}
                >
                  {formatCurrency(Math.abs(transaction.totalAmount || transaction.amount))}
                </TableCell>
                <TableCell className="text-center py-4 lg:pr-6">
                  <button
                    onClick={() => setDeletingId(transaction._id || transaction.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                    title="Delete Transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
