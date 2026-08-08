import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentInitiate = ({ userData, onSuccess, onFailure }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(null);
  const [actionUrl, setActionUrl] = useState("");
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL||"";
  const initiatePayment = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (!userData.planPrice) {
        throw new Error("Plan price is missing");
      }

      const transactionId = `TXN-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const paymentData = {
        amount: parseFloat(userData.planPrice).toFixed(2),
        productId: transactionId,
      };

      const response = await axios.post(
        `${API_URL}/api/initiate-payment`,
        paymentData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success && response.data.data) {
        setFormData(response.data.data);
        setActionUrl("https://rc-epay.esewa.com.np/api/epay/main/v2/form");
      } else {
        throw new Error("Invalid response from backend");
      }
    } catch (err) {
      setError(err.message || "Failed to initiate payment");
      onFailure(err.message || "Payment initiation failed");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initiatePayment();
  }, []);

  useEffect(() => {
    if (formData && actionUrl) {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = actionUrl;

      Object.keys(formData).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = formData[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      try {
        form.submit();
      } catch (submitError) {
        setError("Failed to redirect to eSewa");
        setIsLoading(false);
        onFailure("Failed to redirect to eSewa");
      }
    }
  }, [formData, actionUrl, onFailure]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Processing Payment
        </h2>
        {isLoading && (
          <div className="flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 mr-3 text-blue-600"
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
            <span>Redirecting to eSewa...</span>
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}
        <button
          onClick={() => navigate("/signup")}
          className="mt-4 px-4 py-2 text-white bg-slate-900 rounded-md hover:bg-slate-800 hover:text-slate-200"
        >
          Back to Signup
        </button>
      </div>
    </div>
  );
};

export default PaymentInitiate;
