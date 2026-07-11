import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const EditEmployeeForm = ({ onSuccess }) => {
  const { id } = useParams(); // from /employee/edit/:id
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    role: "employee",
    salary: "",
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL ;
  const roles = ["manager", "team-lead", "employee"];

  const fetchEmployee = async () => {
    try {
      const res = await fetch(`${API_URL}/api/employee/get/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch employee");
      const response = await res.json();
      const data = response.data;
      setFormData({
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
        department: data.department || "",
        position: data.position || "",
        role: data.role || "employee",
        salary: data.salary || "",
      });
    } catch (err) {
      setMessage(err.message);
      setIsError(true);
    }
  };
  useEffect(() => {
    if (id) fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const res = await fetch(`${API_URL}/api/employee/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Update failed.");
      }
      const data = await res.json();
      setMessage("Employee updated successfully!");
      if (onSuccess) onSuccess();
      navigate("/employees");
    } catch (err) {
      setMessage(err.message);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4">Edit Employee</h2>

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
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="w-full border p-2 rounded"
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
          {loading ? "Updating..." : "Update Employee"}
        </button>
      </form>
    </div>
  );
};

export default EditEmployeeForm;
