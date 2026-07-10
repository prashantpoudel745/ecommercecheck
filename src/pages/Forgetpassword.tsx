// ForgotPassword.jsx
import Authsidebar from "@/components/authcomponents/authsidebar";
import { useState } from "react";
import { Link } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`/api/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <div className="flex overflow-hidden bg-white rounded-lg shadow-lg p-10">
      <Authsidebar />
      <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Forgot Password (admin)
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full border p-2 rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-slate-950 w-full text-white py-2 rounded-md hover:bg-slate-800"
          >
            Send Reset Link
          </button>
        </form>
        {message && (
          <p className="text-black-500 mt-4 text-center">{message}</p>
        )}
        <div className="mt-2 flex flex-col items-center align-middle justify-center">
          <div className=" text-md">Remember password ??</div>
          <Link to="/login">
            <button className="items-center text-slate-700 font-semibold hover:text-slate-900">
              login
            </button>
          </Link>
          <div className=" text-md">Reset for employee</div>
          <Link to="/forgetpasswordemployee">
            <button className="items-center text-slate-700 font-semibold hover:text-slate-900">
              reset password
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
