import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers,
  Clock,
  Box,
  TrendingUp,
  AlertTriangle,
  Users,
  CheckCircle2,
  FileText,
  Building2,
  Compass,
  CheckCheck,
  Lock,
  Zap,
  Menu,
  X,
  User,
  ExternalLink
} from "lucide-react";
import { setPageSeo } from "@/utils/seo";

export default function Home() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [evalEmail, setEvalEmail] = useState("");
  const [evalCity, setEvalCity] = useState("Kathmandu Valley (HQ)");

  useEffect(() => {
    setPageSeo({
      title: "Bebasthapan ERP system for Nepal businesses | Enterprise Suite",
      description:
        "Bebasthapan ERP replaces disconnected accounting software, inventory tools, sales trackers, and customer spreadsheets with one structured business management platform for Nepal businesses.",
      canonicalPath: "/",
    });
  }, []);

  const handleEvaluationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/signup");
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900 selection:bg-amber-100 selection:text-amber-900 font-sans antialiased">

      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          
          {/* Brand & Suite Tag */}
          <div className="flex items-center gap-3 shrink-0 mr-4 xl:mr-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 shadow-xs">
                <img src="/images/logo.png" alt="Bebasthapan" className="h-6 w-6 object-contain" />
              </div>
              <span className="text-base font-bold tracking-tight text-stone-900">
                Bebasthapan <span className="font-normal text-stone-600">ERP</span>
              </span>
            </Link>

            <span className="hidden xl:inline-flex items-center rounded-md border border-amber-300/80 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
              ERP for Every Business
            </span>
          </div>      

          {/* Actions & Status Pill */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">

            <a
              href="#contact"
              className="text-[13px] font-medium text-stone-600 hover:text-stone-950 transition-colors px-2 py-1"
            >
              Contact Sales
            </a>

            <Link
              to="/login"
              className="text-[13px] font-medium text-stone-700 hover:text-stone-950 transition-colors px-2 py-1"
            >
              Log In
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-stone-800 transition-all shadow-xs"
            >
              <span>Open Dashboard</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              to="/login"
              className="text-xs font-semibold px-2.5 py-1.5 text-stone-700 hover:text-stone-950"
            >
              Log In
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-stone-600 hover:text-stone-900 rounded-md border border-stone-200"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-b border-stone-200 bg-white px-4 pt-3 pb-5 space-y-3">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-stone-600">
              <a href="#modules" onClick={() => setMobileMenuOpen(false)}>Modules & Solutions</a>
              <a href="#accounting" onClick={() => setMobileMenuOpen(false)}>Finance & Accounting</a>
              <a href="#inventory" onClick={() => setMobileMenuOpen(false)}>Inventory & Operations</a>
              <a href="#compliance" onClick={() => setMobileMenuOpen(false)}>Nepal Compliance</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Enterprise Pricing</a>
            </nav>
            <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
              <Link
                to="/dashboard"
                className="w-full text-center py-2.5 px-4 bg-stone-900 text-white rounded-lg text-sm font-semibold"
              >
                Open Dashboard
              </Link>
              <Link
                to="/signup"
                className="w-full text-center py-2 px-4 border border-stone-200 text-stone-800 rounded-lg text-sm font-medium"
              >
                Start 10-Day Free Trial
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="space-y-16 lg:space-y-24 py-8 lg:py-12">

        {/* ── 1. Hero Section ────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* Left Column: Value Messaging */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Kicker */}
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-800">
                <span className="h-2 w-2 rounded-[2px] bg-emerald-600 inline-block" />
                OPERATIONAL CLARITY FOR GROWING TEAMS
              </div>

              {/* Classical Headline */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[54px] font-normal tracking-tight text-stone-950 leading-[1.12]">
                Bebasthapan ERP system for Nepal businesses.
              </h1>

              {/* Sub-headline paragraph */}
              <p className="text-stone-600 text-base lg:text-[17px] leading-relaxed max-w-2xl">
                Bebasthapan ERP replaces disconnected accounting software, inventory tools, sales trackers, and customer spreadsheets with one structured business management platform for Nepal businesses. Manage financial reports, stock control, sales, purchase, customer dues, supplier payments, attendance, and AI-powered business insights from one system.
              </p>

              {/* Buttons and Trust Pill */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg bg-stone-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 transition-all shadow-xs"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight size={14} />
                </Link>

                <a
                  href="#contact"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
                >
                  <span>Contact sales</span>
                  <ChevronRight size={14} />
                </a>

                <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200/90 bg-amber-50/80 px-3.5 py-2 text-xs font-semibold text-amber-900">
                  <ShieldCheck size={14} className="text-amber-700" />
                  <span>ERP for Nepal</span>
                </div>
              </div>

              {/* 3 Metrics Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-stone-200/60">
                <div className="p-3.5 rounded-xl border border-stone-200/80 bg-white shadow-2xs">
                  <p className="text-base font-bold text-stone-900">7 modules</p>
                  <p className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider mt-0.5">
                    ACCOUNTING TO OPERATIONS
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200/80 bg-white shadow-2xs">
                  <p className="text-base font-bold text-stone-900">ERP reports</p>
                  <p className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider mt-0.5">
                    SALES, PURCHASE, VAT, FINANCE
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200/80 bg-white shadow-2xs">
                  <p className="text-base font-bold text-stone-900">AI insights</p>
                  <p className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider mt-0.5">
                    FASTER BUSINESS DECISIONS
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: Executive Overview Panel */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-sm">
                
                {/* Header with status badge */}
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400">
                      EXECUTIVE / REAL-TIME
                    </p>
                    <h3 className="text-lg font-bold text-stone-900 mt-0.5">
                      Executive overview
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    HEALTHY
                  </span>
                </div>

                {/* 2x2 Metric Grid */}
                <div className="grid grid-cols-2 gap-4 py-5 border-b border-stone-100">
                  
                  {/* Revenue */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      <span>REVENUE</span>
                      <Calendar size={13} className="text-amber-600" />
                    </div>
                    <p className="text-2xl font-bold tracking-tight text-stone-900 tabular-nums">
                      $128.4k
                    </p>
                    <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <span>↗</span> Up 14% this month
                    </p>
                  </div>

                  {/* Inventory Risk */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      <span>INVENTORY RISK</span>
                      <Box size={13} className="text-amber-600" />
                    </div>
                    <p className="text-2xl font-bold tracking-tight text-stone-900 tabular-nums">
                      12 items
                    </p>
                    <p className="text-xs font-semibold text-amber-600">
                      ⚠ Below target threshold
                    </p>
                  </div>

                  {/* Open Tasks */}
                  <div className="space-y-1 pt-2">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      <span>OPEN TASKS</span>
                      <Layers size={13} className="text-stone-400" />
                    </div>
                    <p className="text-2xl font-bold tracking-tight text-stone-900 tabular-nums">
                      38
                    </p>
                    <p className="text-xs text-stone-500">
                      Assigned across teams
                    </p>
                  </div>

                  {/* Yield */}
                  <div className="space-y-1 pt-2">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-400">
                      <span>YIELD</span>
                      <Clock size={13} className="text-stone-400" />
                    </div>
                    <p className="text-2xl font-bold tracking-tight text-stone-900 tabular-nums">
                      94%
                    </p>
                    <p className="text-xs text-stone-500">
                      Attendance processed
                    </p>
                  </div>
                </div>

                {/* Dark Controlled Workspace Box */}
                <div className="mt-5 rounded-xl bg-stone-950 p-4 text-white shadow-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    <ShieldCheck size={14} />
                    <span>CONTROLLED WORKSPACE</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-stone-300">
                    Admin and employee journeys are separated, accounting and inventory stay connected to sales and purchase admin, and every business module is visible from one secure ERP workspace.
                  </p>
                  <div className="mt-3.5 flex flex-wrap items-center gap-3 pt-3 border-t border-stone-800 text-[10px] font-bold uppercase tracking-widest text-amber-300/90">
                    <span>ADMIN</span>
                    <span>•</span>
                    <span>APPLIED</span>
                    <span>•</span>
                    <span>INVENTORY</span>
                    <span>•</span>
                    <span>BRANCHES</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ── 2. One Connected System (4 Module Cards) ────────────────── */}
        <section id="modules" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-stone-200/80">
            <div>
              <span className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-stone-600 shadow-2xs">
                ERP SOFTWARE MODULES
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-stone-950 mt-3">
                One connected system for daily business operations.
              </h2>
            </div>
            <p className="text-sm sm:text-base text-stone-600 max-w-md leading-relaxed">
              Bebasthapan connects accounting, inventory, CRM, HR, sales, purchase, attendance, and reporting so growing teams can manage operations from one business ERP system.
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
            
            {/* 1: Accounting & finance */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-all">
              <div>
                <div className="h-10 w-10 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-center text-stone-700 mb-4">
                  <Compass size={18} />
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  Accounting & finance
                </h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  Track revenue, expenses, and tax liability in real-time structured ledgers designed for decision-makers.
                </p>
              </div>

              {/* Sub-card data box */}
              <div className="mt-5 rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-stone-400">
                  <span>STATUTORY LEDGER</span>
                  <span className="text-emerald-700 font-bold">18% ACTIVE</span>
                </div>
                <div className="flex justify-between items-center text-stone-700 font-medium">
                  <span>Gross Sales VAT (13%)</span>
                  <span className="font-semibold text-stone-900">रु 74,000</span>
                </div>
                <div className="flex justify-between items-center text-stone-700 font-medium">
                  <span>Withholding Tax (TDS 1.5%)</span>
                  <span className="font-semibold text-stone-900">रु 4,300</span>
                </div>
                <div className="pt-2 border-t border-stone-200/60 text-[11px] font-semibold text-emerald-700">
                  Bill Sync Status: Validated
                </div>
              </div>
            </div>

            {/* 2: CRM & employees */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-all">
              <div>
                <div className="h-10 w-10 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-center text-stone-700 mb-4">
                  <Users size={18} />
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  CRM & employees
                </h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  Keep team records, customer relationships, and ownership clear across every department.
                </p>
              </div>

              {/* Sub-card data box */}
              <div className="mt-5 rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-stone-400">
                  <span>CUSTOMER DUES LEDGER</span>
                  <span className="text-stone-700 font-bold">42 ACCOUNTS</span>
                </div>
                <div className="flex justify-between items-center text-stone-700 font-medium">
                  <span className="truncate pr-1">Bhatbhateni Traders East</span>
                  <span className="font-semibold text-rose-600 shrink-0">रु 1.4M Overdue</span>
                </div>
                <div className="flex justify-between items-center text-stone-700 font-medium">
                  <span className="truncate pr-1">Pokhara Wholesale Hub</span>
                  <span className="font-semibold text-emerald-700 shrink-0">रु 840K Valid</span>
                </div>
                <div className="pt-2 border-t border-stone-200/60 text-[11px] text-stone-600 truncate">
                  Assigned Lead: Sharma (Kathmandu)
                </div>
              </div>
            </div>

            {/* 3: Inventory control */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-all">
              <div>
                <div className="h-10 w-10 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-center text-stone-700 mb-4">
                  <Box size={18} />
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  Inventory control
                </h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  Monitor stock levels, identify low inventory early, and keep fulfillment predictable.
                </p>
              </div>

              {/* Sub-card data box */}
              <div className="mt-5 rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-stone-400">
                  <span>STOCK DISPATCH QUEUE</span>
                  <span className="text-stone-700 font-bold">1,180 ITEMS</span>
                </div>
                <div className="flex justify-between items-center text-stone-700 font-medium">
                  <span className="truncate pr-1">Industrial Grade Steel</span>
                  <span className="font-semibold text-rose-600 shrink-0">40 UNITS (CRITICAL)</span>
                </div>
                <div className="flex justify-between items-center text-stone-700 font-medium">
                  <span className="truncate pr-1">Packaging Kraft Paper</span>
                  <span className="font-semibold text-emerald-700 shrink-0">420 UNITS (SAFE)</span>
                </div>
                <div className="pt-2 border-t border-stone-200/60 text-[11px] text-stone-600 truncate">
                  Automated Reorder: PO-1219 Generated
                </div>
              </div>
            </div>

            {/* 4: Attendance & operations */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-all">
              <div>
                <div className="h-10 w-10 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-center text-stone-700 mb-4">
                  <CheckCheck size={18} />
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  Attendance & operations
                </h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  Reduce manual tracking with a clean attendance flow that brings clarity to daily operations.
                </p>
              </div>

              {/* Sub-card data box */}
              <div className="mt-5 rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-stone-400">
                  <span>WORKFORCE SHIFT FLOW</span>
                  <span className="text-stone-700 font-bold">1,220 TOTAL</span>
                </div>
                <div className="flex justify-between items-center text-stone-700 font-medium">
                  <span>Thapathali HQ Floor</span>
                  <span className="font-semibold text-emerald-700">92 / 98 PRESENT</span>
                </div>
                <div className="flex justify-between items-center text-stone-700 font-medium">
                  <span>Biratnagar Logistics Hub</span>
                  <span className="font-semibold text-emerald-700">24 / 24 PRESENT</span>
                </div>
                <div className="pt-2 border-t border-stone-200/60 text-[11px] text-stone-600">
                  Payroll Sync: Auto-apportioned
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── 3. Built for Companies Tired of Separate Tools ─────────── */}
        <section id="compliance" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-stone-600 shadow-2xs">
                ERP SYSTEM FOR NEPAL BUSINESSES
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-stone-950">
                Built for companies tired of separate accounting, inventory, and sales tools.
              </h2>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                Many businesses in Nepal manage distribution, accounting, inventory, sales, clients, invoices, and team attendance in separate systems. That creates duplicate work, unclear reports, and slow decisions.
              </p>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                Bebasthapan brings these core business functions into a single ERP platform so owners and managers can see sales, purchases, stock, receivables, payables, employee activity, and business performance without jumping between disconnected software.
              </p>

              {/* 4 Check Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-stone-800">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Eliminate double data entry between sales & VAT ledgers</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-stone-800">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Direct reconciliation of customer dues and credit limits</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-stone-800">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Branch-wise inventory tracking across Kathmandu & regions</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-stone-800">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Automated IRD compliant reporting formats</span>
                </div>
              </div>
            </div>

            {/* Right Evaluation Form Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-7 shadow-sm">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
                  INSTITUTIONAL EVALUATION
                </div>

                <h3 className="text-lg font-bold text-stone-900 mt-2">
                  Evaluate Bebasthapan for your business operations.
                </h3>

                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  The product is currently available for beta testing with a 10-day free trial, including access to the core ERP features so Nepal businesses can evaluate the system before committing.
                </p>

                <form onSubmit={handleEvaluationSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      WORK EMAIL / CORPORATE DOMAIN
                    </label>
                    <input
                      type="email"
                      value={evalEmail}
                      onChange={(e) => setEvalEmail(e.target.value)}
                      placeholder="executive@yourcompany.com.np"
                      className="mt-1 block w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 shadow-2xs focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      PRIMARY REGION / PRINCIPAL BRANCH CITY
                    </label>
                    <select
                      value={evalCity}
                      onChange={(e) => setEvalCity(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 shadow-2xs focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white"
                    >
                      <option value="Kathmandu Valley (HQ)">Kathmandu Valley (HQ)</option>
                      <option value="Pokhara">Pokhara Gandaki Hub</option>
                      <option value="Biratnagar">Biratnagar Morang Hub</option>
                      <option value="Birgunj">Birgunj Parsa Hub</option>
                      <option value="Chitwan">Narayangarh / Chitwan</option>
                      <option value="Butwal">Butwal / Bhairahawa</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-stone-950 py-3 px-4 text-sm font-semibold text-white hover:bg-stone-800 transition-all shadow-xs"
                  >
                    <span>Start managing</span>
                    <ArrowRight size={14} />
                  </button>
                </form>

                <div className="mt-4 flex items-center justify-between text-[11px] text-stone-400 pt-3 border-t border-stone-100">
                  <span>No credit card required</span>
                  <span>•</span>
                  <span>10-day full beta access</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── 4. Built for Operators Who Need Calm (Quote & Security) ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Box: Built for calm */}
            <div className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xs flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-stone-600">
                  BUILT FOR EXECUTIVES
                </span>

                <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-stone-950 mt-4">
                  Built for operators who need calm, not noise.
                </h2>

                <p className="text-sm sm:text-base text-stone-600 mt-3 leading-relaxed">
                  The interface prioritizes status, ownership, and next actions so teams can move faster without guessing where to go next.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-stone-100">
                <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-4 space-y-1">
                  <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                    <Lock size={15} className="text-stone-700" />
                    <span>Enterprise security</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Strict role barriers & audit trails
                  </p>
                </div>

                <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-4 space-y-1">
                  <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                    <Zap size={15} className="text-stone-700" />
                    <span>Fast workflow sync</span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Real-time ledger updates
                  </p>
                </div>
              </div>
            </div>

            {/* Right Box: Dark Verified Controller Quote */}
            <div className="lg:col-span-5 rounded-2xl bg-stone-950 p-6 sm:p-8 text-white flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />
                    CASE OUTCOME
                  </span>
                  <span className="text-stone-400">VERIFIED CONTROLLER</span>
                </div>

                <p className="mt-8 font-serif text-xl sm:text-2xl font-normal leading-relaxed text-stone-100">
                  &ldquo;The product feels organized, deliberate, and credible. It looks like software our team can trust every day.&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3.5 mt-8 pt-6 border-t border-stone-800">
                <div className="h-10 w-10 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-sm text-stone-200">
                  JD
                </div>
                <div>
                  <p className="text-sm font-bold text-white">John Doe</p>
                  <p className="text-xs text-stone-400">Operations Director, TradeField</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── 5. Bottom Ready Banner ─────────────────────────────────── */}
        <section id="contact" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-stone-900">
                  Ready to standardize operations across Nepal?
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Join leading distribution networks, commercial retailers, and multi-branch teams on Bebasthapan ERP.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <Link
                to="/login"
                className="flex-1 sm:flex-none text-center rounded-lg border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="flex-1 sm:flex-none text-center rounded-lg bg-stone-950 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-800 transition-colors shadow-2xs"
              >
                Start managing
              </Link>
            </div>

          </div>
        </section>

      </main>

      {/* ── 6. Classical Enterprise Footer ─────────────────────────── */}
      <footer className="border-t border-stone-200 bg-white pt-12 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-stone-100">
            
            {/* Column 1: Brand & Credentials */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-amber-300 bg-amber-50">
                  <img src="/images/logo.png" alt="Logo" className="h-5 w-5 object-contain" />
                </div>
                <span className="text-base font-bold text-stone-900">Bebasthapan ERP</span>
              </div>

              <p className="text-xs text-stone-500 leading-relaxed max-w-sm">
                Institutional-grade enterprise resource planning tailored for regulatory precision, multi-branch treasury, supply chain agility, and high-frequency trade across Nepal and South Asia.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-[10px] font-semibold text-stone-600">
                  <ShieldCheck size={11} className="text-stone-700" />
                  IRD & VAT Compliant
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-[10px] font-semibold text-stone-600">
                  <Lock size={11} className="text-stone-700" />
                  ISO 27001 Security
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-[10px] font-semibold text-stone-600">
                  NPR / USD Multi-Currency
                </span>
              </div>
            </div>

            {/* Column 2: Enterprise Modules */}
            <div className="md:col-span-2 sm:col-span-4 space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                ENTERPRISE MODULES
              </p>
              <ul className="space-y-1.5 text-xs text-stone-600">
                <li><a href="#modules" className="hover:text-stone-900 transition-colors">Treasury & Ledger</a></li>
                <li><a href="#modules" className="hover:text-stone-900 transition-colors">Supply Chain & WMS</a></li>
                <li><a href="#modules" className="hover:text-stone-900 transition-colors">Manufacturing & BOM</a></li>
                <li><a href="#modules" className="hover:text-stone-900 transition-colors">IRD Real-Time Sync</a></li>
              </ul>
            </div>

            {/* Column 3: Compliance & Legal */}
            <div className="md:col-span-2 sm:col-span-4 space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                COMPLIANCE & LEGAL
              </p>
              <ul className="space-y-1.5 text-xs text-stone-600">
                <li><a href="#" className="hover:text-stone-900 transition-colors">Inland Revenue (Nepal)</a></li>
                <li><a href="#" className="hover:text-stone-900 transition-colors">Customs & EXIM Billing</a></li>
                <li><a href="#" className="hover:text-stone-900 transition-colors">Statutory Audit Logs</a></li>
                <li><a href="#" className="hover:text-stone-900 transition-colors">Data Residency Policies</a></li>
              </ul>
            </div>

            {/* Column 4: Kathmandu HQ */}
            <div className="md:col-span-3 sm:col-span-4 space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                KATHMANDU HQ
              </p>
              <div className="text-xs text-stone-600 space-y-1 leading-relaxed">
                <p>Trade Tower, Thapathali</p>
                <p>Kathmandu, Bagmati, Nepal</p>
                <p className="pt-1 text-stone-900 font-medium">Direct: +977 1 4200000</p>
                <p className="text-stone-500">Sales: enterprise@bebasthapan.com</p>
              </div>
            </div>

          </div>

          {/* Copyright bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
            <p>© {new Date().getFullYear()} Bebasthapan Technologies Pvt. Ltd. All corporate rights reserved.</p>
            <div className="flex items-center gap-5">
              <a href="#" className="hover:text-stone-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-stone-900 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-stone-900 transition-colors">Security Whitepaper</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
