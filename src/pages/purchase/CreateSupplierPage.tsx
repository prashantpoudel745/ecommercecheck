import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import { createSupplier } from "@/services/purchase.service";
import { getAccountGroups, getAccounts } from "@/services/accounting.service";
import type { Account, AccountGroup } from "../../../types/accounting.types";
import { Building2, Wallet } from "lucide-react";

type SupplierRow = {
  _id: string;
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
  status?: string;
  pending?: boolean;
};

const parseMoney = (value: any) => {
  if (value == null) return 0;
  if (typeof value === "object" && "$numberDecimal" in value) {
    return Number(value.$numberDecimal) || 0;
  }
  return Number(value) || 0;
};

export default function CreateSupplierPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [panError, setPanError] = useState("");

  // --- Account Groups & Ledgers ---
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedLedgerId, setSelectedLedgerId] = useState<string>("");

  // --- Supplier form fields ---
  const [formData, setFormData] = useState<any>({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    taxNumber: "",
    address: "",
  });

  // 1. Load account groups on mount
  useEffect(() => {
    getAccountGroups()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setGroups(list);
        // Default to Sundry Creditors (typical supplier group)
        const defaultGrp = list.find((g: any) =>
          /sundry creditor|creditor/i.test(g.name)
        );
        if (defaultGrp) setSelectedGroupId(defaultGrp._id);
      })
      .catch(() => setGroups([]));
  }, []);

  // 2. Load all ledger accounts on mount
  useEffect(() => {
    getAccounts()
      .then((data) => setAccounts(Array.isArray(data) ? data : []))
      .catch(() => setAccounts([]));
  }, []);

  // Filtered ledgers for the selected group
  const filteredLedgers = useMemo(() => {
    if (!selectedGroupId) return accounts;
    return accounts.filter((acc) => {
      const grpId =
        typeof acc.accountGroup === "object"
          ? (acc.accountGroup as any)?._id
          : acc.accountGroup;
      return String(grpId) === String(selectedGroupId);
    });
  }, [accounts, selectedGroupId]);

  // Auto-select first ledger when group changes (if current ledger not in new group)
  useEffect(() => {
    if (filteredLedgers.length > 0) {
      const exists = filteredLedgers.some(
        (a) => String(a._id) === String(selectedLedgerId)
      );
      if (!exists) setSelectedLedgerId(filteredLedgers[0]._id as string);
    } else {
      setSelectedLedgerId("");
    }
  }, [filteredLedgers]);

  // When a ledger is selected, pre-fill company name, email, phone from ledger data
  const handleLedgerChange = (ledgerId: string) => {
    setSelectedLedgerId(ledgerId);
    const ledger = accounts.find((a) => String(a._id) === ledgerId);
    if (ledger) {
      setFormData((prev: any) => ({
        ...prev,
        companyName: prev.companyName || (ledger as any).name || "",
        email: prev.email || (ledger as any).email || "",
        phone: prev.phone || (ledger as any).phone || "",
        taxNumber: prev.taxNumber || (ledger as any).panNumber || "",
      }));
    }
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroupId(groupId);
    // Reset ledger — the useEffect above will auto-select first in new group
    setSelectedLedgerId("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const createMutation = useMutation({
    mutationFn: (payload: any) => createSupplier(payload),
    onMutate: async (payload: any) => {
      await queryClient.cancelQueries({ queryKey: ["purchase", "suppliers"] });
      const previous = queryClient.getQueryData<{ data: SupplierRow[] }>([
        "purchase",
        "suppliers",
      ]);
      const optimisticRow: SupplierRow = {
        _id: `temp-supplier-${Date.now()}`,
        companyName: payload.companyName,
        contactPerson: payload.contactPerson,
        phone: payload.phone,
        email: payload.email,
        createdAt: new Date().toISOString(),
        status: "ACTIVE",
        pending: true,
      };
      queryClient.setQueryData<{ data: SupplierRow[] }>(
        ["purchase", "suppliers"],
        (old) => ({ data: [optimisticRow, ...(old?.data || [])] })
      );
      return { previous };
    },
    onError: (_err: any, _payload: any, context: any) => {
      queryClient.setQueryData<{ data: SupplierRow[] }>(
        ["purchase", "suppliers"],
        context?.previous
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["purchase", "suppliers"],
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // IRD Compliance: validate PAN/VAT before submission
    const panVal = formData.taxNumber || "";
    if (panVal && !/^\d{9}$/.test(panVal)) {
      setPanError("PAN/VAT must be exactly 9 numeric digits (IRD Nepal requirement).");
      return;
    }
    setPanError("");

    if (!formData.companyName?.trim()) {
      toast.error("Company name is required.");
      return;
    }

    setLoading(true);
    try {
      // Include the selected ledger account ID so the backend can link
      // this supplier to its Chart of Accounts entry
      await createMutation.mutateAsync({
        ...formData,
        ledgerAccountId: selectedLedgerId || undefined,
      });
      toast.success("Supplier registered successfully!");
      navigate("/purchase/suppliers");
    } catch (error: any) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const selectedGroupName =
    groups.find((g) => g._id === selectedGroupId)?.name || "Group";

  return (
    <div className="p-4 sm:p-4 max-w-5xl mx-auto w-full">
      <div className="mb-3 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 p-5 shadow-sm">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
          Register New Supplier
        </h1>
        <p className="text-slate-500 mt-1">
          Capture the billing and tax detail you need for vendor management.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── SECTION 1: Ledger Linking ── */}
          <div>
            <p className="text-xs uppercase tracking-widest text-emerald-600 font-semibold mb-3">
              Chart of Accounts Linking
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              {/* Select Group */}
              <div className="space-y-2">
                <label
                  htmlFor="select-group"
                  className="text-sm font-medium text-slate-700 flex items-center gap-1.5"
                >
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Select Group
                </label>
                <select
                  id="select-group"
                  value={selectedGroupId}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="">
                    -- All Account Groups ({groups.length}) --
                  </option>
                  {groups.map((grp) => (
                    <option key={grp._id} value={grp._id}>
                      {grp.name} ({grp.nature})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Typically "Sundry Creditors" for suppliers.
                </p>
              </div>

              {/* Select Ledger Account */}
              <div className="space-y-2">
                <label
                  htmlFor="select-ledger"
                  className="text-sm font-medium text-slate-700 flex items-center gap-1.5"
                >
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  Select Ledger Account
                </label>
                <select
                  id="select-ledger"
                  value={selectedLedgerId}
                  onChange={(e) => handleLedgerChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="">
                    {selectedGroupId
                      ? `-- Select Ledger in ${selectedGroupName} (${filteredLedgers.length}) --`
                      : `-- Select Ledger Account (${filteredLedgers.length}) --`}
                  </option>
                  {filteredLedgers.map((acc) => {
                    const bal = parseMoney((acc as any).currentBalance);
                    return (
                      <option key={acc._id} value={acc._id as string}>
                        {(acc as any).name} ({(acc as any).code || "No Code"})
                        {bal !== 0 ? ` · Bal: NPR ${bal.toFixed(2)}` : ""}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-slate-400">
                  Selecting a ledger auto-fills name, email &amp; phone below.
                </p>
              </div>
            </div>
          </div>

          {/* ── SECTION 2: Supplier Details ── */}
          <div>
            <p className="text-xs uppercase tracking-widest text-emerald-600 font-semibold mb-3">
              Supplier Details
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  placeholder="Supplier company name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Contact Person
                </label>
                <input
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  placeholder="Primary contact"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Email Address{" "}
                  <span className="ml-1 text-xs text-slate-500 font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  placeholder="vendor@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Phone Number{" "}
                  <span className="ml-1 text-xs text-slate-500 font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  placeholder="e.g. 977-01-1234567"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  PAN / VAT Number{" "}
                  <span className="ml-1 text-xs text-slate-500 font-normal">
                    (optional; 9 digits if entered)
                  </span>
                </label>
                <input
                  name="taxNumber"
                  maxLength={9}
                  pattern="\d{9}"
                  value={formData.taxNumber}
                  onChange={(e) => {
                    handleInputChange(e);
                    if (e.target.value && !/^\d{9}$/.test(e.target.value)) {
                      setPanError("PAN/VAT must be exactly 9 numeric digits.");
                    } else {
                      setPanError("");
                    }
                  }}
                  className={`w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:outline-none focus:ring-4 ${
                    panError
                      ? "border-red-400 focus:ring-red-100"
                      : "focus:border-emerald-500 focus:ring-emerald-100"
                  }`}
                  placeholder="e.g. 123456789"
                />
                {panError && (
                  <p className="text-xs text-red-500 mt-1">{panError}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">
                  Address
                </label>
                <textarea
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  placeholder="Physical address / mailing address"
                />
              </div>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[120px] rounded-xl shadow-sm"
            >
              {loading ? "Saving..." : "Save Record"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/purchase/suppliers")}
              className="rounded-xl"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
