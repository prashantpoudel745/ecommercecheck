import { useState, useEffect } from "react";
import { CURRENCY_SYMBOL } from "@/utils/formatCurrency";
import {
  CheckCircle,
  ArrowRight,
  Receipt,
  Calendar,
  CreditCard,
  AlertCircle,
  Shield,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
const API_BASE = import.meta.env.VITE_API_URL;

export default function PaymentSuccessPage({ userData, onSuccess }) {
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("pending");

  const initializePayment = async () => {
    try {
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const encodedData = urlParams.get("data");

      if (!encodedData) {
        setError("Payment data not found in URL");
        setLoading(false);
        return;
      }

      // Decode the base64 data from eSewa
      let decodedData;
      try {
        const decodedString = atob(encodedData);
        decodedData = JSON.parse(decodedString);
      } catch (err) {
        setError("Invalid payment data format");
        setLoading(false);
        return;
      }

      // Validate required fields from eSewa response
      const requiredFields = [
        "transaction_code",
        "status",
        "total_amount",
        "transaction_uuid",
      ];
      const missingFields = requiredFields.filter(
        (field) => !decodedData[field]
      );

      if (missingFields.length > 0) {
        setError(`Missing required fields: ${missingFields.join(", ")}`);
        setLoading(false);
        return;
      }

      // Check if payment was successful
      if (decodedData.status !== "COMPLETE") {
        setError(`Payment failed with status: ${decodedData.status}`);
        setLoading(false);
        return;
      }

      // Verify payment with backend
      await verifyPaymentWithBackend(decodedData);
    } catch (err) {
      setError("Failed to process payment data");
      setLoading(false);
    }
  };
  useEffect(() => {
    initializePayment();
  }, []);

  const verifyPaymentWithBackend = async (esewaData) => {
    try {
      setVerificationStatus("verifying");

      const response = await fetch(`${API_BASE}/api/verify-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...esewaData,
          userId: userData?.id, // Include user ID for database update
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // ✅ Payment verification successful
        setPaymentData({
          ...esewaData,
          ...result.data,
          verifiedAt: new Date().toISOString(),
        });
        setVerificationStatus("verified");

        // 🟢 Automatically call signup API here
        await autoSignup();

        // Call parent success handler if provided
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        setError(result.message || "Payment verification failed");
        setVerificationStatus("failed");
      }
    } catch (err) {
      setError("Failed to verify payment with server. Please contact support.");
      setVerificationStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  const autoSignup = async () => {
    try {
      const user = localStorage.getItem("pendingUserData");
      const userData = JSON.parse(user);

      if (!userData) {
        console.error("No pending user data found for signup");
        return;
      }

      const signupResponse = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userData),
      });
      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        console.error("Signup failed:", signupData.message);
        return;
      }
      localStorage.removeItem("pendingUserData"); // Cleanup
    } catch (err) {
      console.error("Error during auto signup:", err);
    }
  };

  const handleContinue = async () => {
    navigate("/");
  };

  const handleRetryVerification = async () => {
    setLoading(true);
    setError("");

    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get("data");

    if (encodedData) {
      try {
        const decodedData = JSON.parse(atob(encodedData));
        await verifyPaymentWithBackend(decodedData);
      } catch (err) {
        setError("Failed to retry verification");
        setLoading(false);
      }
    }
  };

  const downloadReceipt = () => {
    const receiptData = {
      transactionId: paymentData?.transaction_uuid,
      transactionCode: paymentData?.transaction_code,
      amount: paymentData?.total_amount,
      date: paymentData?.verifiedAt || new Date().toISOString(),
      status: paymentData?.status,
      paymentMethod: "eSewa",
      plan: paymentData?.selectedPlan || "Premium",
    };

    const dataStr = JSON.stringify(receiptData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${paymentData?.transaction_uuid}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    if (!dateString)
      return new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return `${CURRENCY_SYMBOL} ${numAmount.toLocaleString()}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md mx-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {verificationStatus === "verifying"
              ? "Verifying Payment..."
              : "Processing..."}
          </h2>
          <p className="text-gray-600 mb-4">
            Please wait while we confirm your payment with eSewa
          </p>
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Shield className="w-4 h-4 mr-1" />
            Secure processing
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || verificationStatus === "failed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Payment Verification Failed
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetryVerification}
              className="w-full bg-slate-900 text-white py-3 px-4 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition duration-200 font-medium"
            >
              Retry Verification
            </button>
            <button
              onClick={() => (window.location.href = "/support")}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200 font-medium"
            >
              Contact Support
            </button>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="w-full bg-slate-900 text-white py-2 px-4 rounded-lg hover:bg-slate-800 transition duration-200"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Thank you for your payment. Your subscription has been activated
            successfully.
          </p>
          {verificationStatus === "verified" && (
            <div className="inline-flex items-center mt-4 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <Shield className="w-4 h-4 mr-2" />
              Payment Verified & Secure
            </div>
          )}
        </div>

        {/* Payment Details Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Payment Receipt</h2>
                <p className="text-green-100">
                  Transaction completed successfully via eSewa
                </p>
              </div>
              <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center">
                <Receipt className="w-8 h-8 text-green-100" />
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {paymentData?.transaction_uuid}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Transaction Code:</span>
                    <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded text-blue-800">
                      {paymentData?.transaction_code}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-semibold text-green-600 text-lg">
                      {formatCurrency(paymentData?.total_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Method:</span>
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center mr-2">
                        <span className="text-white text-xs font-bold">eS</span>
                      </div>
                      <span className="font-medium">eSewa</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Date:</span>
                    <span className="font-medium">
                      {formatDate(paymentData?.verifiedAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {paymentData?.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subscription Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Subscription Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-semibold text-blue-600">
                      {paymentData?.plan || "Premium"} Plan
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">
                      {formatDate(paymentData?.startDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {paymentData?.duration || "1 Month"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleContinue}
              className="flex items-center justify-center px-8 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 hover:text-slate-200 transition duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>

          <button
            onClick={downloadReceipt}
            className="flex items-center justify-center px-8 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition duration-200 font-semibold"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Receipt
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center justify-center px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 font-semibold"
          >
            <Receipt className="w-5 h-5 mr-2" />
            Print Receipt
          </button>
        </div>

        {/* Contact Support */}
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <p className="text-gray-600 mb-2">
            Need help or have questions about your subscription?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="mailto:support@example.com"
              className="text-blue-600 hover:underline font-medium"
            >
              support@example.com
            </a>
            <span className="hidden sm:inline text-gray-400">|</span>
            <a
              href="tel:+977-01-1234567"
              className="text-blue-600 hover:underline font-medium"
            >
              +977-01-1234567
            </a>
          </div>
        </div>
      </div>
      </div>
  );
}
