import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { fetchCustomers } from "@/services/sales.service";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  Search,
  Plus,
  Download,
  RefreshCw,
  Eye,
  FileText,
  CreditCard,
  Trash2,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Receipt,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { toast } from "@/utils/notify";

export type CustomerRecord = {
  _id: string;
  name: string;
  companyName?: string;
  vatNo?: string;
  phone?: string;
  email?: string;
  notes?: string;
  status?: string;
  value?: number | string | { $numberDecimal?: string };
  totalPaid?: number | string | { $numberDecimal?: string };
  dueamount?: number | string | { $numberDecimal?: string };
  createdAt?: string;
  updatedAt?: string;
};

// Safe Decimal / Money parser
const parseMoney = (val: any): number => {
  if (val == null) return 0;
  if (typeof val === "object" && "$numberDecimal" in val) {
    return Number(val.$numberDecimal) || 0;
  }
  const num = Number(val);
  return Number.isNaN(num) ? 0 : num;
};

// Avatar Initials
const getInitials = (company?: string, name?: string): string => {
  const target = (company || name || "CU").trim();
  const parts = target.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return target.slice(0, 2).toUpperCase();
};

export default function CustomersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Search, Filter, Sort & Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "DUE" | "SETTLED">("ALL");
  const [sortBy, setSortBy] = useState<"DUE_DESC" | "VALUE_DESC" | "NAME_ASC" | "NEWEST">("DUE_DESC");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<CustomerRecord | null>(null);

  // Fetch real customers
  const {
    data: response,
    isLoading: loading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["sales", "customers"],
    queryFn: fetchCustomers,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const rawCustomers: CustomerRecord[] = useMemo(() => {
    return (response?.data || response?.customers || []) as CustomerRecord[];
  }, [response]);

  // Delete Customer Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/customer/delete/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Customer removed successfully.");
      queryClient.invalidateQueries({ queryKey: ["sales", "customers"] });
      setCustomerToDelete(null);
      if (selectedCustomer && customerToDelete && selectedCustomer._id === customerToDelete._id) {
        setSelectedCustomer(null);
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete customer";
      toast.error(msg);
    },
  });

  // Calculate live financial KPIs strictly based on database values
  const metrics = useMemo(() => {
    let totalBusiness = 0;
    let totalPaid = 0;
    let totalDue = 0;
    let dueCount = 0;
    let settledCount = 0;

    for (const c of rawCustomers) {
      const b = parseMoney(c.value);
      const p = parseMoney(c.totalPaid);
      const d = parseMoney(c.dueamount);

      totalBusiness += b;
      totalPaid += p;
      totalDue += d;

      if (d > 0.01) {
        dueCount++;
      } else {
        settledCount++;
      }
    }

    return {
      totalCount: rawCustomers.length,
      totalBusiness,
      totalPaid,
      totalDue,
      dueCount,
      settledCount,
    };
  }, [rawCustomers]);

  // Filter and Sort Customers
  const filteredCustomers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    const list = rawCustomers.filter((c) => {
      // Status filtering
      const due = parseMoney(c.dueamount);
      if (statusFilter === "DUE" && due <= 0.01) return false;
      if (statusFilter === "SETTLED" && due > 0.01) return false;

      // Search matching across relevant fields
      if (!term) return true;
      const comp = (c.companyName || "").toLowerCase();
      const nm = (c.name || "").toLowerCase();
      const vat = (c.vatNo || "").toLowerCase();
      const ph = (c.phone || "").toLowerCase();
      const em = (c.email || "").toLowerCase();

      return (
        comp.includes(term) ||
        nm.includes(term) ||
        vat.includes(term) ||
        ph.includes(term) ||
        em.includes(term)
      );
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "DUE_DESC") {
        return parseMoney(b.dueamount) - parseMoney(a.dueamount);
      }
      if (sortBy === "VALUE_DESC") {
        return parseMoney(b.value) - parseMoney(a.value);
      }
      if (sortBy === "NAME_ASC") {
        const nameA = (a.companyName || a.name || "").toLowerCase();
        const nameB = (b.companyName || b.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      }
      if (sortBy === "NEWEST") {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });

    return list;
  }, [rawCustomers, searchTerm, statusFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + pageSize);

  // Handle Search Input Change
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  // Handle Status Filter Change
  const handleStatusChange = (status: "ALL" | "DUE" | "SETTLED") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Real CSV Export
  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) {
      toast.error("No customer records to export");
      return;
    }

    const headers = [
      "Company Name",
      "Contact Person",
      "PAN/VAT No",
      "Phone",
      "Email",
      "Total Invoiced (NPR)",
      "Total Paid (NPR)",
      "Outstanding Due (NPR)",
      "Status",
      "Created Date",
    ];

    const csvRows = filteredCustomers.map((c) => {
      const due = parseMoney(c.dueamount);
      const isDue = due > 0.01;
      return [
        `"${(c.companyName || "").replace(/"/g, '""')}"`,
        `"${(c.name || "").replace(/"/g, '""')}"`,
        `"${(c.vatNo || "").replace(/"/g, '""')}"`,
        `"${(c.phone || "").replace(/"/g, '""')}"`,
        `"${(c.email || "").replace(/"/g, '""')}"`,
        parseMoney(c.value).toFixed(2),
        parseMoney(c.totalPaid).toFixed(2),
        due.toFixed(2),
        `"${isDue ? "Due" : "Settled"}"`,
        `"${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...csvRows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute("download", `customers_directory_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${filteredCustomers.length} customer records to CSV`);
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-3 sm:p-5 text-slate-900">
      {/* ── Top Header Bar ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Customers
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <Users size={12} className="text-slate-500" />
              <span>{metrics.totalCount} Registered</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain customer ledgers, verify IRD PAN/VAT numbers, and manage sales receivables.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-2xs"
          >
            <RefreshCw size={13} className={`mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 px-3 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-2xs"
          >
            <Download size={13} className="mr-1.5 text-slate-500" />
            Export CSV
          </Button>

          <Link to="/sales/customers/new">
            <Button
              size="sm"
              className="h-9 px-3.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm"
            >
              <Plus size={14} className="mr-1.5" />
              Add Customer
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Metric Summary Cards (Accurate DB Aggregates) ────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Customer Directory */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Accounts
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {metrics.totalCount}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{metrics.settledCount} with zero balance</span>
            <span className="text-slate-400">•</span>
            <span className="font-medium text-amber-600">{metrics.dueCount} with due</span>
          </div>
        </div>

        {/* Card 2: Total Business Billed */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Lifetime Sales Volume
            </span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Receipt size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {formatCurrency(metrics.totalBusiness)}
          </p>
          <p className="mt-2 text-xs text-slate-500 truncate">
            Total invoiced customer balance
          </p>
        </div>

        {/* Card 3: Total Collections */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Collections Received
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2 tabular-nums">
            {formatCurrency(metrics.totalPaid)}
          </p>
          <p className="mt-2 text-xs text-slate-500 truncate">
            Cleared payments on customer accounts
          </p>
        </div>

        {/* Card 4: Outstanding Receivables */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Outstanding Receivables
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle size={16} />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-2 tabular-nums ${metrics.totalDue > 0 ? "text-amber-600" : "text-slate-900"}`}>
            {formatCurrency(metrics.totalDue)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {metrics.dueCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                {metrics.dueCount} customer{metrics.dueCount > 1 ? "s" : ""} pending payment
              </span>
            ) : (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 size={12} />
                All customer accounts settled
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Segmented Buttons */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs self-start md:self-auto border border-slate-200/60">
          <button
            onClick={() => handleStatusChange("ALL")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              statusFilter === "ALL"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Accounts ({metrics.totalCount})
          </button>
          <button
            onClick={() => handleStatusChange("DUE")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              statusFilter === "DUE"
                ? "bg-white text-amber-700 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            With Due ({metrics.dueCount})
          </button>
          <button
            onClick={() => handleStatusChange("SETTLED")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              statusFilter === "SETTLED"
                ? "bg-white text-emerald-700 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Settled ({metrics.settledCount})
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name, company, PAN..."
              className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
            >
              <option value="DUE_DESC">Highest Due Balance</option>
              <option value="VALUE_DESC">Highest Sales Value</option>
              <option value="NAME_ASC">Name (A → Z)</option>
              <option value="NEWEST">Recently Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Main Customer Table ─────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200/80 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Customer / Organization</th>
                <th className="px-4 py-3">PAN / VAT No</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3 text-right">Lifetime Sales</th>
                <th className="px-4 py-3 text-right">Total Settled</th>
                <th className="px-4 py-3 text-right">Amount Due</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw size={22} className="animate-spin mx-auto mb-2 text-slate-600" />
                    <span>Loading customer accounts...</span>
                  </td>
                </tr>
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="h-10 w-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Users size={20} />
                      </div>
                      <p className="text-sm font-semibold text-slate-800">No customers found</p>
                      <p className="text-xs text-slate-500">
                        {searchTerm || statusFilter !== "ALL"
                          ? "Try adjusting your search criteria or resetting the filters."
                          : "No customer records currently in the database. Add your first customer to get started."}
                      </p>
                      {(searchTerm || statusFilter !== "ALL") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("ALL");
                          }}
                          className="mt-2 text-xs rounded-lg"
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((cust) => {
                  const company = cust.companyName || cust.name || "Customer Entity";
                  const contactPerson = cust.name || "-";
                  const due = parseMoney(cust.dueamount);
                  const value = parseMoney(cust.value);
                  const paid = parseMoney(cust.totalPaid);
                  const isDue = due > 0.01;
                  const vat = cust.vatNo?.trim() || "";
                  const isVatValid = /^\d{9}$/.test(vat);
                  const initials = getInitials(cust.companyName, cust.name);

                  return (
                    <tr
                      key={cust._id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedCustomer(cust)}
                    >
                      {/* Customer / Company */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-lg ${
                              isDue ? "bg-amber-100 text-amber-800" : "bg-slate-800 text-white"
                            } flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-2xs`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-xs">
                              {company}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              Rep: {contactPerson}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* PAN / VAT */}
                      <td className="py-3 px-4 font-mono">
                        {vat && !vat.startsWith("TEMP-") ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200/80 text-[11px]">
                            {isVatValid && (
                              <ShieldCheck size={11} className="text-emerald-600 shrink-0" />
                            )}
                            <span>{vat}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Not registered</span>
                        )}
                      </td>

                      {/* Contact */}
                      <td
                        className="py-3 px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-0.5">
                          {cust.phone ? (
                            <a
                              href={`tel:${cust.phone}`}
                              className="text-slate-700 hover:text-blue-600 flex items-center gap-1 transition-colors font-mono"
                            >
                              <Phone size={11} className="text-slate-400 shrink-0" />
                              <span>{cust.phone}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                          {cust.email && (
                            <a
                              href={`mailto:${cust.email}`}
                              className="text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors truncate max-w-[180px]"
                            >
                              <Mail size={11} className="text-slate-400 shrink-0" />
                              <span className="truncate">{cust.email}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Total Business */}
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-900 tabular-nums">
                        {formatCurrency(value)}
                      </td>

                      {/* Total Settled */}
                      <td className="py-3 px-4 text-right font-mono text-emerald-600 font-medium tabular-nums">
                        {formatCurrency(paid)}
                      </td>

                      {/* Amount Due */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {isDue ? (
                          <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                            {formatCurrency(due)}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium text-[11px]">
                            रु 0.00
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDue
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isDue ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                          />
                          {isDue ? "Due" : "Settled"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedCustomer(cust)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="View Customer Profile"
                          >
                            <Eye size={14} />
                          </button>
                          <Link
                            to="/sales/invoice/new"
                            state={{
                              customerName: cust.companyName || cust.name,
                              customerEmail: cust.email,
                              customerPhone: cust.phone,
                              vatNo: cust.vatNo,
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Issue Tax Invoice"
                          >
                            <FileText size={14} />
                          </Link>
                          <Link
                            to="/sales/client-payment/new"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Record Customer Payment"
                          >
                            <CreditCard size={14} />
                          </Link>
                          <button
                            onClick={() => setCustomerToDelete(cust)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Customer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Real Functional Pagination Bar ──────────────────────── */}
        <div className="p-3 sm:px-4 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              Showing {filteredCustomers.length > 0 ? startIndex + 1 : 0} to{" "}
              {Math.min(startIndex + pageSize, filteredCustomers.length)} of{" "}
              {filteredCustomers.length} records
            </span>
            <div className="hidden sm:flex items-center gap-1.5 ml-4">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-700 font-medium"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-7 w-7 p-0 rounded border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <ChevronLeft size={14} />
            </Button>

            <span className="px-2 text-xs font-medium text-slate-700">
              Page {safeCurrentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 w-7 p-0 rounded border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Customer Details Slide-over / Modal ─────────────────── */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/60">
              <div className="flex items-start gap-3.5">
                <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                  {getInitials(selectedCustomer.companyName, selectedCustomer.name)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedCustomer.companyName || selectedCustomer.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Contact: {selectedCustomer.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Financial Snapshot */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Lifetime Invoiced
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-1 font-mono">
                    {formatCurrency(parseMoney(selectedCustomer.value))}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    Total Received
                  </span>
                  <p className="text-sm font-bold text-emerald-700 mt-1 font-mono">
                    {formatCurrency(parseMoney(selectedCustomer.totalPaid))}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    Remaining Due
                  </span>
                  <p className="text-sm font-bold text-amber-700 mt-1 font-mono">
                    {formatCurrency(parseMoney(selectedCustomer.dueamount))}
                  </p>
                </div>
              </div>

              {/* Tax & Verification */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">PAN / VAT Registration</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedCustomer.vatNo && !selectedCustomer.vatNo.startsWith("TEMP-")
                      ? selectedCustomer.vatNo
                      : "Not registered with PAN"}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Phone Number</span>
                  {selectedCustomer.phone ? (
                    <a
                      href={`tel:${selectedCustomer.phone}`}
                      className="font-mono text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Phone size={11} />
                      {selectedCustomer.phone}
                    </a>
                  ) : (
                    <span className="text-slate-400">Not recorded</span>
                  )}
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Email Address</span>
                  {selectedCustomer.email ? (
                    <a
                      href={`mailto:${selectedCustomer.email}`}
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Mail size={11} />
                      {selectedCustomer.email}
                    </a>
                  ) : (
                    <span className="text-slate-400">Not recorded</span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-slate-500">Created Date</span>
                  <span className="text-slate-700 font-medium">
                    {selectedCustomer.createdAt
                      ? new Date(selectedCustomer.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedCustomer.notes && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Customer Notes</span>
                  <p className="text-slate-600 whitespace-pre-wrap">{selectedCustomer.notes}</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCustomer(null)}
                className="text-xs rounded-lg"
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                <Link
                  to="/sales/client-payment/new"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-colors"
                >
                  <CreditCard size={13} />
                  Record Payment
                </Link>
                <Link
                  to="/sales/invoice/new"
                  state={{
                    customerName: selectedCustomer.companyName || selectedCustomer.name,
                    customerEmail: selectedCustomer.email,
                    customerPhone: selectedCustomer.phone,
                    vatNo: selectedCustomer.vatNo,
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-2xs transition-colors"
                >
                  <FileText size={13} />
                  Issue Invoice
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ──────────────────────────── */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Delete Customer Account</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete{" "}
                  <strong className="text-slate-800">
                    {customerToDelete.companyName || customerToDelete.name}
                  </strong>
                  ? This will remove the customer profile from your active directory.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCustomerToDelete(null)}
                className="text-xs rounded-lg"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(customerToDelete._id)}
                className="text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-xs"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Customer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
