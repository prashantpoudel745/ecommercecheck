import { useEffect, useState } from "react";
import AddEmployeeForm from "@/components/employees/AddEmployee";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { StatCard } from "../dashboard/StatCard";
import { Users } from "lucide-react"; // Assuming you're using lucide-react for icons
const API_URL = import.meta.env.VITE_API_URL||"";

const EmployeeOverview = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const roles = ["admin", "manager", "team-lead", "employee"];
  const navigate = useNavigate();

  // Function to format salary
  const formatSalary = (amount) => {
    if (!amount) return "Not specified";
    return formatCurrency(amount);
  };

  // Function to fetch employees
  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/employee`, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      if (response.data.employees) {
        const formattedEmployees = response.data.employees.map((emp) => ({
          id: emp._id,
          fullName: emp.fullName,
          email: emp.email,
          phone: emp.phone || "Not provided",
          department: emp.department,
          position: emp.position,
          role: emp.role,
          salary: emp.salary,
          formattedSalary: formatSalary(emp.salary),
          joinDate: emp.createdAt
            ? new Date(emp.createdAt).toLocaleDateString()
            : new Date().toLocaleDateString(),
          status: emp.isActive !== false ? "Active" : "Inactive",
        }));
        setEmployees(formattedEmployees);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to load employees";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Calculate stats for StatCards
  const totalEmployees = employees.length;
  const totalSalaries = employees.reduce(
    (sum, emp) => sum + (emp.salary || 0),
    0
  );

  // Handle employee deletion
  const handleEdit = async (id) => {
    navigate(`/employee/edit/${id}`);
  };

  const handleDelete = async (id, employeeName) => {
    if (window.confirm(`Are you sure you want to delete ${employeeName}?`)) {
      try {
        await fetch(`${API_URL}/api/employee/delete/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        alert("Employee deleted successfully");
        fetchEmployees();
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete employee");
      }
    }
  };

  const handleAddSuccess = () => {
    fetchEmployees();
    setDialogOpen(false);
  };

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "" || employee.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleClass = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "team-lead":
        return "bg-orange-100 text-orange-800";
      case "employee":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-3">
        <StatCard
          title="Total Employees"
          value={totalEmployees.toString()}
          icon={<Users size={18} />}
        />
        <StatCard
          title="Total Salaries"
          value={formatSalary(totalSalaries)}
          icon={<Users size={18} />}
        />
      </div>

      {/* Card wrapper - no overflow-hidden, no max-height, natural page scroll */}
      <div className="bg-white rounded-lg shadow mb-8 w-full">
        {/* Sticky header block - sticks to top of nearest scrolling ancestor (usually the page) */}
        <div className="p-4 border-b sticky -top-8 z-10 bg-white rounded-t-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-semibold">Employee Overview</h3>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setDialogOpen(true)}>
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader></DialogHeader>
                <AddEmployeeForm onSuccess={handleAddSuccess} />
              </DialogContent>
            </Dialog>
          </div>
          <input
            type="text"
            placeholder="Search employees..."
            className="px-3 py-2 w-full mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading employees...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-500 mb-2">⚠️ {error}</div>
            <button
              onClick={fetchEmployees}
              className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 hover:text-slate-200"
            >
              Retry
            </button>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-4">No employees found.</p>
            <p className="text-sm text-gray-500">
              Add your first employee to get started!
            </p>
          </div>
        ) : (
          <>
            {/* Table - horizontal scroll only, no vertical clipping */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {employee.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            Joined: {employee.joinDate}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {employee.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleClass(
                            employee.role
                          )}`}
                        >
                          {employee.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.formattedSalary}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                            employee.status
                          )}`}
                        >
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => handleEdit(employee.id)}
                          >
                            Edit
                          </button>
                          <button
                            className={`${
                              employee.status === "Active"
                                ? "text-orange-600 hover:text-orange-900"
                                : "text-green-600 hover:text-green-900"
                            }`}
                            onClick={() =>
                              handleDelete(employee.id, employee.fullName)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t flex flex-col sm:flex-row items-center justify-between">
              <div className="text-sm text-gray-700 mb-2 sm:mb-0">
                Showing{" "}
                <span className="font-medium">
                  {filteredEmployees.length}
                </span>{" "}
                of <span className="font-medium">{employees.length}</span>{" "}
                employees
              </div>
              {filteredEmployees.length !== employees.length && (
                <div className="text-sm text-blue-600">
                  {employees.length - filteredEmployees.length} employees
                  filtered out
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeOverview;