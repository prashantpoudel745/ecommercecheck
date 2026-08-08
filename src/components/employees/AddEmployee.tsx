import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react"; // Optional if using Heroicons

const AddEmployeeForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    department: "",
    position: "",
    role: "employee",
    salary: "",
  });
  const API_URL = import.meta.env.VITE_API_URL||"";
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 new state for toggle

  const roles = ["manager", "team-lead", "employee"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const numericPhone = value.replace(/[^0-9]/g, "").slice(0, 15);
      setFormData((prev) => ({ ...prev, [name]: numericPhone }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${API_URL}/api/employee/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add employee.");
      }

      setMessage("Employee added successfully!");
      setIsError(false);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        department: "",
        position: "",
        role: "employee",
        salary: "",
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setMessage(err.message);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-4 p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4">Add New Employee</h2>

      {message && (
        <div
          className={`mb-4 text-sm text-center ${
            isError ? "text-red-600" : "text-green-600"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        {/* Password field with toggle */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Generate a password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border p-2 rounded pr-4"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2 text-gray-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeIcon className="w-5 h-5" /> // 👁️‍🗨️ Eye Off
            ) : (
              <EyeOffIcon className="w-5 h-5" /> // 👁️ Eye
            )}
          </button>
        </div>

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          inputMode="numeric"
          pattern="[0-9]{7,15}"
        />
        <input
          type="text"
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="position"
          placeholder="Position"
          value={formData.position}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <div className="flex items-center gap-5">
          <label htmlFor="role">Role: </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <input
          type="number"
          name="salary"
          placeholder="Salary"
          value={formData.salary}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-800 hover:text-slate-200"
        >
          {loading ? "Adding..." : "Add Employee"}
        </button>
      </form>
    </div>
  );
};

export default AddEmployeeForm;
