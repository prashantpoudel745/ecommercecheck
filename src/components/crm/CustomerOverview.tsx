import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Users,
  Edit,
  ChevronDown,
  ChevronRight,
  Clock,
  RefreshCw,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  Search,
  UserX,
  FileText,
  Save,
  X,
} from "lucide-react";
import { StatCard } from "../dashboard/StatCard";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import DownloadCSVButton from "./DownloadCustomer";
import { SkeletonLoader } from "@/skeleton/costumerSkeleton/skeletonLoader";
import RecentClients from "./RecentClients";
import { toNumber } from "@/utils/helpers/decimalhelper";
import { Client, Stats } from "../../../types/customer.types";

const Api_Url = import.meta.env.VITE_API_URL || "";

const StatusPieChart = React.memo(({ clients }: { clients: Client[] }) => {
  const statusData = useMemo(
    () => [
      {
        name: "Paid in Full",
        value: clients.filter((c) => c.status === "paid").length,
        color: "#10b981",
      },
      {
        name: "Outstanding Due",
        value: clients.filter((c) => c.status === "due").length,
        color: "#f59e0b",
      },
    ],
    [clients]
  );

  const total = clients.length;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs h-full flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Client Settlement Overview</h3>
          <p className="text-xs text-slate-500">Distribution of paid vs pending accounts</p>
        </div>
        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
          {total} Clients
        </span>
      </div>

      <div className="h-[200px] w-full relative my-2">
        {clients.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} Accounts`, "Status"]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#1e293b",
                  borderRadius: "0.75rem",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
            No client data available
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100">
        {statusData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs font-semibold text-slate-700">{item.name}</span>
            <span className="text-xs font-bold text-slate-900">({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
});

const CustomerOverview = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    activeClients: 0,
    totalValue: 0,
    totalDue: 0,
  });

  // Edit state
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editDueAmount, setEditDueAmount] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<"due" | "paid">("due");
  const [saving, setSaving] = useState<boolean>(false);

  // Expanded client history state
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [clientHistory, setClientHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Reconcile state
  const [reconciling, setReconciling] = useState(false);
  const [reconcileMsg, setReconcileMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "due">("all");

  const reconcileClients = async () => {
    setReconciling(true);
    setReconcileMsg(null);
    try {
      const response = await fetch(`${Api_Url}/api/customer/reconcile`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setReconcileMsg(`✅ ${data.message}`);
        fetchClients();
      } else {
        setReconcileMsg(`⚠️ ${data.message || "Failed to reconcile"}`);
      }
    } catch (err) {
      setReconcileMsg("❌ Failed to reconcile. Check network connection.");
    } finally {
      setReconciling(false);
      setTimeout(() => setReconcileMsg(null), 5000);
    }
  };

  const fetchDueData = useCallback(async () => {
    try {
      await fetch(`${Api_Url}/api/customer/sendemail`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      // Ignore background error
    }
  }, []);

  const fetchClients = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${Api_Url}/api/customer`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setClients(data.clients);
        const totalClients = data.clients.length;
        const activeClients = data.clients.filter(
          (c: Client) => c.status === "paid"
        ).length;
        const totalValue = data.clients.reduce(
          (sum: number, client: Client) => sum + toNumber(client.value || 0),
          0
        );
        const totalDue = data.clients.reduce(
          (sum: number, client: Client) => sum + toNumber(client.dueamount || 0),
          0
        );
        setStats({ totalClients, activeClients, totalValue, totalDue });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  const getInitials = useCallback((name: string): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const getStatusBadge = useCallback((status: Client["status"]): string => {
    switch (status) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "due":
        return "bg-amber-50 text-amber-800 border-amber-200/80";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  }, []);

  const toggleClientHistory = async (client: Client) => {
    if (expandedClientId === client._id) {
      setExpandedClientId(null);
      setClientHistory([]);
      return;
    }
    setExpandedClientId(client._id);
    setHistoryLoading(true);
    try {
      const response = await fetch(
        `${Api_Url}/api/erp/party/${encodeURIComponent(client.name)}/ledger`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        setClientHistory(data.ledger || []);
      } else {
        setClientHistory([]);
      }
    } catch (err) {
      setClientHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setEditDueAmount(client.dueamount || 0);
    setEditStatus(client.status);
  };

  const handleCloseEdit = () => {
    setEditingClient(null);
  };

  const handleSaveEdit = async () => {
    if (!editingClient) return;
    setSaving(true);

    try {
      const response = await fetch(
        `${Api_Url}/api/customer/update/${editingClient._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status: editStatus,
            dueamount: editDueAmount,
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        setClients((prev) =>
          prev.map((c) =>
            c._id === editingClient._id
              ? {
                  ...c,
                  status: result.client.status,
                  dueamount: result.client.dueamount,
                  updatedBy: "You",
                }
              : c
          )
        );
        fetchClients();
        setEditingClient(null);
      } else {
        alert(result.message || "Failed to update client");
      }
    } catch (err) {
      alert("Failed to update client. Please try again.");
    } fontinally: {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchClients();
    const lastRun = localStorage.getItem("lastDueDataFetch");
    const now = new Date().getTime();
    if (!lastRun || now - parseInt(lastRun, 10) > 24 * 60 * 60 * 1000) {
      fetchDueData();
      localStorage.setItem("lastDueDataFetch", now.toString());
    }
  }, [fetchClients, fetchDueData]);

  // Filter clients by search & status
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      !searchTerm ||
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vatNo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) return <SkeletonLoader />;

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Clients"
          value={stats.totalClients.toString()}
          icon={<Users size={18} />}
          details="Registered client directory"
        />
        <StatCard
          title="Settled Accounts"
          value={stats.activeClients.toString()}
          icon={<CheckCircle2 size={18} />}
          details="Accounts paid in full"
        />
        <StatCard
          title="Outstanding Receivables"
          value={formatCurrency(stats.totalDue)}
          icon={<AlertTriangle size={18} />}
          details="Total pending balance"
        />
        <StatCard
          title="Total Account Value"
          value={formatCurrency(stats.totalValue)}
          icon={<Wallet size={18} />}
          details="Combined lifetime billing"
        />
      </div>

      {/* Top Controls Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">CRM Accounts & Balances</h2>
          <p className="text-xs text-slate-500">
            Real-time party ledger synchronization and receivables monitoring
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {reconcileMsg && (
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              {reconcileMsg}
            </span>
          )}

          <button
            type="button"
            onClick={reconcileClients}
            disabled={reconciling}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-all shadow-xs disabled:opacity-50"
          >
            <RefreshCw size={14} className={reconciling ? "animate-spin" : ""} />
            <span>{reconciling ? "Reconciling..." : "Reconcile Balances"}</span>
          </button>

          <DownloadCSVButton clients={clients} />
        </div>
      </div>

      {/* Analytics & Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <StatusPieChart clients={clients} />
        </div>
        <div className="lg:col-span-2">
          <RecentClients
            clients={clients}
            getInitials={getInitials}
            getStatusBadge={getStatusBadge}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>

      {/* Main Client Accounts Directory */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Client Accounts Directory</h3>
              <p className="text-xs text-slate-500">
                Showing {filteredClients.length} of {clients.length} accounts
              </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "all"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({clients.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("due")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "due"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Due ({clients.filter((c) => c.status === "due").length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("paid")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === "paid"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Paid ({clients.filter((c) => c.status === "paid").length})
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client name, company, email, or VAT number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-slate-50/50"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Directory Table */}
        {filteredClients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <UserX size={28} />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No client accounts found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "No client accounts match your active search or filter criteria."
                : "No customer records currently exist."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Client / Company</th>
                  <th className="py-3 px-4">Contact & Statutory</th>
                  <th className="py-3 px-4 text-right">Lifetime Value</th>
                  <th className="py-3 px-4 text-right">Outstanding Due</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredClients.map((client) => {
                  const isExpanded = expandedClientId === client._id;
                  return (
                    <React.Fragment key={client._id}>
                      <tr className="hover:bg-slate-50/60 transition-colors group">
                        {/* Client & Company */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleClientHistory(client)}
                              className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs hover:bg-slate-800 transition-colors"
                            >
                              {getInitials(client.name)}
                            </button>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-slate-900 group-hover:text-slate-950">
                                  {client.name}
                                </p>
                                {client.companyName && (
                                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium border border-slate-200">
                                    {client.companyName}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Account ID: #{client._id.slice(-6)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact info */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {client.email && (
                              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                <Mail size={13} className="text-slate-400 shrink-0" />
                                <span>{client.email}</span>
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                                <Phone size={12} className="text-slate-400 shrink-0" />
                                <span>{client.phone}</span>
                              </div>
                            )}
                            {client.vatNo && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                PAN/VAT: {client.vatNo}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Value */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono font-bold text-slate-900">
                          {formatCurrency(client.value || 0)}
                        </td>

                        {/* Due Amount */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-right font-mono font-bold text-amber-700">
                          {formatCurrency(client.dueamount || 0)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                              client.status
                            )}`}
                          >
                            {client.status.toUpperCase()}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => toggleClientHistory(client)}
                              className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-semibold flex items-center gap-1 text-xs"
                            >
                              <FileText size={13} />
                              <span>{isExpanded ? "Hide Ledger" : "View Ledger"}</span>
                              {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEditClick(client)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                              title="Edit Account Balance"
                            >
                              <Edit size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Ledger Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-slate-50/90 p-4 border-y border-slate-200/80">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                  <Clock size={14} className="text-slate-500" />
                                  Statement & Ledger Journal: {client.name}
                                </h4>
                                <span className="text-[11px] text-slate-500">
                                  {clientHistory.length} ledger entries found
                                </span>
                              </div>

                              {historyLoading ? (
                                <div className="py-6 text-center text-xs text-slate-500 font-medium">
                                  Loading ledger statement history...
                                </div>
                              ) : clientHistory.length === 0 ? (
                                <div className="py-6 text-center text-xs text-slate-400 font-medium italic">
                                  No transaction history recorded for this party.
                                </div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                      <tr className="bg-slate-100/80 text-[10px] font-bold text-slate-500 uppercase">
                                        <th className="py-2 px-3">Date</th>
                                        <th className="py-2 px-3">Voucher Ref</th>
                                        <th className="py-2 px-3">Narration / Description</th>
                                        <th className="py-2 px-3 text-right">Debit (NPR)</th>
                                        <th className="py-2 px-3 text-right">Credit (NPR)</th>
                                        <th className="py-2 px-3 text-right">Running Balance</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {clientHistory.map((item: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-slate-50">
                                          <td className="py-2 px-3 whitespace-nowrap text-slate-600 font-medium">
                                            {item.date
                                              ? new Date(item.date).toLocaleDateString()
                                              : "-"}
                                          </td>
                                          <td className="py-2 px-3 whitespace-nowrap font-mono font-bold text-slate-900">
                                            {item.voucherNumber || item.reference || "-"}
                                          </td>
                                          <td className="py-2 px-3 text-slate-700">
                                            {item.narration || item.description || "-"}
                                          </td>
                                          <td className="py-2 px-3 whitespace-nowrap text-right font-mono text-emerald-700 font-semibold">
                                            {item.debit ? formatCurrency(item.debit) : "-"}
                                          </td>
                                          <td className="py-2 px-3 whitespace-nowrap text-right font-mono text-rose-700 font-semibold">
                                            {item.credit ? formatCurrency(item.credit) : "-"}
                                          </td>
                                          <td className="py-2 px-3 whitespace-nowrap text-right font-mono font-bold text-slate-900">
                                            {item.balance ? formatCurrency(item.balance) : "-"}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Client Due & Status Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Update Account Balance: {editingClient.name}
              </h3>
              <button
                type="button"
                onClick={handleCloseEdit}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payment Settlement Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as "due" | "paid")}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50 font-medium"
                >
                  <option value="due">DUE (Pending Settlement)</option>
                  <option value="paid">PAID (Settled in Full)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Outstanding Due Amount (NPR)
                </label>
                <input
                  type="number"
                  value={editDueAmount}
                  onChange={(e) => setEditDueAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50 font-mono font-bold"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCloseEdit}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveEdit}
                className="inline-flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs disabled:opacity-50"
              >
                <Save size={14} />
                <span>{saving ? "Saving..." : "Save Account Balance"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOverview;