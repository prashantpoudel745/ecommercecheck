import React, { useState, useEffect } from "react";
import api from "@/utils/api";
import { Province, Municipality } from "states-nepal";

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

  // Local cascade state — tracks selected province/district by id (needed to
  // filter districts/municipalities), while profile.address still stores names.
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
  // (e.g. when editing an existing company profile that already has an address saved by name).
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
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold ">Company Settings</h1>
            <span className="bg-red-500/20 text-red-400 text-xs font-semibold px-3 py-1 rounded-full border border-red-500/30">
              IRD Required
            </span>
          </div>
          <p className=" text-sm">
            All fields below are required for IRD Nepal tax compliance. These will appear on every invoice.
          </p>
        </div>

        {msg.text && (
          <div className={`mb-6 p-4 rounded-xl text-sm border ${
            msg.type === "success"
              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
              : "bg-red-500/20 border-red-500/30 text-red-300"
          }`}>{msg.text}</div>
        )}

        <form onSubmit={handleSave} className="space-y-6">

          {/* Basic Info */}
          <section className="bg-white/5 border border-black rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Company Name <span className="text-red-400">*</span></label>
                <input value={profile?.companyName || ""}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  className="w-full bg-white/10 border border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ABC Traders Pvt. Ltd." required />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  PAN Number <span className="text-red-700">*</span>
                  <span className="ml-2 text-xs text-amber-500">9 digits — unique</span>
                </label>
                <input value={profile?.pan || ""}
                  onChange={(e) => { handleChange("pan", e.target.value); validatePAN(e.target.value); }}
                  className={`w-full bg-white/10 border rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${panError ? "border-red-500" : "border-black"}`}
                  placeholder="123456789" maxLength={9} 
                  required
                  />
                {panError && <p className="text-red-400 text-xs mt-1">{panError}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">VAT Number  <span className="text-red-400">*</span></label>
                <input value={profile?.vatNo || ""}
                  onChange={(e) => handleChange("vatNo", e.target.value)}
                  className="w-full bg-white/10 border border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Same as PAN for most businesses" 
                  required
                  />
              </div>
              <div>
                <label className="block text-sm mb-1">Phone <span className="text-red-400">*</span></label>
                <input value={profile?.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full bg-white/10 border border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+977-01-XXXXXXX"
                  required
                  />
              </div>
              <div>
                <label className="block text-sm mb-1">Email <span className="text-red-400">*</span></label>
                <input value={profile?.email || ""} disabled
                  className="w-full bg-white/5 border border-black rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm mb-1">Fiscal Year (BS) <span className="text-red-400">*</span></label>
                <input value={profile?.fiscalYearBS || ""}
                  onChange={(e) => handleChange("fiscalYearBS", e.target.value)}
                  className="w-full bg-white/10 border border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2082/83" 
                  required
                  />
              </div>
            </div>
          </section>

          {/* Tax Masters */}
          <section className="bg-white/5 border border-black rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Default VAT / Tax Masters</h2>
            <p className="text-sm text-slate-600 mb-4">
              Manage the default tax rate used for new sales and purchase documents. Active entries are used automatically by the accounting flow.
            </p>

            {taxMsg.text && (
              <div className={`mb-4 rounded-xl border px-3 py-2 text-sm ${taxMsg.type === "success" ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-700" : "border-red-500/30 bg-red-500/20 text-red-700"}`}>
                {taxMsg.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Tax master name</label>
                <input
                  value={taxForm.name}
                  onChange={(e) => setTaxForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white/10 border border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Default VAT"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxForm.ratePercent}
                  onChange={(e) => setTaxForm((prev) => ({ ...prev, ratePercent: e.target.value }))}
                  className="w-full bg-white/10 border border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={taxForm.isActive}
                  onChange={(e) => setTaxForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Set as the active default for new transactions
              </label>
              <button
                type="button"
                onClick={handleTaxMasterSave}
                disabled={taxSaving}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {taxSaving ? "Saving..." : "Save tax master"}
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {taxMasters.map((master: any) => (
                <div key={master._id} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white/70 p-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{master.name}</div>
                    <div className="text-sm text-slate-600">{master.ratePercent}% • {master.description || "Tax master"}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${master.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {master.isActive ? "Active" : "Inactive"}
                    </span>
                    {!master.isActive && (
                      <button
                        type="button"
                        onClick={() => handleActivateTaxMaster(master._id)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* IRD Details */}
          <section className="bg-white/5 border border-black rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span>
              IRD Registration Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">IRD Office</label>
                <select value={profile?.irdOffice || ""}
                  onChange={(e) => handleChange("irdOffice", e.target.value)}
                  className="w-full border border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select IRD Office</option>
                  {IRD_OFFICES.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">IRD Registration / Certificate No.  <span className="text-red-400">*</span></label>
                <input value={profile?.irdRegistrationNo || ""}
                  onChange={(e) => handleChange("irdRegistrationNo", e.target.value)}
                  className="w-full bg-white/10 border border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Billing software certificate number"
                  required
                  />
              </div>
            </div>
          </section>

          {/* Address */}
          <section className="bg-white/5 border border-black rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
              Company Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Province */}
              <div>
                <label className="block text-sm mb-1">
                  Province <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedProvinceId}
                  onChange={handleProvinceChange}
                  className="w-full bg-white/10 border border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm mb-1">
                  District <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedDistrictId}
                  onChange={handleDistrictChange}
                  disabled={!selectedProvinceId}
                  className="w-full bg-white/10 border border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select District</option>
                  {districtsForProvince.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {!selectedProvinceId && (
                  <p className="text-slate-500 text-xs mt-1">Select a province first</p>
                )}
              </div>

              {/* Municipality / Local Body */}
              <div>
                <label className="block text-sm mb-1">
                  Municipality / Local Body <span className="text-red-400">*</span>
                </label>
                <select
                  value={
                    municipalitiesForDistrict.find(
                      (m: any) => m.name === profile?.address?.localBody
                    )?.id || ""
                  }
                  onChange={handleLocalBodyChange}
                  disabled={!selectedDistrictId}
                  className="w-full bg-white/10 border border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select Municipality</option>
                  {municipalitiesForDistrict.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                {!selectedDistrictId && (
                  <p className="text-slate-500 text-xs mt-1">Select a district first</p>
                )}
              </div>

              {/* Street Address / Ward */}
              <div>
                <label className="block text-sm mb-1">
                  Street Address / Ward <span className="text-red-400">*</span>
                </label>
                <input
                  value={profile?.address?.street || ""}
                  onChange={(e) => handleAddressChange("street", e.target.value)}
                  className="w-full bg-white/10 border border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ward No. 3, New Baneshwor"
                  required
                />
              </div>

            </div>
          </section>

          {/* Branch */}
          <section className="bg-white/5 border border-black rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span>
              Branch Information <span className="text-xs font-normal text-slate-500 ml-2">(Recommended by IRD)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { field: "name",    label: "Branch Name",    placeholder: "Head Office" },
                { field: "code",    label: "Branch Code",    placeholder: "HO-001" },
                { field: "address", label: "Branch Address", placeholder: "Thamel, Kathmandu" },
              ].map((f) => (
                <div key={f.field}>
                  <label className="block text-sm mb-1">{f.label}</label>
                  <input value={(profile?.branch?.[f.field]) || ""}
                    onChange={(e) => handleBranchChange(f.field, e.target.value)}
                    className="w-full bg-white/10 border border-black rounded-xl px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          </section>

          <button type="submit" disabled={saving || !!panError}
            className="w-full py-4 bg-zinc-900 hover:from-blue-500 hover:to-emerald-500 disabled:opacity-50 rounded-2xl text-black font-semibold text-lg transition-all shadow-lg">
            {saving ? "Saving…" : " Save Company Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}