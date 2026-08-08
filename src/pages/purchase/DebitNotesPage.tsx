import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDebitNotes } from "@/services/purchase.service";

const REASON_LABELS: Record<string, string> = {
  GOODS_RETURNED:        "Goods Returned",
  PRICE_DECREASE:        "Price Decrease",
  VAT_ADJUSTMENT:        "VAT Adjustment",
  QUALITY_DEFECT:        "Quality Defect",
  OVERCHARGE_CORRECTION: "Overcharge Correction",
  OTHER:                 "Other",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT:   "bg-slate-500/20 text-slate-400 border-slate-500/30",
  ISSUED:  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  APPLIED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export default function DebitNotesPage() {
  const navigate = useNavigate();
  const [notes,   setNotes]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    fetchDebitNotes()
      .then((d) => setNotes(d?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = notes.filter((n) =>
    n.debitNoteNumber?.toLowerCase().includes(search.toLowerCase()) ||
    n.supplierName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Debit Notes</h1>
            <p className="text-slate-400 text-sm mt-1">Purchase adjustments & supplier returns — IRD Compliant</p>
          </div>
          <button onClick={() => navigate("/purchase/debit-notes/create")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-900/30 text-sm">
            + Create Debit Note
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-3">
          {[
            { label: "Total Notes", value: notes.length, color: "text-white" },
            { label: "Issued",      value: notes.filter((n) => n.status === "ISSUED").length,  color: "text-blue-400"    },
            { label: "Applied",     value: notes.filter((n) => n.status === "APPLIED").length, color: "text-emerald-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-slate-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by note number or supplier name…" />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-5xl mb-3">📋</p>
            <p className="text-lg font-medium">No debit notes yet</p>
            <p className="text-sm">Create your first debit note for supplier adjustments</p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="px-4 py-4 text-left">Debit Note #</th>
                    <th className="px-4 py-4 text-left">Supplier</th>
                    <th className="px-4 py-4 text-left">Miti (BS)</th>
                    <th className="px-4 py-4 text-left">Reason</th>
                    <th className="px-4 py-4 text-right">Taxable</th>
                    <th className="px-4 py-4 text-right">VAT</th>
                    <th className="px-4 py-4 text-right">Total</th>
                    <th className="px-4 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((note) => (
                    <tr key={note._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4 font-mono text-blue-300 text-xs">{note.debitNoteNumber}</td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-white">{note.supplierName}</p>
                        {note.supplierPAN && <p className="text-xs text-slate-400">PAN: {note.supplierPAN}</p>}
                      </td>
                      <td className="px-4 py-4 text-slate-300">{note.miti || "—"}</td>
                      <td className="px-4 py-4 text-slate-300">{REASON_LABELS[note.reason] || note.reason}</td>
                      <td className="px-4 py-4 text-right text-slate-300">
                        Rs. {Number(note.taxableAmount ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-right text-amber-400">
                        Rs. {Number(note.vatAmount ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-white">
                        Rs. {Number(note.totalAmount ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[note.status] || ""}`}>
                          {note.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
