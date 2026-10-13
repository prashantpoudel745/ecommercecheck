import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Send,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Clock,
  Layers,
  Lock,
  ChevronDown,
  HelpCircle,
  Check,
  Sparkles,
  Server,
  FileCheck2,
  Users2,
  Receipt,
  Boxes,
  Briefcase,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { setPageSeo } from "@/utils/seo";
import { submitContactSales } from "@/services/sales.service";
import { toast } from "@/utils/notify";

// Module Selection Options
const ERP_MODULES = [
  { id: "accounting", name: "Accounting & IRD Billing", icon: Receipt },
  { id: "inventory", name: "Multi-Warehouse Inventory", icon: Boxes },
  { id: "sales", name: "Sales & Client Ledgers", icon: Briefcase },
  { id: "purchase", name: "Procurement & Payables", icon: FileCheck2 },
  { id: "hr", name: "HR, Payroll & Attendance", icon: Users2 },
  { id: "insights", name: "Executive AI Analytics", icon: Sparkles },
];

// Frequently Asked Questions
const FAQS = [
  {
    q: "Is Bebasthapan certified for Nepal IRD computerized billing?",
    a: "Yes. Bebasthapan is fully compliant with the Inland Revenue Department (IRD) Nepal regulations for sequential computerized billing, Annex 8/13 tax registers, and Centralized Billing Monitoring System (CBMS) API synchronization.",
  },
  {
    q: "Can we import our existing customer, supplier, and inventory data from Excel or Tally?",
    a: "Yes. Bebasthapan includes built-in bulk CSV/Excel importers for Chart of Accounts, stock items, customer ledgers, and opening balances. Our Kathmandu onboarding team also assists with end-to-end data migration.",
  },
  {
    q: "Do you support multi-branch operations and remote access?",
    a: "Yes. Bebasthapan is cloud-native with multi-branch synchronization, consolidated trial balance reports, and role-based permissions, allowing owners to monitor all counters and warehouses in real time from any device.",
  },
  {
    q: "Do you provide on-site setup and employee training?",
    a: "Yes. Enterprise plans include hands-on training for your accountants, cashiers, and store managers either at your Kathmandu/provincial office or via guided remote sessions.",
  },
];

export default function Sales() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    companySize: "11-50",
    currentSoftware: "Excel / Manual",
    message: "",
  });

  const [selectedModules, setSelectedModules] = useState<string[]>([
    "accounting",
    "inventory",
    "sales",
  ]);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setPageSeo({
      title: "Contact Sales & Enterprise Demo | Bebasthapan ERP Nepal",
      description:
        "Contact Bebasthapan for enterprise business ERP software covering Nepal IRD accounting, inventory, sales, purchasing, HR, and business insights.",
      canonicalPath: "/contact-sales",
    });
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
    if (!fullName) {
      toast.error("Please enter your name.");
      return;
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      toast.error("Please provide a valid work email address.");
      return;
    }

    setLoading(true);

    try {
      const selectedNames = ERP_MODULES.filter((m) =>
        selectedModules.includes(m.id)
      )
        .map((m) => m.name)
        .join(", ");

      const payload = {
        name: fullName,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        companyName: formData.companyName.trim(),
        companySize: formData.companySize,
        moduleInterest: selectedNames || "Full ERP Suite",
        message: `${formData.message.trim()} (Current Software: ${formData.currentSoftware})`.trim(),
      };

      const res = await submitContactSales(payload);
      toast.success(res?.message || "Inquiry sent successfully!");
      setSubmitted(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send inquiry. Please reach out via phone or email.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* ── Top Header Navigation Bar ───────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => navigate("/")}
          >
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-2xs">
              <img src="/images/logo.png" alt="Bebasthapan Logo" className="h-7 w-7 object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-900 leading-none">
                Bebasthapan ERP
              </p>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 mt-0.5">
                Enterprise Business Suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link to="/">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs font-medium border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-2xs"
              >
                <ArrowLeft size={13} className="mr-1.5" />
                Back to Home
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="sm"
                className="h-8 px-3.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-2xs"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12 space-y-10">
        {/* ── Section 1: Hero & Strategic Positioning ────────────────── */}
        <div className="text-center max-w-3xl mx-auto space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>NEPAL IRD VERIFIED & CLOUD-NATIVE ERP</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            Talk to Our Enterprise Sales Specialists
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Discover how Bebasthapan consolidates accounting, computerized VAT invoicing, multi-warehouse stock, payroll, and executive business analytics into a unified cloud workspace.
          </p>
        </div>

        {/* ── Section 2: 3 High-Impact KPI Stat Cards ────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {/* Stat 1: IRD Billing */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Annex 8 & 13 Ready
              </p>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                Nepal IRD Certified Billing
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Sequential bill numbering, real-time CBMS API sync, and audit logs.
              </p>
            </div>
          </div>

          {/* Stat 2: Dual Entry */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
              <Receipt size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Double-Entry Core
              </p>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                Automated Financial Ledgers
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Instant trial balance, balance sheet, and customer/vendor reconciliation.
              </p>
            </div>
          </div>

          {/* Stat 3: Multi-Branch & Support */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Multi-Branch Scalable
              </p>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                Kathmandu-Based Support
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Local on-premise training, data migration, and dedicated engineer assistance.
              </p>
            </div>
          </div>
        </div>

        {/* ── Section 3: Dual Column Advisory & Inquiry Form Grid ─────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto items-start">
          {/* ── Left Column: Direct Channels & Capabilities (5 cols) ─── */}
          <div className="lg:col-span-5 space-y-4">
            {/* Card 1: Direct Contact Channels */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Direct Advisory Desk
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reach our solutions consultants directly for enterprise demonstrations.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {/* Email */}
                <a
                  href="mailto:info@bebasthapan.com"
                  className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all group"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Official Inquiries
                    </p>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      info@bebasthapan.com
                    </p>
                  </div>
                </a>

                {/* Phone */}
                <a
                  href="tel:+9779869891980"
                  className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all group"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <Phone size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Direct Sales Line
                    </p>
                    <p className="text-xs font-bold text-slate-900 font-mono group-hover:text-indigo-600 transition-colors">
                      +977 9869891980 / 01-4420000
                    </p>
                  </div>
                </a>

                {/* Location */}
                <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Corporate Headquarters
                    </p>
                    <p className="text-xs font-bold text-slate-900">
                      Kathmandu, Bagmati Province, Nepal
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Business Hours
                    </p>
                    <p className="text-xs font-bold text-slate-900">
                      Sunday – Friday: 9:00 AM – 6:00 PM NPT
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Enterprise Standards Checklist */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Enterprise Inclusions & SLA
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Customized Chart of Accounts matching Nepali accounting practices</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Automated daily offsite cloud backups & disaster recovery</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Support for POS thermal printers, barcode scanners & cash drawers</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Dedicated customer success manager & quarterly performance audits</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Security & Cryptographic Compliance Badge */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-white shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Lock size={13} />
                <span>Financial Data Sovereignty</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                All transaction vouchers and tax registers are recorded with tamper-evident audit logs and role-isolated security controls compliant with Nepal fiscal audit standards.
              </p>
            </div>
          </div>

          {/* ── Right Column: Interactive Inquiry Form (7 cols) ────────── */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 sm:p-7">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-2xs">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Inquiry Submitted Successfully
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                    Thank you, <strong className="text-slate-800">{formData.firstName}</strong>. An enterprise solution specialist from Bebasthapan will contact you within 24 business hours to arrange your customized walkthrough.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-left text-xs max-w-md mx-auto space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Official Email:</span>
                    <span className="font-semibold text-slate-800">{formData.email}</span>
                  </div>
                  {formData.phone && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Contact Phone:</span>
                      <span className="font-semibold text-slate-800 font-mono">{formData.phone}</span>
                    </div>
                  )}
                  {formData.companyName && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Organization:</span>
                      <span className="font-semibold text-slate-800">{formData.companyName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Modules Selected:</span>
                    <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">
                      {ERP_MODULES.filter((m) => selectedModules.includes(m.id))
                        .map((m) => m.name)
                        .join(", ")}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        firstName: "",
                        lastName: "",
                        email: "",
                        phone: "",
                        companyName: "",
                        companySize: "11-50",
                        currentSoftware: "Excel / Manual",
                        message: "",
                      });
                    }}
                    className="text-xs rounded-lg border-slate-200"
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="border-b border-slate-100 pb-4 mb-5">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Schedule an Enterprise Demonstration
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fill out your organization details and select your required ERP modules below.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name (First & Last) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="e.g. Ramesh"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 shadow-2xs focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="e.g. Shrestha"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 shadow-2xs focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                      />
                    </div>
                  </div>

                  {/* Work Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Work Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="e.g. ramesh@company.com"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 shadow-2xs focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g. +977 9841234567"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-xs font-mono text-slate-900 shadow-2xs focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                      />
                    </div>
                  </div>

                  {/* Company Name & Organization Size */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="e.g. Himalayan Trading Pvt. Ltd."
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 shadow-2xs focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Company Size</label>
                      <select
                        name="companySize"
                        value={formData.companySize}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 shadow-2xs focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all font-medium"
                      >
                        <option value="1-10">1 – 10 Employees</option>
                        <option value="11-50">11 – 50 Employees</option>
                        <option value="51-200">51 – 200 Employees</option>
                        <option value="201+">201+ Employees (Enterprise)</option>
                      </select>
                    </div>
                  </div>

                  {/* Current Software in Use */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Current Accounting / Management Tool
                    </label>
                    <select
                      name="currentSoftware"
                      value={formData.currentSoftware}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 shadow-2xs focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all font-medium"
                    >
                      <option value="Tally ERP / TallyPrime">Tally ERP / TallyPrime</option>
                      <option value="Excel Spreadsheets">Excel Spreadsheets</option>
                      <option value="Swastik / Busy / Finacle">Swastik / Busy / Other Desktop Software</option>
                      <option value="Custom In-House System">Custom In-House System</option>
                      <option value="None / New Business Setup">None / New Business Setup</option>
                    </select>
                  </div>

                  {/* Interactive Module Selector Chips */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Select Modules of Interest (Click to toggle)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {ERP_MODULES.map((mod) => {
                        const isSelected = selectedModules.includes(mod.id);
                        const Icon = mod.icon;
                        return (
                          <button
                            key={mod.id}
                            type="button"
                            onClick={() => toggleModule(mod.id)}
                            className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium border text-left transition-all ${
                              isSelected
                                ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                                : "bg-slate-50/70 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                            }`}
                          >
                            <Icon size={14} className={isSelected ? "text-emerald-400" : "text-slate-500"} />
                            <span className="truncate">{mod.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Requirements Textarea */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Specific Requirements or Branch Details
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="e.g. We have 3 retail stores in Kathmandu and Pokhara, need barcode scanning and centralized VAT return filing..."
                      className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 shadow-2xs focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <Send size={13} className={loading ? "animate-pulse" : ""} />
                    <span>{loading ? "Submitting Inquiry..." : "Schedule Consultation & Demo"}</span>
                  </Button>

                  <p className="text-center text-[11px] text-slate-400">
                    Your details are securely dispatched to Bebasthapan's enterprise solutions desk. No spam guaranteed.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* ── Section 4: Enterprise FAQs ─────────────────────────────── */}
        <div className="max-w-4xl mx-auto space-y-4 pt-4 border-t border-slate-200/80">
          <div className="text-center space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Frequently Asked Questions for Nepali Enterprises
            </h2>
            <p className="text-xs text-slate-500">
              Key considerations regarding compliance, migration, and implementation.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-slate-900 hover:bg-slate-50/60 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-slate-900" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/30">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ── Clean System Footer ──────────────────────────────────────── */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Bebasthapan ERP</span>
            <span>•</span>
            <span>Nepal IRD Annex 8/13 Approved Electronic Billing</span>
          </div>
          <div>
            © {new Date().getFullYear()} Bebasthapan Technologies Pvt. Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
