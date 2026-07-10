import React, { useState, useEffect } from "react";
import {
  XCircle,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";

export default function PaymentFailurePage() {
  const [error, setError] = useState("");
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    // Get error details from URL params - replace with your router implementation
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get("error");
    const transactionParam = urlParams.get("transaction");

    setError(errorParam || "unknown_error");
    setTransactionId(transactionParam || "");
  }, []);

  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      missing_parameters: "Required payment parameters are missing.",
      verification_failed: "Payment verification failed. Please try again.",
      callback_error: "An error occurred during payment processing.",
      user_cancelled: "Payment was cancelled by user.",
      insufficient_funds: "Insufficient funds in your eSewa account.",
      network_error: "Network error occurred. Please check your connection.",
      timeout: "Payment request timed out. Please try again.",
      unknown_error: "An unexpected error occurred during payment.",
    };

    return errorMessages[errorCode] || errorMessages["unknown_error"];
  };

  const getErrorTitle = (errorCode) => {
    const errorTitles = {
      missing_parameters: "Invalid Payment Request",
      verification_failed: "Payment Verification Failed",
      callback_error: "Payment Processing Error",
      user_cancelled: "Payment Cancelled",
      insufficient_funds: "Insufficient Balance",
      network_error: "Connection Error",
      timeout: "Request Timeout",
      unknown_error: "Payment Failed",
    };

    return errorTitles[errorCode] || errorTitles["unknown_error"];
  };

  const handleRetryPayment = () => {
    // Redirect back to signup page to retry payment
    window.location.href = "/signup";
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleContactSupport = () => {
    window.location.href = "mailto:prashantpoudel745@gmail.com" + transactionId;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Failure Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {getErrorTitle(error)}
          </h1>
          <p className="text-xl text-gray-600 max-w-xl mx-auto">
            {getErrorMessage(error)}
          </p>
        </div>

        {/* Error Details Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 text-white">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 mr-3" />
              <div>
                <h2 className="text-xl font-bold">Payment Not Completed</h2>
                <p className="text-red-100">
                  Your subscription is still pending activation
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="space-y-4">
              {transactionId && (
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                    {transactionId}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Payment Status:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  Failed
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Payment Method:</span>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center mr-2">
                    <span className="text-white text-xs font-bold">eS</span>
                  </div>
                  <span className="font-medium">eSewa</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">Attempted Date:</span>
                <span className="font-medium">
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting Tips */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <HelpCircle className="w-6 h-6 mr-2 text-blue-600" />
            Common Solutions
          </h3>

          <div className="grid gap-4">
            <div className="flex items-start p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  Check Your eSewa Balance
                </h4>
                <p className="text-sm text-gray-600">
                  Ensure you have sufficient funds in your eSewa account to
                  complete the payment.
                </p>
              </div>
            </div>

            <div className="flex items-start p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-green-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  Verify Your Credentials
                </h4>
                <p className="text-sm text-gray-600">
                  Make sure you're using the correct eSewa username and
                  password.
                </p>
              </div>
            </div>

            <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-yellow-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  Check Internet Connection
                </h4>
                <p className="text-sm text-gray-600">
                  A stable internet connection is required for secure payment
                  processing.
                </p>
              </div>
            </div>

            <div className="flex items-start p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-purple-600 font-bold text-sm">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  Try Different Browser
                </h4>
                <p className="text-sm text-gray-600">
                  Sometimes switching browsers or clearing cache can resolve
                  payment issues.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleRetryPayment}
            className="flex items-center justify-center px-8 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 hover:text-slate-200 transition duration-200 font-semibold"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Payment Again
          </button>

          <button
            onClick={handleGoHome}
            className="flex items-center justify-center px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 font-semibold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Still Having Issues?
          </h3>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            Our support team is here to help you resolve any payment issues. We
            typically respond within 2-4 hours during business hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleContactSupport}
              className="flex items-center justify-center px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-100 transition duration-200 font-semibold"
            >
              Email Support
            </button>

            <a
              href="tel:+977-1-4567890"
              className="flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 hover:text-slate-200 transition duration-200 font-semibold"
            >
              Call Support
            </a>
          </div>

          <div className="mt-6 pt-6 border-t border-blue-200">
            <p className="text-sm text-gray-500">
              Support Hours: Monday - Friday, 9:00 AM - 6:00 PM (NPT)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
