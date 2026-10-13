import Authsidebar from "@/components/authcomponents/authsidebar";
import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, ArrowRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL||"";

export default function ForgotPasswordEmployee() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${API_URL}/api/employee/employeereset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900 selection:bg-amber-100 selection:text-amber-900 font-sans flex items-center justify-center p-4 sm:p-6 lg:p-8 antialiased">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xl flex flex-col lg:flex-row min-h-[600px]">
        <Authsidebar />

        <div className="flex-1 p-6 sm:p-10 xl:p-12 flex flex-col justify-center bg-white">
          <div className="w-full max-w-md mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-4">
              <KeyRound size={13} className="text-stone-700" />
              <span>EMPLOYEE ACCOUNT RECOVERY</span>
            </div>

            <h2 className="font-serif text-3xl font-normal tracking-tight text-stone-950 mb-2">
              Reset Employee Password
            </h2>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              Enter your personal or company email address to receive password recovery instructions.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="employee@domain.com"
                  className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 focus:outline-none transition-all shadow-2xs"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-stone-950 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
              >
                <span>Send Reset Link</span>
                <ArrowRight size={15} />
              </button>
            </form>

            {message && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 text-center shadow-2xs">
                {message}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-stone-100 text-xs text-stone-600 space-y-2">
              <p>
                Remember password?{" "}
                <Link to="/employeelogin" className="font-bold text-stone-900 hover:underline">
                  Log in to Employee Portal
                </Link>
              </p>
              <p>
                Admin recovery?{" "}
                <Link to="/forgetpassword" className="font-bold text-stone-900 hover:underline">
                  Switch to Admin Recovery
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
