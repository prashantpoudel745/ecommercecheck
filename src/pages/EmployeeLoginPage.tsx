import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
} from "lucide-react";
import { toast } from "@/utils/notify";
import { Link, useNavigate } from "react-router-dom";
import Authsidebar from "@/components/authcomponents/authsidebar";
import { useAuth } from "@/context/AuthContext";
const API_URL = import.meta.env.VITE_API_URL ||"";

export default function EmployeeLoginPage() {
  const { login } = useAuth();
  const [companyEmail, setCompanyEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Make API request
      const response = await fetch(`${API_URL}/api/employee/employeelogin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password, companyEmail }),
      });
      // Parse the JSON response
      const data = await response.json();

      // Handle response based on status
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.employee && data.employee.id) {
        login(data.employee, data.token);
      } else {
        throw new Error("Invalid response from server");
      }
      navigate("/");
      toast.success("Login successful!");
    } catch (error) {
      // Handle errors
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_34%),linear-gradient(180deg,_#f7f9fc_0%,_#eef2f7_100%)] px-4 py-3 sm:px-4 lg:px-4">
      <div className="absolute left-8 top-8 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-slate-900/5 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:grid-cols-[1fr_1fr]">
          <Authsidebar />

          <div className="flex items-center justify-center px-4 py-4 sm:px-4 lg:px-4">
            <div className="w-full max-w-lg">
              <div className="enterprise-kicker">
                <LockKeyhole className="h-3.5 w-3.5" />
                Employee access portal
              </div>

              <div className="mt-3 space-y-4">
                <h2 className="enterprise-title">
                  Log in with your company credentials.
                </h2>
                <p className="enterprise-subtitle max-w-lg">
                  Employee access is restricted to your company identity, keeping team operations separate from admin control.
                </p>
              </div>

              {/* <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ["Verified", "Company email required"],
                  ["Secure", "Role-aware login"],
                  ["Fast", "Direct dashboard access"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Sparkles className="h-4 w-4 text-sky-600" />
                      {value}
                    </div>
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                      {label}
                    </p>
                  </div>
                ))}
              </div> */}

              {error && (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 shadow-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <div className="space-y-2">
                  <label
                    htmlFor="companyEmail"
                    className="text-sm font-medium text-slate-700"
                  >
                    Company email address
                  </label>
                  <input
                    type="email"
                    id="companyEmail"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-950 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    placeholder="Enter your company email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Personal email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-950 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pr-4 text-slate-950 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition-colors hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-3 text-sm font-medium text-slate-600">
                    <input
                      type="checkbox"
                      id="remember"
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    Remember me on this device
                  </label>
                  <Link
                    to="/forgetpasswordemployee"
                    className="text-sm font-semibold text-sky-700 transition-colors hover:text-sky-800"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <span>Log in to employee dashboard</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              <div className="">
                {/* <div className="flex items-center gap-3 text-sm font-semibold text-slate-900">
                  <BadgeCheck className="h-4 w-4 text-emerald-500" />
                  Access guidance
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Use the company email provided by your organization. If you
                  need admin access instead, switch to the admin login flow.
                </p> */}
                <div className="mt-4 text-sm text-slate-600">
                  Admin login?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-slate-900 transition-colors hover:text-sky-700"
                  >
                    Open admin portal
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

