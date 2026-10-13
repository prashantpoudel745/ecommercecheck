import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notify";
import { createCustomer } from "@/services/sales.service";
import { ArrowLeft, Building2, ShieldCheck, UserPlus } from "lucide-react";

export default function CreateCustomerPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    vatNo: "",
    email: "",
    phone: "",
    notes: "",
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => createCustomer(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sales", "customers"] });
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Contact person name is required.");
      return;
    }

    if (formData.vatNo.trim() && !/^\d{9}$/.test(formData.vatNo.trim())) {
      toast.error("Nepal PAN/VAT number must be exactly 9 numeric digits.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        companyName: formData.companyName.trim() || formData.name.trim(),
        name: formData.name.trim(),
        vatNo: formData.vatNo.trim() || undefined,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        notes: formData.notes.trim(),
      };

      await createMutation.mutateAsync(payload);
      toast.success("Customer added successfully!");
      navigate("/sales/customers");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create customer.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 sm:p-5 max-w-4xl mx-auto w-full space-y-4 text-slate-900">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-3">
          <Link
            to="/sales/customers"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Add New Customer
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Register a client organization or individual customer in your sales directory.
            </p>
          </div>
        </div>
      </div>

      {/* ── Form Card ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-2xs border border-slate-200/90 p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company / Organization Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Company / Trade Name
              </label>
              <input
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 shadow-2xs focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                placeholder="e.g. Acme Corporation Pvt. Ltd."
              />
              <p className="text-[11px] text-slate-400">
                If omitted, contact person name will be used as organization name.
              </p>
            </div>

            {/* Contact Person Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Contact Person Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 shadow-2xs focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                placeholder="e.g. Ramesh Shrestha"
              />
            </div>

            {/* PAN / VAT Number */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  PAN / VAT Number
                </label>
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                  <ShieldCheck size={11} />
                  IRD 9-Digits
                </span>
              </div>
              <input
                name="vatNo"
                maxLength={9}
                value={formData.vatNo}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-xs font-mono text-slate-900 shadow-2xs focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                placeholder="e.g. 601234567 (optional)"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Phone Number</label>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 shadow-2xs focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all font-mono"
                placeholder="e.g. 9841234567 or 01-4412345"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 shadow-2xs focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                placeholder="e.g. billing@customer.com"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Customer Notes</label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 shadow-2xs focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all resize-none"
                placeholder="Terms, delivery addresses, payment preferences..."
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <Button
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white min-w-[120px] rounded-lg text-xs font-semibold h-9 shadow-sm"
            >
              <UserPlus size={14} className="mr-1.5" />
              {loading ? "Saving Customer..." : "Save Customer"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/sales/customers")}
              className="rounded-lg text-xs h-9 border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
