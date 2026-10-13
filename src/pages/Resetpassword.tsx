import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "@/utils/notify";
import { Eye, EyeOff, KeyRound, ArrowRight } from "lucide-react";
import Authsidebar from "@/components/authcomponents/authsidebar";

const API_URL = import.meta.env.VITE_API_URL||"";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmpassword) {
      toast.error("Password and confirm password do not match");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/resetpassword/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error("Token expired or invalid.");
    }
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900 selection:bg-amber-100 selection:text-amber-900 font-sans flex items-center justify-center p-4 sm:p-6 lg:p-8 antialiased">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xl flex flex-col lg:flex-row min-h-[600px]">
        <Authsidebar />

        <div className="flex-1 p-6 sm:p-10 xl:p-12 flex flex-col justify-center bg-white">
          <div className="w-full max-w-md mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-4">
              <KeyRound size={13} className="text-stone-700" />
              <span>NEW PASSWORD SETUP</span>
            </div>

            <h2 className="font-serif text-3xl font-normal tracking-tight text-stone-950 mb-2">
              Set New Admin Password
            </h2>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              Create a new secure password for your administrator account.
            </p>

            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 pr-11 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 focus:outline-none transition-all shadow-2xs"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3.5 text-stone-400 hover:text-stone-700"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 pr-11 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 focus:outline-none transition-all shadow-2xs"
                    value={confirmpassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3.5 text-stone-400 hover:text-stone-700"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-stone-950 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
              >
                <span>Update Password</span>
                <ArrowRight size={15} />
              </button>
            </form>

            {done && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 text-center shadow-2xs">
                ✓ Password reset successfully! Redirecting to login...
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-stone-100 text-xs text-stone-600 text-center">
              <Link to="/login" className="font-bold text-stone-900 hover:underline">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

