import { Link } from "react-router-dom";
import {
  ShieldCheck,
  TrendingUp,
  Box,
  Building2,
  CheckCircle2,
  Lock,
} from "lucide-react";

const Authsidebar = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between bg-stone-950 p-8 xl:p-12 text-white relative overflow-hidden">
      {/* Subtle Ambient Glow Effect */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-400/40 bg-amber-500/10 shadow-xs">
              <img
                src="/images/logo.png"
                alt="Bebasthapan Logo"
                className="h-6 w-6 object-contain"
              />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Bebasthapan <span className="font-normal text-stone-400">ERP</span>
            </span>
          </Link>

          <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
            <ShieldCheck size={12} className="text-amber-400" />
            Nepal Business Suite
          </span>
        </div>

        {/* Headline Messaging */}
        <div className="mt-10 max-w-lg">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block" />
            OPERATIONAL CLARITY FOR TEAMS
          </div>

          <h2 className="font-serif text-3xl xl:text-4xl font-normal leading-tight text-stone-100">
            Complete business management for Nepal enterprises.
          </h2>

          <p className="mt-3 text-xs xl:text-sm leading-relaxed text-stone-400">
            Unifying accounting, IRD tax ledgers, multi-branch inventory control, customer dues, and employee attendance in one secure platform.
          </p>
        </div>

        {/* Business Modules Breakdown */}
        <div className="mt-8 space-y-3.5">
          <div className="flex items-start gap-3 text-xs text-stone-300">
            <div className="h-6 w-6 rounded-md bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <ShieldCheck size={14} />
            </div>
            <div>
              <p className="font-semibold text-stone-200">IRD-Verified Tax & Billing</p>
              <p className="text-stone-400 text-[11px] mt-0.5">
                Real-time 13% VAT, TDS calculation, and statutory report formatting.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-stone-300">
            <div className="h-6 w-6 rounded-md bg-stone-900 border border-stone-800 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <TrendingUp size={14} />
            </div>
            <div>
              <p className="font-semibold text-stone-200">Financial & Dues Control</p>
              <p className="text-stone-400 text-[11px] mt-0.5">
                Live customer receivable ledgers, vendor payables & cashflow metrics.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-stone-300">
            <div className="h-6 w-6 rounded-md bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Box size={14} />
            </div>
            <div>
              <p className="font-semibold text-stone-200">Multi-Branch Inventory</p>
              <p className="text-stone-400 text-[11px] mt-0.5">
                Automated low-stock thresholds, warehouse movements & reorders.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Testimonial & Footer */}
      <div className="relative z-10 mt-8 space-y-6 pt-6 border-t border-stone-800/80">
        <div className="rounded-xl bg-stone-900/90 border border-stone-800 p-4 shadow-2xs">
          <p className="font-serif text-xs xl:text-sm leading-relaxed text-stone-200 italic">
            &ldquo;Bebasthapan brings financial clarity and operational discipline to our multi-branch network across Nepal.&rdquo;
          </p>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-400">
            <span className="font-medium text-stone-300">Operations Director, TradeField</span>
            <span className="flex items-center gap-1 text-emerald-400 text-[10px] uppercase font-bold tracking-wider">
              <CheckCircle2 size={12} /> Verified Enterprise
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-stone-500">
          <p>© {new Date().getFullYear()} Bebasthapan ERP Pvt. Ltd.</p>
          <p className="flex items-center gap-1 text-stone-400">
            <Lock size={12} className="text-amber-400" /> ISO 27001 Security
          </p>
        </div>
      </div>
    </div>
  );
};

export default Authsidebar;
