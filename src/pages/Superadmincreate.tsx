import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Authsidebar from "@/components/authcomponents/authsidebar";

const API_URL = import.meta.env.VITE_API_URL||"";
export default function AdminSignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!email || !password || !confirmPassword) {
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
      const signupresponse = await fetch(`${API_URL}/api/createsuperadmin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
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
      navigate("/superadminlogin--34567");
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

  return (
    <div className="min-h-screen bg-gray-50 justify-center flex items-center">
      <div className="max-w-6xl px-4 py-1 mx-auto">
        <div className="flex overflow-hidden bg-white rounded-lg shadow-lg">
          {/* Left Column - Image & Stats */}
          <Authsidebar />
          <div className="flex-1 px-4 py-4">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Create Your Account
                </h2>
                <p className="mt-2 text-gray-600">
                  Fill in your details to proceed to secure payment
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
                  {success}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Company's Email Address"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <Eye size={20} />
                      ) : (
                        <EyeOff size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <label className="ml-2 text-sm text-gray-600">
                    I agree to the{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !agreedToTerms}
                  className={`w-full px-4 py-3 text-white bg-slate-900 rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition duration-200 ease-in-out ${
                    !agreedToTerms || isLoading
                      ? "opacity-70 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 24 24"
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
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span className="mr-2">Signup</span>

                      {/* uncomment this in production */}

                      {/* <span className="bg-green-500 px-2 py-1 rounded text-xs font-bold">
                        eSewa
                      </span> */}
                    </span>
                  )}
                </button>
              </div>

              <p className="mt-4 text-center text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/superadminlogin--34567"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
