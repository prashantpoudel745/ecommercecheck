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
        throw new Error(data.message || data.error || "Login failed");
      }

      if (data.employee && data.employee.id) {
        login(data.employee, data.token);
      } else {
        throw new Error("Invalid response from server");
      }
      navigate("/");
      toast.success("Login successful!");
    } catch (error: any) {
      // Handle errors
      setError(error.message);
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900 selection:bg-amber-100 selection:text-amber-900 font-sans flex items-center justify-center p-4 sm:p-6 lg:p-8 antialiased">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xl flex flex-col lg:flex-row min-h-[640px]">
        <Authsidebar />

        <div className="flex-1 p-6 sm:p-10 xl:p-12 flex flex-col justify-center bg-white">
          <div className="w-full max-w-md mx-auto">
            {/* Kicker */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-4">
              <LockKeyhole size={13} className="text-stone-700" />
              <span>EMPLOYEE ACCESS PORTAL</span>
            </div>

            <h2 className="font-serif text-3xl font-normal tracking-tight text-stone-950 mb-2">
              Employee Portal Login
            </h2>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              Log in with your company and personal credentials to access employee operations.
            </p>

            {error && (
              <div className="mb-5 rounded-xl border border-rose-200/80 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 shadow-2xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="companyEmail"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1"
                >
                  Company Email Address
                </label>
                <input
                  type="email"
                  id="companyEmail"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 focus:outline-none transition-all shadow-2xs"
                  placeholder="company@organisation.com"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1"
                >
                  Personal Employee Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 focus:outline-none transition-all shadow-2xs"
                  placeholder="employee@domain.com"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 pr-11 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 focus:outline-none transition-all shadow-2xs"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center px-3.5 text-stone-400 hover:text-stone-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs font-medium text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900 accent-stone-900"
                  />
                  Remember session
                </label>
                <Link
                  to="/forgetpasswordemployee"
                  className="text-xs font-semibold text-amber-900 hover:text-amber-950 transition-colors hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-stone-950 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Log in to Employee Portal</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-stone-100 text-xs text-stone-600">
              Admin login required?{" "}
              <Link
                to="/login"
                className="font-bold text-stone-900 hover:text-stone-950 transition-colors hover:underline"
              >
                Open Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

