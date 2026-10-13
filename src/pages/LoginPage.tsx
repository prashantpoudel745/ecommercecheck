import { useState, useEffect } from "react";
import { setPageSeo } from "@/utils/seo";
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "@/utils/notify";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Authsidebar from "@/components/authcomponents/authsidebar";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setPageSeo({
      title: "Login | Bebasthapan ERP System Nepal",
      description:
        "Sign in to your Bebasthapan ERP account to access accounting, inventory, sales, CRM, and business intelligence dashboards.",
      canonicalPath: "/login",
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      if (!data.success) {
        throw new Error("Login failed: Unexpected response format");
      }

      toast.success("Login successful!");
      if (data.user && (data.user._id || data.user.id)) {
        login(data.user, data.token);
      }
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900 selection:bg-amber-100 selection:text-amber-900 font-sans flex items-center justify-center p-4 sm:p-6 lg:p-8 antialiased">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xl flex flex-col lg:flex-row min-h-[640px]">
        {/* Left Sidebar */}
        <Authsidebar />

        {/* Right Form Content */}
        <div className="flex-1 p-6 sm:p-10 xl:p-12 flex flex-col justify-center bg-white">
          <div className="w-full max-w-md mx-auto">
            {/* Top Logo for Mobile */}
            <div className="flex items-center gap-2.5 mb-8 lg:hidden">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 shadow-xs">
                  <img
                    src="/images/logo.png"
                    alt="Bebasthapan"
                    className="h-6 w-6 object-contain"
                  />
                </div>
                <span className="text-base font-bold tracking-tight text-stone-900">
                  Bebasthapan <span className="font-normal text-stone-600">ERP</span>
                </span>
              </Link>
            </div>

            {/* Kicker Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-4">
              <ShieldCheck size={13} className="text-amber-700" />
              <span>ADMIN ACCESS PORTAL</span>
            </div>

            {/* Heading */}
            <h1 className="font-serif text-3xl font-normal tracking-tight text-stone-950 mb-2">
              Log in to your workspace
            </h1>
            <p className="text-sm text-stone-600 mb-8 leading-relaxed">
              Access real-time accounting, inventory control, and enterprise management.
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200/80 px-4 py-3 text-xs font-semibold text-rose-700 shadow-2xs">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 focus:outline-none transition-all shadow-2xs"
                  placeholder="executive@company.com"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5"
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
                    onClick={() => setShowPassword(!showPassword)}
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
                  Remember login session
                </label>
                <Link
                  to="/forgetpassword"
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
                    <span>Log In to Workspace</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Links */}
            <div className="mt-8 pt-6 border-t border-stone-100 text-xs text-stone-600 space-y-2.5">
              <p>
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="font-bold text-stone-900 hover:text-stone-950 transition-colors hover:underline"
                >
                  Start 10-day free trial
                </Link>
              </p>
              <p>
                Employee portal login?{" "}
                <Link
                  to="/employeelogin"
                  className="font-bold text-stone-900 hover:text-stone-950 transition-colors hover:underline"
                >
                  Switch to Employee Access
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
