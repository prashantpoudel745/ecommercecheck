import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import Authsidebar from "@/components/authcomponents/authsidebar";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/utils/notify";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function VerifyEmailPage() {
  const { token: paramToken } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const stateEmail = (location.state as { email?: string } | null)?.email || "";
  const queryEmail = searchParams.get("email") || "";
  const tokenFromUrl = paramToken || searchParams.get("token") || "";

  const [email, setEmail] = useState(stateEmail || queryEmail);
  const [status, setStatus] = useState<"pending" | "verifying" | "verified" | "error">(
    tokenFromUrl ? "verifying" : "pending"
  );
  const [message, setMessage] = useState(
    tokenFromUrl
      ? "Verifying your email address..."
      : "We sent a confirmation link to your email address. Please click the link to verify your account."
  );
  const [resending, setResending] = useState(false);
  const attemptedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!tokenFromUrl || attemptedTokenRef.current === tokenFromUrl) return;
    attemptedTokenRef.current = tokenFromUrl;

    let cancelled = false;
    const verify = async () => {
      setStatus("verifying");
      try {
        const response = await fetch(`${API_BASE}/api/verify-email/${encodeURIComponent(tokenFromUrl)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await response.json();
        if (cancelled) return;

        if (!response.ok || !data.success) {
          setStatus("error");
          setMessage(data.message || "Verification link is invalid or has expired.");
          return;
        }

        setStatus("verified");
        setMessage(data.message || "Your email has been verified!");
        toast.success("Email verified! Redirecting to your dashboard...");

        setTimeout(() => {
          if (data.user && (data.user._id || data.user.id)) {
            login(data.user);
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/login", { replace: true });
          }
        }, 1200);
      } catch {
        if (cancelled) return;
        setStatus("error");
        setMessage("Could not verify your email. Please try again or request a new link.");
      }
    };

    void verify();
    return () => {
      cancelled = true;
    };
  }, [tokenFromUrl, login, navigate]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setResending(true);
    try {
      const response = await fetch(`${API_BASE}/api/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to resend confirmation email.");
      }
      toast.success(data.message || "Confirmation email sent!");
      setMessage("A fresh confirmation link has been sent. Please check your inbox.");
    } catch (err: any) {
      toast.error(err.message || "Could not resend confirmation email.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900 selection:bg-amber-100 selection:text-amber-900 font-sans flex items-center justify-center p-4 sm:p-6 lg:p-8 antialiased">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xl flex flex-col lg:flex-row min-h-[580px]">
        <Authsidebar />

        <div className="flex-1 p-6 sm:p-10 xl:p-12 flex flex-col justify-center bg-white">
          <div className="w-full max-w-md mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-4">
              {status === "verified" ? (
                <CheckCircle2 size={13} className="text-emerald-700" />
              ) : status === "error" ? (
                <AlertCircle size={13} className="text-rose-600" />
              ) : (
                <Mail size={13} className="text-amber-700" />
              )}
              <span>EMAIL VERIFICATION</span>
            </div>

            <h1 className="font-serif text-3xl font-normal tracking-tight text-stone-950 mb-2">
              {status === "verified"
                ? "Email confirmed"
                : status === "verifying"
                ? "Verifying your email"
                : status === "error"
                ? "Verification failed"
                : "Check your email"}
            </h1>

            <p className="text-sm text-stone-600 mb-6 leading-relaxed">{message}</p>

            {status === "verifying" && (
              <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700 mb-6">
                <Loader2 className="h-5 w-5 animate-spin text-stone-800" />
                <span>Confirming your verification link...</span>
              </div>
            )}

            {status === "verified" && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 mb-6">
                Your account is verified. Taking you to your workspace...
              </div>
            )}

            {(status === "pending" || status === "error") && (
              <form onSubmit={handleResend} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 focus:outline-none transition-all shadow-2xs"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={resending}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60 transition-all shadow-xs"
                >
                  {resending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending confirmation...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={15} />
                      <span>Resend Confirmation Email</span>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
              <Link to="/login" className="font-semibold text-stone-900 hover:underline inline-flex items-center gap-1">
                <span>Back to Login</span>
                <ArrowRight size={13} />
              </Link>
              {status === "verified" && (
                <Link to="/dashboard" className="font-semibold text-emerald-700 hover:underline">
                  Open Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
