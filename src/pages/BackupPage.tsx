import React, { useEffect, useState } from "react";
import { fetchBackupStatus, exportBackup } from "@/services/backup.service";

interface BackupStatus {
  totalVouchers:    number;
  totalInvoices:    number;
  totalCustomers:   number;
  totalAuditLogs:   number;
  lastActivityAt:   string | null;
  lastActivityType: string | null;
}

export default function BackupPage() {
  const [status,      setStatus]      = useState<BackupStatus | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [msg,         setMsg]         = useState("");

  useEffect(() => {
    fetchBackupStatus()
      .then((d) => setStatus(d?.data || null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    setDownloading(true); setMsg("");
    try {
      await exportBackup();
      setMsg("✅  Backup downloaded successfully. Store it securely for IRD tax audits.");
    } catch {
      setMsg("❌  Export failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">💾</span>
            <h1 className="text-2xl font-bold text-white">Backup & Restore</h1>
            <span className="bg-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full border border-amber-500/30">
              IRD Recommended
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Keep regular backups of all financial data. IRD inspectors may request historical records during tax audits.
          </p>
        </div>

        {/* IRD Compliance Note */}
        <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-4 mb-6 text-sm text-amber-300">
          <p className="font-semibold mb-1">📋 IRD Requirement</p>
          <p>Nepal's Computerized Billing System Directives require all registered billing systems to maintain tamper-proof records for a minimum of 7 years. Export this backup periodically and store it in a secure, off-site location.</p>
        </div>

        {/* Stats */}
        {!loading && status && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Vouchers",    value: status.totalVouchers,  icon: "🧾" },
              { label: "Invoices",    value: status.totalInvoices,   icon: "📄" },
              { label: "Customers",   value: status.totalCustomers,  icon: "👥" },
              { label: "Audit Logs",  value: status.totalAuditLogs,  icon: "🔐" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-slate-400 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Last Activity */}
        {status?.lastActivityAt && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex items-center gap-4">
            <span className="text-2xl">🕐</span>
            <div>
              <p className="text-sm text-slate-400">Last Activity</p>
              <p className="text-white font-medium">
                {status.lastActivityType} — {new Date(status.lastActivityAt).toLocaleString("en-NP")}
              </p>
            </div>
          </div>
        )}

        {/* Export Card */}
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-2xl p-8 mb-4 text-center">
          <div className="text-5xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-white mb-2">Export Full Backup</h2>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            Downloads a complete JSON snapshot of all your financial records, including the tamper-evident audit trail. The file is named by fiscal year and date.
          </p>

          <div className="bg-white/5 rounded-xl p-4 mb-6 text-left space-y-2 text-sm text-slate-400">
            {[
              "All vouchers & journal entries",
              "All invoices (including voided)",
              "All credit notes & debit notes",
              "All purchase bills",
              "Customer & supplier records",
              "Inventory snapshot",
              "Complete tamper-evident audit trail (hash chain)",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <button onClick={handleExport} disabled={downloading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 rounded-xl text-white font-semibold text-lg transition-all shadow-lg shadow-blue-900/30">
            {downloading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Preparing backup…
              </span>
            ) : "⬇️  Download Backup Now"}
          </button>
        </div>

        {msg && (
          <div className={`p-4 rounded-xl text-sm border text-center ${
            msg.startsWith("✅")
              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
              : "bg-red-500/20 border-red-500/30 text-red-300"
          }`}>{msg}</div>
        )}

        {/* Security Note */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-4 text-sm text-slate-400">
          <p className="font-semibold text-slate-300 mb-2">🛡️  Security Best Practices</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Store backup in an encrypted, password-protected folder</li>
            <li>Keep copies in at least 2 different physical locations</li>
            <li>Export at minimum: at fiscal year end, before any system upgrade, and monthly</li>
            <li>The audit trail hash chain allows IRD inspectors to verify no tampering occurred</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
