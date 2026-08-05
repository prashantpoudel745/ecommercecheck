import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Database, Globe, Users, Edit, ChevronDown, ChevronRight, Clock, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "../dashboard/StatCard";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import DownloadCSVButton from "./DownloadCustomer";
import SearchComponent from "../Search";
import { SkeletonLoader } from "@/skeleton/costumerSkeleton/skeletonLoader";
import RecentClients from "./RecentClients";
import { toNumber } from "@/utils/helpers/decimalhelper";
import { Client , Stats} from "../../../types/customer.types";
const Api_Url = import.meta.env.VITE_API_URL||"";

const StatusPieChart = React.memo(({ clients }: { clients: Client[] }) => {
  const statusData = useMemo(
    () => [
      {
        name: "paid",
        value: clients.filter((c) => c.status === "paid").length,
        color: "#10B981",
      },
      {
        name: "due",
        value: clients.filter((c) => c.status === "due").length,
        color: "#3B82F6",
      },
    ],
    [clients]
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Client Status</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        {clients.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} Clients`, "Status"]}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No client data available
          </div>
        )}
      </CardContent>
    </Card>
  );
});

const CustomerOverview = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    activeClients: 0,
    totalValue: 0,
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
  const [clientTypeFilter, setClientTypeFilter] = useState<"all" | "business" | "individual">("all");

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
        setReconcileMsg(` ${data.message || "Failed to reconcile"}`);
      }
    } catch (err) {
      console.error("Reconcile error:", err);
      setReconcileMsg(" Failed to reconcile. Check console.");
    } finally {
      setReconciling(false);
      setTimeout(() => setReconcileMsg(null), 5000);
    }
  };

  const fetchDueData = useCallback(async () => {
    try {
      const response = await fetch(`${Api_Url}/api/customer/sendemail`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (!data.success) {
        // console.error("Error fetching due data");
      }
    } catch (error) {
      // console.error("Error fetching due data");
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
        setStats({ totalClients, activeClients, totalValue });
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
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
      .toUpperCase();
  }, []);

  const getStatusBadge = useCallback((status: Client["status"]): string => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "due":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
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
      const response = await fetch(`${Api_Url}/api/erp/party/${encodeURIComponent(client.name)}/ledger`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setClientHistory(data.ledger || []);
      } else {
        setClientHistory([]);
      }
    } catch (err) {
      // console.error("Error fetching client history:", err);
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
        // Update local state optimistically
        setClients((prev) =>
          prev.map((c) =>
            c._id === editingClient._id
              ? { ...c, status: result.client.status, dueamount: result.client.dueamount, updatedBy: "You" }
              : c
          )
        );
        
        // Refresh full client list to ensure stats are correct
        fetchClients();

        setEditingClient(null);
      } else {
        alert(result.message || "Failed to update client");
      }
    } catch (err) {
      // console.error("Update error:", err);
      alert("Failed to update client. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchClients();
    const lastRun = localStorage.getItem("lastDueDataFetch");
    const now = new Date().getTime();
    const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

    if (!lastRun || now - parseInt(lastRun) > TWO_DAYS) {
      fetchDueData();
      localStorage.setItem("lastDueDataFetch", now.toString());
    }
  }, [fetchClients, fetchDueData]);

  const memoizedStats = useMemo(() => stats, [stats]);
  const typeFilteredClients = useMemo(() => {
    if (clientTypeFilter === "all") return clients;
    if (clientTypeFilter === "business") {
      return clients.filter((c) => Boolean(c.companyName && c.companyName.trim()));
    }
    return clients.filter((c) => !c.companyName || !c.companyName.trim());
  }, [clients, clientTypeFilter]);

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">{error}</div>;
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        No clients found. Add your first client to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          title="Total Client"
          value={memoizedStats.totalClients}
          icon={<Users size={18} />}
        />
        <StatCard
          title="Active Client"
          value={memoizedStats.activeClients}
          icon={<Database size={18} />}
        />
        <StatCard
          title="Total Value"
          value={formatCurrency(memoizedStats.totalValue)}
          icon={<Globe size={18} />}
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatusPieChart clients={clients} />
        <RecentClients
          clients={clients}
          getInitials={getInitials}
          getStatusBadge={getStatusBadge}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* All Clients Table */}
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>All Clients</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={clientTypeFilter}
              onChange={(e) => setClientTypeFilter(e.target.value as "all" | "business" | "individual")}
              className="h-8 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="business">Business</option>
              <option value="individual">Individual</option>
            </select>
            <button
              onClick={reconcileClients}
              disabled={reconciling}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                reconciling
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reconciling ? "animate-spin" : ""}`} />
              {reconciling ? "Syncing..." : "Sync with Accounting"}
            </button>
            <DownloadCSVButton clients={clients} />
          </div>
        </CardHeader>
        {reconcileMsg && (
          <div className="px-6 pb-2">
            <p className="text-sm font-medium">{reconcileMsg}</p>
          </div>
        )}
        <CardContent>
          <SearchComponent
            data={typeFilteredClients}
            searchFields={["name", "companyName", "vatNo", "email", "phone"]}
            placeholder="Search clients by name, company, VAT, email or phone..."
            renderResults={(filteredClients) => (
              <div className="relative overflow-auto max-h-[60vh]">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>VAT No</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Updated By</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Due Amt</TableHead>
                      <TableHead className="text-right">Total Val</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <React.Fragment key={client._id}>
                      <TableRow 
                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => toggleClientHistory(client)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {expandedClientId === client._id ? (
                              <ChevronDown className="w-4 h-4 text-indigo-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                            {client.name}
                          </div>
                        </TableCell>
                        <TableCell>{client.companyName || "-"}</TableCell>
                        <TableCell>{client.vatNo || "-"}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(
                              client.status
                            )}`}
                          >
                            {client.status.charAt(0).toUpperCase() +
                              client.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>{client.email || "-"}</div>
                          <div className="text-sm text-muted-foreground">
                            {client.phone || "-"}
                          </div>
                        </TableCell>
                        <TableCell>{client.updatedBy || "-"}</TableCell>
                        <TableCell className="min-w-[300px] max-w-[350px]">
                          {client.items && client.items.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {client.items.map((item) => (
                                <span key={item._id} className="text-sm break-words">
                                  {item.itemName} (Qty: {item.quantity}, Price:{" "}
                                  {formatCurrency(item.price)})
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              No items
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-blue-600 font-semibold">
                          {formatCurrency(client.dueamount || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(client.value || 0)}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditClick(client); }}
                            className="p-1.5 text-slate-900 hover:bg-slate-100 rounded dark:hover:bg-slate-700/30 transition-colors"
                            title="Edit client balance/status"
                            aria-label="Edit client"
                          >
                            <Edit size={18} />
                          </button>
                        </TableCell>
                      </TableRow>

                      {/* Expandable Transaction History */}
                      {expandedClientId === client._id && (
                        <TableRow>
                          <TableCell colSpan={10} className="bg-slate-50/80 p-0">
                            <div className="px-8 py-4">
                              <h4 className="text-sm font-bold text-indigo-700 mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Transaction History
                              </h4>
                              {historyLoading ? (
                                <p className="text-sm text-gray-400 py-4 text-center italic">Loading history...</p>
                              ) : clientHistory.length === 0 ? (
                                <p className="text-sm text-gray-400 py-4 text-center italic">No transaction history found for this client.</p>
                              ) : (
                                <div className="border rounded-lg overflow-hidden bg-white">
                                  <table className="w-full text-xs">
                                    <thead className="bg-indigo-50 border-b">
                                      <tr>
                                        <th className="px-4 py-2.5 text-left font-semibold text-indigo-800">Date</th>
                                        <th className="px-4 py-2.5 text-left font-semibold text-indigo-800">Title</th>
                                        <th className="px-4 py-2.5 text-left font-semibold text-indigo-800">Type</th>
                                        <th className="px-4 py-2.5 text-left font-semibold text-indigo-800">Description</th>
                                        <th className="px-4 py-2.5 text-left font-semibold text-indigo-800">Narration</th>
                                        <th className="px-4 py-2.5 text-left font-semibold text-indigo-800 text-[10px]">Updated By</th>
                                        <th className="px-4 py-2.5 text-right font-semibold text-indigo-800">Amount</th>
                                        <th className="px-4 py-2.5 text-right font-semibold text-indigo-800">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {clientHistory.map((v: any, idx: number) => (
                                        <tr key={idx} className={idx % 2 === 0 ? "" : "bg-gray-50/50"}>
                                          <td className="px-4 py-2.5 whitespace-nowrap">
                                            {new Date(v.date).toLocaleDateString()}
                                          </td>
                                          <td className="px-4 py-2.5 font-medium text-gray-900">
                                            {v.title || <span className="text-gray-300 italic">—</span>}
                                          </td>
                                          <td className="px-4 py-2.5">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                              v.type === "SALES" ? "bg-blue-100 text-blue-700" :
                                              v.type === "RECEIPT" ? "bg-green-100 text-green-700" :
                                              v.type === "PURCHASE" ? "bg-amber-100 text-amber-700" :
                                              v.type === "PAYMENT" ? "bg-rose-100 text-rose-700" :
                                              "bg-gray-100 text-gray-600"
                                            }`}>
                                              {v.type}
                                            </span>
                                          </td>
                                          <td className="px-4 py-2.5 text-gray-600 max-w-[200px] truncate">
                                            {v.description || <span className="text-gray-300 italic">—</span>}
                                          </td>
                                          <td className="px-4 py-2.5 text-gray-500 italic max-w-[200px] truncate">
                                            {v.narration || "—"}
                                          </td>
                                          <td className="px-4 py-2.5">
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-bold text-[9px] uppercase">
                                              {v.updatedBy || "Admin"}
                                            </Badge>
                                          </td>
                                          <td className={`px-4 py-2.5 text-right font-mono font-bold ${
                                            v.type === 'SALES' ? "text-emerald-600" :
                                            v.type === 'RECEIPT' ? "text-cyan-600" :
                                            v.type === 'PURCHASE' ? "text-rose-600" :
                                            v.type === 'PAYMENT' ? "text-indigo-600" :
                                            "text-slate-600"
                                          }`}>
                                            {v.type === 'SALES' || v.type === 'RECEIPT' ? '+' : '-'} {formatCurrency(v.totalAmount || 0)}
                                          </td>
                                          <td className="px-4 py-2.5 text-right">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                              v.paymentStatus === "PAID" ? "bg-green-100 text-green-700" :
                                              v.paymentStatus === "PARTIAL" ? "bg-amber-100 text-amber-700" :
                                              "bg-rose-100 text-rose-700"
                                            }`}>
                                              {v.paymentStatus || "N/A"}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              Edit {editingClient.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as "due" | "paid")
                  }
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="due">Due</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Due Amount
                </label>
                <input
                  type="number"
                  value={editDueAmount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setEditDueAmount(val);
                    if (val <= 0.01) {
                      setEditStatus("paid");
                    } else {
                      setEditStatus("due");
                    }
                  }}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCloseEdit}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-300 dark:hover:bg-gray-700"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className={`px-4 py-2 rounded ${
                  saving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOverview;