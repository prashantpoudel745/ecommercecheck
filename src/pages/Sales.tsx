import { useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowLeft, Send, Sparkles, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { setPageSeo } from "@/utils/seo";

export default function Sales() {
  const navigate = useNavigate();

  useEffect(() => {
    setPageSeo({
      title: "Contact Bebasthapan ERP | Business ERP Software Demo",
      description:
        "Contact Bebasthapan for business ERP software covering accounting, inventory, sales, purchase, CRM, HR, attendance, and business insights.",
      canonicalPath: "/contact-sales",
    });
    document.body.style.backgroundColor = '#f7f9fc';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_26%),linear-gradient(180deg,_#f7f9fc_0%,_#eef2f7_100%)] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/home")}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-950 text-sm font-semibold text-white shadow-sm">
              B
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-slate-950">Bebasthapan ERP</p>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Business ERP system</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/home")}
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to home
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="enterprise-kicker mx-auto w-fit">
            <Sparkles className="h-3.5 w-3.5" />
            Talk to sales
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl lg:leading-[1.05]">
            Talk to Bebasthapan about business ERP software.
          </h1>

          <p className="mt-6 text-base leading-7 text-slate-600 sm:text-lg">
            Ready to connect accounting, inventory, sales, purchase, CRM, HR, attendance, and business insights? Contact Bebasthapan to discuss ERP software for your business.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-950">Contact information</h3>

              <div className="mt-6 space-y-5">
                <a href="mailto:prashantpoudel745@gmail.com" className="flex items-start gap-4 group">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 transition-transform group-hover:-translate-y-0.5">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Email us at</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950 group-hover:text-blue-600 transition-colors">
                      prashantpoudel745@gmail.com
                    </p>
                  </div>
                </a>

                <a href="tel:9869891980" className="flex items-start gap-4 group">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 transition-transform group-hover:-translate-y-0.5">
                    <Phone className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Call us directly</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950 group-hover:text-indigo-600 transition-colors">
                      9869891980
                    </p>
                  </div>
                </a>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500"> Location</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">Kathmandu, Nepal</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-7 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-400">
                <ShieldCheck className="h-4 w-4 text-sky-300" />
                Why upgrade to enterprise
              </div>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">                 
                <li className="flex gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                  24/7 priority support
                </li>
                <li className="flex gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                  Advanced security and compliance features
                </li>
                <li className="flex gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                  Unlimited team members and locations
                </li>
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-slate-950">Send us a message</h3>

            <form className="mt-6 space-y-5" onSubmit={(e) => { e.preventDefault(); }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">First name</label>
                  <input
                    type="text"
                    placeholder="John"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-slate-950/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Last name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-slate-950/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Work email</label>
                <input
                  type="email"
                  placeholder="john@company.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-slate-950/10"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Company size</label>
                <select className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 transition-all focus:outline-none focus:ring-2 focus:ring-slate-950/10">
                  <option value="" disabled selected className="text-slate-400">Select company size...</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201+">201+ employees</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">How can we help?</label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your needs..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-slate-950/10"
                ></textarea>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Send message
                <Send className="h-4 w-4" />
              </button>

              <p className="text-center text-xs text-slate-500">
                By submitting this form, you agree to our privacy policy and terms of service.
              </p>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
