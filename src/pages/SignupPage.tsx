import { useState, useEffect } from "react";
import { setPageSeo } from "@/utils/seo";
import { Eye, EyeOff, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { CURRENCY_SYMBOL } from "@/utils/formatCurrency";
import Authsidebar from "@/components/authcomponents/authsidebar";

const API_URL = import.meta.env.VITE_API_URL||"";
export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [signatureFile, setSignatureFile] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("Beginners");
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setPageSeo({
      title: "Start 10-Day Free Trial | Bebasthapan ERP Nepal",
      description: "Create your free Bebasthapan ERP account. Get access to accounting, inventory, sales, CRM, and attendance tools with a 10-day trial.",
      canonicalPath: "/signup",
    });
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setError("Please select a valid image file (JPEG, PNG, GIF)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      setSignatureFile(file);
      setError("");
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (
      !name ||
      !email ||
      !companyName ||
      !password ||
      !confirmPassword ||
      !signatureFile
    ) {
      setError("Please fill in all required fields");
      return;
    }
    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);

    try {
      const signupresponse = await fetch(`${API_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          companyName,
          password,
          selectedPlan,
          signature: await convertFileToBase64(signatureFile),
        }),
        credentials: "include",
      });

      const signupData = await signupresponse.json();

      if (!signupresponse.ok) {
        console.error("Signup failed:", signupData.message);
        setError(signupData.message || "Signup failed");
        setIsLoading(false);
        return;
      }

      setSuccess("User created successfully!");
      setIsLoading(false);
      navigate("/login");
    } catch (error) {
      setError(error.message || "An error occurred");
      setIsLoading(false);
    }
  };

  const plans = [
    {
      id: "Beginners",
      name: "Beginners",
      price: "2500",
      features: ["Basic Analytics", "3 Employees", "Email Support"],
    },
    {
      id: "Standard",
      name: "Standard",
      price: "5000",
      features: [
        "All from Beginners",
        "Advanced Analytics",
        "5 Employees",
        "Auto invoice generation for each transaction",
        "Priority Support",
        "Investment and client management",
      ],
    },
    {
      id: "Premium",
      name: "Premium",
      price: "10000",
      features: [
        "All from Beginners",
        "Advanced Analytics",
        "5 Employees",
        "Auto invoice generation for each transaction",
        "Priority Support",
        "Investment and client management",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900 selection:bg-amber-100 selection:text-amber-900 font-sans flex items-center justify-center p-4 sm:p-6 lg:p-8 antialiased">
      <div className="w-full max-w-6xl overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xl flex flex-col lg:flex-row my-4">
        {/* Left Sidebar */}
        <Authsidebar />

        {/* Right Form Content */}
        <div className="flex-1 p-6 sm:p-8 xl:p-10 flex flex-col justify-center bg-white">
          <div className="w-full max-w-xl mx-auto">
            {/* Top Logo for Mobile */}
            <div className="flex items-center gap-2.5 mb-6 lg:hidden">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 shadow-xs">
                  <img src="/images/logo.png" alt="Bebasthapan" className="h-6 w-6 object-contain" />
                </div>
                <span className="text-base font-bold tracking-tight text-stone-900">
                  Bebasthapan <span className="font-normal text-stone-600">ERP</span>
                </span>
              </Link>
            </div>

            {/* Kicker */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-3">
              <ShieldCheck size={13} className="text-emerald-700" />
              <span>10-DAY FREE BETA ACCESS</span>
            </div>

            {/* Heading */}
            <h2 className="font-serif text-3xl font-normal tracking-tight text-stone-950">
              Create your ERP account
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-600 mb-6">
              Start managing your Nepal business operations in minutes with institutional tools.
            </p>

            {/* Feedback Messages */}
            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200/80 shadow-2xs">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 p-3.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200/80 shadow-2xs">
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Full Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-stone-900 text-sm shadow-2xs focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white"
                    placeholder="Ram Bahadur"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Company Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-stone-900 text-sm shadow-2xs focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white"
                    placeholder="Acme Nepal Pvt Ltd"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Email Address <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-stone-900 text-sm shadow-2xs focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white"
                    placeholder="name@company.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-stone-900 text-sm shadow-2xs focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white"
                    placeholder="+977 9800000000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Password <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-stone-300 px-3.5 py-2 pr-10 text-stone-900 text-sm shadow-2xs focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white"
                      placeholder="Min. 8 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-700"
                    >
                      {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Confirm Password <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-lg border border-stone-300 px-3.5 py-2 pr-10 text-stone-900 text-sm shadow-2xs focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white"
                      placeholder="Repeat password"
                      required
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-700"
                    >
                      {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Digital Signature Image <span className="text-rose-600">*</span>
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-stone-200 file:text-xs file:font-semibold file:bg-stone-50 file:text-stone-800 hover:file:bg-stone-100 cursor-pointer"
                />
                {signatureFile ? (
                  <p className="mt-1 text-xs font-semibold text-emerald-700">
                    ✓ Selected: {signatureFile.name}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-stone-400">
                    PNG/JPEG max 5MB. Used for IRD invoice printing authorization.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Select Subscription Plan
                </label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3.5 py-2 text-stone-900 text-sm shadow-2xs focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white"
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} — {CURRENCY_SYMBOL} {plan.price}/month
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-start pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-stone-950 focus:ring-stone-900 accent-stone-950 mt-0.5"
                />
                <label htmlFor="terms" className="ml-2 text-xs text-stone-600 leading-normal cursor-pointer">
                  I agree to the{" "}
                  <a href="#" className="font-semibold text-stone-900 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="font-semibold text-stone-900 hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || !agreedToTerms}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold text-white shadow-xs transition-all ${
                  !agreedToTerms || isLoading
                    ? "bg-stone-400 cursor-not-allowed"
                    : "bg-stone-950 hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating ERP account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Enterprise Account</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 pt-5 border-t border-stone-100 text-center">
              <p className="text-xs text-stone-600">
                Already have an account?{" "}
                <Link to="/login" className="font-bold text-stone-900 hover:text-stone-950 transition-colors hover:underline">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

