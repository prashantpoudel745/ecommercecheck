import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Users, Package, Clock, ShieldCheck, Zap, Layers, Sparkles, ChevronRight } from "lucide-react";
import { setPageSeo } from "@/utils/seo";

const features = [
  {
    icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
    title: "Accounting & finance",
    description: "Track revenue, expenses, and profitability in one structured view designed for decision-makers."
  },
  {
    icon: <Users className="w-5 h-5 text-indigo-600" />,
    title: "CRM & employees",
    description: "Keep team records, customer relationships, and ownership clear across every department."
  },
  {
    icon: <Package className="w-5 h-5 text-emerald-600" />,
    title: "Inventory control",
    description: "Monitor stock levels, identify low inventory early, and keep fulfillment predictable."
  },
  {
    icon: <Clock className="w-5 h-5 text-amber-600" />,
    title: "Attendance & operations",
    description: "Reduce manual tracking with a clean attendance flow tied directly to daily operations."
  }
];

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    setPageSeo({
      title: "Bebasthapan ERP System for Nepal Businesses | Accounting, Inventory, Sales & CRM",
      description:
        "Bebasthapan ERP is a business management platform for Nepal businesses covering accounting, inventory, sales, purchase, CRM, invoices, HR, attendance, reports, and AI insights.",
      canonicalPath: "/",
    });
    document.body.style.backgroundColor = '#f7f9fc';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_26%),linear-gradient(180deg,_#f7f9fc_0%,_#eef2f7_100%)] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-4 lg:px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
              <img src="/images/logo.png" alt="Bebasthapan Logo" className="h-8 w-8 object-contain" />
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-slate-950">Bebasthapan ERP</p>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Business ERP system</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="hidden rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:inline-flex"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Start managing
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-4 sm:px-4 lg:px-4">
        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-4">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <div className="enterprise-kicker">
              <Sparkles className="h-3.5 w-3.5" />
              Operational clarity for growing teams
            </div>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-7xl lg:leading-[1.02]">
              Bebasthapan ERP system for Nepal businesses.
            </h1>

            <p className="mt-3 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Bebasthapan ERP replaces disconnected accounting software, inventory tools, sales trackers, and customer spreadsheets with one structured business management platform for Nepal businesses. Manage financial reports, stock control, sales, purchase, customer dues, supplier payments, attendance, and AI-powered business insights from one system.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Open dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate("/contact-sales")}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Contact sales
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
              <a
                href="/erp-system-nepal"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                ERP for Nepal
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </a>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ["7 modules", "Accounting to operations"],
                ["ERP reports", "Sales, purchase, and finance"],
                ["AI insights", "Faster business decisions"],
              ].map(([value, label]) => (
                <div key={label} className="metric-card">
                  <div className="text-lg font-semibold text-slate-950">{value}</div>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-sky-500/10 via-transparent to-slate-900/5 blur-3xl" />
            <div className="relative rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Command preview</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950">Executive overview</h2>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Healthy</div>
              </div>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {[
                  ["Revenue", "$128.4k", "Up 14% this month"],
                  ["Inventory risk", "12 items", "Below target threshold"],
                  ["Open tasks", "38", "Assigned across teams"],
                  ["Today", "94%", "Attendance processed"],
                ].map(([label, value, note]) => (
                  <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</p>
                    <div className="mt-2 text-2xl font-semibold text-slate-950">{value}</div>
                    <p className="mt-1 text-sm text-slate-600">{note}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-sky-300" />
                  Controlled workspace
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Admin and employee journeys are separated, accounting and inventory stay connected to sales and purchase activity, and every business module is visible from one secure ERP workspace.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mt-20">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="enterprise-kicker">
                <Layers className="h-3.5 w-3.5" />
                ERP software modules
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                One connected system for daily business operations.
              </h2>
            </div>
            <p className="hidden max-w-xl text-sm leading-6 text-slate-600 lg:block">
              Bebasthapan connects accounting, inventory, CRM, HR, sales, purchase, attendance, and reporting so growing teams can manage operations from one business ERP system.
            </p>
          </div>

          <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                  {feature.icon}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-950">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <div className="enterprise-kicker">
              <Sparkles className="h-3.5 w-3.5" />
              ERP system for Nepal businesses
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Built for companies tired of separate accounting, inventory, and sales tools.
            </h2>
          </div>
          <div className="space-y-3 text-sm leading-7 text-slate-600">
            <p>
              Many businesses in Nepal manage distribution, accounting, inventory, sales, clients, invoices, and team attendance in separate systems. That creates duplicate work, unclear reports, and slow decisions.
            </p>
            <p>
              Bebasthapan brings those core business functions into a single ERP platform so owners and managers can see sales, purchases, stock, receivables, payables, employee activity, and business performance without jumping between disconnected software.
            </p>
            <p>
              The product is currently available for beta testing with a 10-day free trial, including access to the core ERP features so Nepal businesses can evaluate the system before committing.
            </p>
          </div>
        </section>

        <section className="mt-20 grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
            <div className="enterprise-kicker">
              <Zap className="h-3.5 w-3.5" />
              Built for execution
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Built for operators who need calm, not noise.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              The interface prioritizes status, ownership, and next actions so teams can move faster without guessing where to go next.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-700">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Enterprise security
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Fast workflow sync
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-7 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-400">
              <Clock className="h-4 w-4 text-sky-300" />
              User outcome
            </div>
            <blockquote className="mt-4 text-2xl font-medium leading-tight text-slate-100">
              "The product feels organized, deliberate, and credible. It looks like software our team can trust every day."
            </blockquote>
            <div className="mt-3 flex items-center gap-4 border-t border-white/10 pt-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-semibold text-white">
                JD
              </div>
              <div>
                <div className="font-semibold text-white">John Doe</div>
                <div className="text-sm text-slate-400">Operations Director, TechRetail</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
