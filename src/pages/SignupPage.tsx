import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Authsidebar from "@/components/authcomponents/authsidebar";
import { CURRENCY_SYMBOL } from "@/utils/formatCurrency";

const API_URL = import.meta.env.VITE_API_URL;
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setError("Please select a valid image file (JPEG, PNG, GIF)");
        return;
      }

      // Validate file size (max 5MB)
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
        setIsLoading(false); // <-- stop loading
        return;
      }

      setSuccess("User created successfully!");
      setIsLoading(false); // <-- stop loading after success
      navigate("/login");
    } catch (error) {
      setError(error.message || "An error occurred");
      setIsLoading(false); // <-- stop loading on error
    }
  };

  // uncomment this code in production

  // const handleSubmit = async () => {
  //   setError("");
  //   setSuccess("");

  //   if (!name || !email || !companyName) {
  //     setError("Please fill in all required fields");
  //     return;
  //   }
  //   if (!agreedToTerms) {
  //     setError("Please agree to the terms and conditions");
  //     return;
  //   }
  //   if (password.length < 8) {
  //     setError("Password must be at least 8 characters long");
  //     return;
  //   }
  //   if (password !== confirmPassword) {
  //     setError("Passwords do not match");
  //     return;
  //   }

  //   setIsLoading(true);

  //   try {
  //     // Check if email already exists
  //     const checkuserResponse = await fetch(`${API_URL}/api/checkuser`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       credentials: "include",
  //       body: JSON.stringify({ email }),
  //     });

  //     if (!checkuserResponse.ok) {
  //       const errorData = await checkuserResponse.json();
  //       throw new Error(errorData.message || "Failed to check email");
  //     }

  //     const checkUser = await checkuserResponse.json();
  //     if (checkUser.exists) {
  //       setError("Email already exists");
  //       setIsLoading(false);
  //       return;
  //     }

  //     let signatureBase64 = "";
  //     if (signatureFile) {
  //       signatureBase64 = (await convertFileToBase64(signatureFile)) as string;
  //     }

  //     // Save user data temporarily
  //     const userData = {
  //       name,
  //       email,
  //       password,
  //       companyName,
  //       selectedPlan,
  //       signature: signatureBase64,
  //     };
  //     localStorage.setItem("pendingUserData", JSON.stringify(userData));

  //     // Initiate payment
  //     const paymentResponse = await fetch(`${API_URL}/api/initiate-payment`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       credentials: "include",
  //       body: JSON.stringify({
  //         plan: selectedPlan,
  //         userEmail: email,
  //         userName: name,
  //         successUrl: `${window.location.origin}/payment-success`,
  //         failureUrl: `${window.location.origin}/payment-failure`,
  //       }),
  //     });

  //     const paymentData = await paymentResponse.json();
  //     if (!paymentResponse.ok || !paymentData.success) {
  //       throw new Error(paymentData.message || "Payment initiation failed");
  //     }

  //     // Redirect to eSewa payment
  //     window.location.href = paymentData.paymentUrl;
  //   } catch (error) {
  //     console.error(error);
  //     setError(error.message || "An error occurred");
  //     setIsLoading(false);
  //   }
  // };

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

  const selectedPlanDetails = plans.find((plan) => plan.id === selectedPlan);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_34%),linear-gradient(180deg,_#f7f9fc_0%,_#eef2f7_100%)] flex items-center justify-center p-4 sm:p-8 animate-fade-in">
      <div className="w-full max-w-6xl mx-auto flex overflow-hidden rounded-[28px] shadow-[0_30px_90px_rgba(15,23,42,0.12)] bg-white border border-slate-200">
        {/* Left Column - Image & Stats */}
        <Authsidebar />
        <div className="flex-1 px-6 py-6 sm:px-10 lg:px-12 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            <div className="enterprise-kicker">
              <LockKeyhole className="h-3.5 w-3.5" />
              Workspace onboarding
            </div>

            <div className="mt-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="enterprise-title">
                Create account
              </h2>
              <p className="enterprise-subtitle mt-2">
                Set up your workspace in a few quick steps.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-200 animate-zoom-in">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 p-3 bg-emerald-50 text-emerald-600 rounded-2xl text-sm font-medium border border-emerald-200 animate-zoom-in">
                {success}
              </div>
            )}

            <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 shadow-sm focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-500 transition-all duration-200"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 shadow-sm focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-500 transition-all duration-200"
                    placeholder="Enter company name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 shadow-sm focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-500 transition-all duration-200"
                  placeholder="name@company.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 shadow-sm focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-500 transition-all duration-200"
                  placeholder="+977 9800000000"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-slate-950 shadow-sm focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-500 transition-all duration-200"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-slate-950 shadow-sm focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-500 transition-all duration-200"
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <Eye size={18} />
                      ) : (
                        <EyeOff size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Signature
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800 file:transition-colors"
                />
                {signatureFile && (
                  <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                    Selected: {signatureFile.name}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Choose a Plan
                </label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 shadow-sm focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-500 transition-all duration-200"
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {CURRENCY_SYMBOL} {plan.price}/month
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-start pt-2">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-400"
                  />
                </div>
                <label className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">
                  I agree to the{" "}
                  <a href="#" className="font-medium text-slate-900 hover:text-sky-700 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="font-medium text-slate-900 hover:text-sky-700 hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading || !agreedToTerms}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 mt-2 text-sm font-semibold text-white bg-slate-950 rounded-2xl focus:outline-none focus:ring-4 focus:ring-slate-200 transition-all duration-200 group ${
                  !agreedToTerms || isLoading
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-slate-800"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 text-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-slate-900 hover:text-sky-700 hover:underline transition-colors"
                >
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
