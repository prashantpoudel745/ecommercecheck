import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "@/utils/notify";
import { Link, useNavigate } from "react-router-dom";
import Authsidebar from "@/components/authcomponents/authsidebar";
import { useAuth } from "@/context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL||"";
export default function AdminLoginPage() {
  const { login } = useAuth();
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
      const response = await fetch(`${API_BASE}/api/superadminlogin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      // Parse the JSON response
      const data = await response.json();

      // Handle response based on status
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      // Check if the response has the expected format
      if (!data.success) {
        throw new Error("Login failed: Unexpected response format");
      }
      // Success case
      toast.success("Login successful!");
      // Restore user data from the authenticated session
      if (data.user && data.user._id) {
        login(data.user, data.token);
      }
      // Redirect to dashboard
      navigate("/superadminaccess");
    } catch (error) {
      // Handle errors
      setError(error.message);
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
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-4">
              <span>SUPERADMIN PORTAL</span>
            </div>

            <h2 className="font-serif text-3xl font-normal tracking-tight text-stone-950 mb-2">
              Superadmin Portal Login
            </h2>
            <p className="text-sm text-stone-600 mb-8 leading-relaxed">
              Enter your master administrator credentials to access platform controls.
            </p>

            {error && (
              <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200/80 px-4 py-3 text-xs font-semibold text-rose-700 shadow-2xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5"
                >
                  Superadmin Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 focus:outline-none transition-all shadow-2xs"
                  placeholder="admin@bebasthapan.com"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5"
                >
                  Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 pr-11 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 focus:outline-none transition-all shadow-2xs"
                    placeholder="Enter master password"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center px-3.5 text-stone-400 hover:text-stone-700 transition-colors"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-stone-950 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? "Authenticating..." : "Log In to Master Access"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-stone-100 text-xs text-stone-600 space-y-2">
              <p>
                Standard login?{" "}
                <Link to="/login" className="font-bold text-stone-900 hover:underline">
                  Switch to Business Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

