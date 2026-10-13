import React, { useState, useEffect } from "react";
import api from "@/utils/api";
import { Province, Municipality } from "states-nepal";
import {
  Building2,
  ShieldCheck,
  MapPin,
  GitBranch,
  Percent,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";

const IRD_OFFICES = [
  "Inland Revenue Office, Kathmandu", "Inland Revenue Office, Lalitpur",
  "Inland Revenue Office, Bhaktapur", "Inland Revenue Office, Pokhara",
  "Inland Revenue Office, Biratnagar", "Inland Revenue Office, Birgunj",
  "Inland Revenue Office, Butwal", "Inland Revenue Office, Dharan",
  "Inland Revenue Office, Hetauda", "Inland Revenue Office, Nepalgunj",
  "Large Taxpayer's Office, Kathmandu",
];

// Static data — computed once at module load, not on every render
const provinceService = new Province();
const municipalityService = new Municipality();
const PROVINCES_WITH_DISTRICTS: any[] = provinceService.getProvincesWithDistricts();

export default function CompanySettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState({ text: "", type: "" });
  const [panError, setPanError] = useState("");
  const [taxMasters, setTaxMasters] = useState<any[]>([]);
  const [taxForm, setTaxForm] = useState({ name: "Default VAT", ratePercent: "13", isActive: true });
  const [taxSaving, setTaxSaving] = useState(false);
  const [taxMsg, setTaxMsg] = useState({ text: "", type: "" });

  // Local cascade state — tracks selected province/district by id
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>("");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");

  useEffect(() => {
    api.get("/profile").then((r) => {
      setProfile(r.data?.user || r.data);
      setLoading(false);
    }).catch(() => setLoading(false));

    api.get("/erp/tax-masters")
      .then((r) => setTaxMasters(r.data?.data || []))
      .catch(() => setTaxMasters([]));
  }, []);

  // Hydrate province/district id state from a previously saved address
  useEffect(() => {
    if (!profile?.address) return;
    if (profile.address.province && !selectedProvinceId) {
      const p = PROVINCES_WITH_DISTRICTS.find((pr: any) => pr.name === profile.address.province);
      if (p) {
        setSelectedProvinceId(String(p.id));
        if (profile.address.district) {
          const d = (p.districts || []).find((ds: any) => ds.name === profile.address.district);
          if (d) setSelectedDistrictId(String(d.id));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 text-slate-700 animate-spin" />
      <p className="text-xs font-semibold text-slate-500">Loading company profile...</p>
    </div>
  );

  const handleChange = (field: string, value: any) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedProvinceId(id);
    setSelectedDistrictId("");
    const province = PROVINCES_WITH_DISTRICTS.find((p: any) => String(p.id) === id);
    setProfile((prev: any) => ({
      ...prev,
      address: {
        ...prev?.address,
        province: province?.name || "",
        district: "",     // reset dependent fields
        localBody: "",
      },
    }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedDistrictId(id);
    const province = PROVINCES_WITH_DISTRICTS.find((p: any) => String(p.id) === selectedProvinceId);
    const district = (province?.districts || []).find((d: any) => String(d.id) === id);
    setProfile((prev: any) => ({
      ...prev,
      address: {
        ...prev?.address,
        district: district?.name || "",
        localBody: "",    // reset dependent field
      },
    }));
  };

  const handleLocalBodyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const municipality = municipalitiesForDistrict.find((m: any) => String(m.id) === id);
    handleAddressChange("localBody", municipality?.name || "");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (panError) return;

    if (
      !profile?.address?.province ||
      !profile?.address?.district ||
      !profile?.address?.localBody ||
      !profile?.address?.street
    ) {
      setMsg({ text: "Please complete all required address fields.", type: "error" });
      return;
    }

    setSaving(true);
    setMsg({ text: "", type: "" });
    try {
      await api.put("/updateprofile", profile);
      setMsg({ text: "Company profile saved successfully.", type: "success" });
    } catch (err: any) {
      setMsg({ text: err?.response?.data?.message || "Save failed.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setProfile((prev: any) => ({
      ...prev,
      address: { ...prev?.address, [field]: value },
    }));
  };

  const handleBranchChange = (field: string, value: string) => {
    setProfile((prev: any) => ({
      ...prev,
      branch: { ...prev?.branch, [field]: value },
    }));
  };

  const handleTaxMasterSave = async () => {
    setTaxSaving(true);
    setTaxMsg({ text: "", type: "" });

    try {
      const payload = {
        name: taxForm.name.trim() || "Default VAT",
        ratePercent: Number(taxForm.ratePercent),
        isActive: taxForm.isActive,
      };

      await api.post("/erp/tax-masters", payload);
      setTaxMsg({ text: "Tax master saved successfully.", type: "success" });
      setTaxForm((prev) => ({ ...prev, name: "Default VAT", ratePercent: "13", isActive: true }));
      const response = await api.get("/erp/tax-masters");
      setTaxMasters(response.data?.data || []);
    } catch (err: any) {
      setTaxMsg({ text: err?.response?.data?.message || "Unable to save tax master.", type: "error" });
    } finally {
      setTaxSaving(false);
    }
  };

  const handleActivateTaxMaster = async (id: string) => {
    try {
      await api.post(`/erp/tax-masters/${id}/activate`);
      const response = await api.get("/erp/tax-masters");
      setTaxMasters(response.data?.data || []);
      setTaxMsg({ text: "Tax master activated.", type: "success" });
    } catch (err: any) {
      setTaxMsg({ text: err?.response?.data?.message || "Unable to activate tax master.", type: "error" });
    }
  };

  const validatePAN = (val: string) => {
    if (val && !/^\d{9}$/.test(val)) setPanError("PAN must be exactly 9 numeric digits");
    else setPanError("");
  };

  // Derived cascade lists
  const selectedProvinceObj = PROVINCES_WITH_DISTRICTS.find(
    (p: any) => String(p.id) === selectedProvinceId
  );
  const districtsForProvince = selectedProvinceObj?.districts || [];
  const municipalitiesForDistrict = selectedDistrictId
    ? municipalityService.getMunicipalitiesByDistrict(Number(selectedDistrictId))
    : [];

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Company Profile & Settings
              </h1>
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                <ShieldCheck size={13} className="text-amber-700" />
                IRD Required
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Statutory company details, PAN/VAT registration, tax masters, and official address for tax invoice printing.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !!panError}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-all shadow-xs shrink-0 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save Company Profile</span>
              </>
            )}
          </button>
        </div>

        {/* Global Feedback Message */}
        {msg.text && (
          <div className={`p-4 rounded-xl text-xs font-semibold border flex items-center gap-2.5 shadow-2xs ${
            msg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}>
            {msg.type === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">

          {/* 1. Basic Information */}
          <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Building2 size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Basic Business Information
                </h2>
                <p className="text-xs text-slate-500">
                  Legal entity name, statutory tax numbers, and contact details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Company Name <span className="text-rose-600">*</span>
                </label>
                <input
                  value={profile?.companyName || ""}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all shadow-2xs"
                  placeholder="ABC Traders Pvt. Ltd."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  PAN Number <span className="text-rose-600">*</span>
                  <span className="ml-2 text-[11px] font-normal text-amber-700 normal-case">(9 numeric digits)</span>
                </label>
                <input
                  value={profile?.pan || ""}
                  onChange={(e) => { handleChange("pan", e.target.value); validatePAN(e.target.value); }}
                  className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all shadow-2xs ${panError ? "border-rose-500" : "border-slate-300"}`}
                  placeholder="123456789"
                  maxLength={9}
                  required
                />
                {panError && <p className="text-rose-600 text-xs font-semibold mt-1">{panError}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  VAT Number <span className="text-rose-600">*</span>
                </label>
                <input
                  value={profile?.vatNo || ""}
                  onChange={(e) => handleChange("vatNo", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all shadow-2xs"
                  placeholder="Same as PAN for most businesses"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Phone Number <span className="text-rose-600">*</span>
                </label>
                <input
                  value={profile?.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all shadow-2xs"
                  placeholder="+977-01-XXXXXXX"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Account Email Address
                </label>
                <input
                  value={profile?.email || ""}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-100/70 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Fiscal Year (BS) <span className="text-rose-600">*</span>
                </label>
                <input
                  value={profile?.fiscalYearBS || ""}
                  onChange={(e) => handleChange("fiscalYearBS", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all shadow-2xs"
                  placeholder="2082/83"
                  required
                />
              </div>
            </div>
          </section>

          {/* 2. IRD Registration Details */}
          <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  IRD Registration Details
                </h2>
                <p className="text-xs text-slate-500">
                  Inland Revenue Department office assignment & electronic billing software certificate
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Assigned IRD Office
                </label>
                <select
                  value={profile?.irdOffice || ""}
                  onChange={(e) => handleChange("irdOffice", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all shadow-2xs"
                >
                  <option value="">Select IRD Office</option>
                  {IRD_OFFICES.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  IRD Registration / Certificate No. <span className="text-rose-600">*</span>
                </label>
                <input
                  value={profile?.irdRegistrationNo || ""}
                  onChange={(e) => handleChange("irdRegistrationNo", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all shadow-2xs"
                  placeholder="Billing software certificate number"
                  required
                />
              </div>
            </div>
          </section>

          {/* 3. Default VAT / Tax Masters */}
          <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Percent size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Default VAT & Tax Masters
                </h2>
                <p className="text-xs text-slate-500">
                  Configure default tax rates applied automatically across sales invoices & purchase bills
                </p>
              </div>
            </div>

            {taxMsg.text && (
              <div className={`mb-4 p-3 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
                taxMsg.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}>
                {taxMsg.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{taxMsg.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Tax Master Name
                </label>
                <input
                  value={taxForm.name}
                  onChange={(e) => setTaxForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all shadow-2xs"
                  placeholder="Default VAT"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxForm.ratePercent}
                  onChange={(e) => setTaxForm((prev) => ({ ...prev, ratePercent: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={taxForm.isActive}
                  onChange={(e) => setTaxForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 accent-slate-900"
                />
                Set as the active default for new transactions
              </label>

              <button
                type="button"
                onClick={handleTaxMasterSave}
                disabled={taxSaving}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-2xs disabled:opacity-60"
              >
                {taxSaving ? "Saving..." : "Save Tax Master"}
              </button>
            </div>

            {/* List of Tax Masters */}
            {taxMasters.length > 0 && (
              <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Configured Tax Masters
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {taxMasters.map((master: any) => (
                    <div
                      key={master._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3"
                    >
                      <div>
                        <div className="text-sm font-bold text-slate-900">{master.name}</div>
                        <div className="text-xs text-slate-500">
                          {master.ratePercent}% Rate • {master.description || "Tax master rule"}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          master.isActive
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-slate-200 text-slate-600"
                        }`}>
                          {master.isActive ? "Active Default" : "Inactive"}
                        </span>
                        {!master.isActive && (
                          <button
                            type="button"
                            onClick={() => handleActivateTaxMaster(master._id)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 4. Company Address */}
          <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
                <MapPin size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Official Company Address
                </h2>
                <p className="text-xs text-slate-500">
                  Nepal administrative cascade (Province → District → Municipality → Street/Ward)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Province */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Province <span className="text-rose-600">*</span>
                </label>
                <select
                  value={selectedProvinceId}
                  onChange={handleProvinceChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all shadow-2xs"
                  required
                >
                  <option value="">Select Province</option>
                  {PROVINCES_WITH_DISTRICTS.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  District <span className="text-rose-600">*</span>
                </label>
                <select
                  value={selectedDistrictId}
                  onChange={handleDistrictChange}
                  disabled={!selectedProvinceId}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all shadow-2xs disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select District</option>
                  {districtsForProvince.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {!selectedProvinceId && (
                  <p className="text-slate-400 text-[11px] mt-1">Select a province first</p>
                )}
              </div>

              {/* Municipality / Local Body */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Municipality / Local Body <span className="text-rose-600">*</span>
                </label>
                <select
                  value={
                    municipalitiesForDistrict.find(
                      (m: any) => m.name === profile?.address?.localBody
                    )?.id || ""
                  }
                  onChange={handleLocalBodyChange}
                  disabled={!selectedDistrictId}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all shadow-2xs disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select Municipality</option>
                  {municipalitiesForDistrict.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                {!selectedDistrictId && (
                  <p className="text-slate-400 text-[11px] mt-1">Select a district first</p>
                )}
              </div>

              {/* Street Address / Ward */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Street Address / Ward <span className="text-rose-600">*</span>
                </label>
                <input
                  value={profile?.address?.street || ""}
                  onChange={(e) => handleAddressChange("street", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all shadow-2xs"
                  placeholder="Ward No. 3, New Baneshwor"
                  required
                />
              </div>

            </div>
          </section>

          {/* 5. Branch Information */}
          <section className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-800 border border-purple-200">
                <GitBranch size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    Branch Information
                  </h2>
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    Recommended by IRD
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Operating branch location, branch code, and regional hub address
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { field: "name",    label: "Branch Name",    placeholder: "Head Office" },
                { field: "code",    label: "Branch Code",    placeholder: "HO-001" },
                { field: "address", label: "Branch Address", placeholder: "Thamel, Kathmandu" },
              ].map((f) => (
                <div key={f.field}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    {f.label}
                  </label>
                  <input
                    value={(profile?.branch?.[f.field]) || ""}
                    onChange={(e) => handleBranchChange(f.field, e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all shadow-2xs"
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving || !!panError}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-8 py-3.5 text-sm font-semibold text-white shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Company Profile...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Company Profile & Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}