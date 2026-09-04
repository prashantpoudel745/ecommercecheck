import { BadgeCheck, Building2, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

const Authsidebar = () => {
  return (
    <div className="relative hidden flex-1 overflow-hidden bg-[linear-gradient(160deg,_#0f172a_0%,_#111827_48%,_#1e293b_100%)] px-4 py-4 text-slate-100 lg:flex lg:items-center lg:justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(37,99,235,0.18),_transparent_30%)]" />
      <div className="relative max-w-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-sm backdrop-blur-sm">
            <img src="/images/logo.png" alt="Bebasthapan Logo" className="h-9 w-9 object-contain" />
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight text-white">Bebasthapan ERP</span>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-200 backdrop-blur-sm">
          <LockKeyhole className="h-3.5 w-3.5" />
          Secure operations access 
        </div>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white xl:text-5xl">
          One platform for finance, inventory, CRM, and team control.
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
          Built for owners and operators who need clarity, accountability, and fast decisions across every business workflow.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            { icon: ShieldCheck, title: "Role-based control", text: "Separate access paths for admin, employee, and operations teams." },
            { icon: Building2, title: "Centralized workspace", text: "Everything important sits in one command center with shared visibility." },
            { icon: Sparkles, title: "Fast workflow", text: "Less navigation friction, clearer hierarchy, and stronger focus." },
            { icon: BadgeCheck, title: "Production-ready", text: "Designed to look credible in front of customers and internal teams." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(2,6,23,0.18)] backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-200">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Authsidebar;
