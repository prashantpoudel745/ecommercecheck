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
import {
  Users,
  Wallet,
  Building2,
  ShieldCheck,
  Search,
  UserPlus,
  Mail,
  Phone,
  Briefcase,
  Edit3,
  Trash2,
  RotateCcw,
  UserX,
  CheckCircle2,
  XCircle,
  Filter,
} from "lucide-react";
import { EmployeeSkeleton } from "@/skeleton/employeeSkeleton/employeeSkeleton";

const API_URL = import.meta.env.VITE_API_URL || "";

const EmployeeOverview = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const roles = ["admin", "manager", "team-lead", "employee"];
  const navigate = useNavigate();

  const formatSalary = (amount: number | null | undefined) => {
    if (!amount) return "NPR 0";
    return formatCurrency(amount);
  };

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/employee`, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      if (response.data.employees) {
        const formattedEmployees = response.data.employees.map((emp: any) => ({
          id: emp._id,
          fullName: emp.fullName,
          email: emp.email,
          phone: emp.phone || "Not provided",
          department: emp.department || "General",
          position: emp.position || "Staff",
          role: emp.role || "employee",
          salary: emp.salary || 0,
          formattedSalary: formatSalary(emp.salary),
          joinDate: emp.createdAt
            ? new Date(emp.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "N/A",
          status: emp.isActive !== false ? "Active" : "Inactive",
        }));
        setEmployees(formattedEmployees);
      } else {
        setEmployees([]);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to load employees";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Calculate metrics
  const totalEmployees = employees.length;
  const totalSalaries = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
  const activeCount = employees.filter((e) => e.status === "Active").length;
  const departmentsCount = new Set(employees.map((e) => e.department).filter(Boolean)).size;

  // Extract unique departments for filter dropdown
  const uniqueDepartments = Array.from(
    new Set(employees.map((e) => e.department).filter(Boolean))
  );

  const handleEdit = (id: string) => {
    navigate(`/employee/edit/${id}`);
  };

  const handleDelete = async (id: string, employeeName: string) => {
    if (window.confirm(`Are you sure you want to remove ${employeeName} from employees?`)) {
      setDeletingId(id);
      try {
        await fetch(`${API_URL}/api/employee/delete/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        fetchEmployees();
      } catch (err: any) {
        alert(err?.message || "Failed to delete employee");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleAddSuccess = () => {
    fetchEmployees();
    setDialogOpen(false);
  };

  // Filter employees
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "" || employee.role === filterRole;
    const matchesDept = filterDepartment === "" || employee.department === filterDepartment;
    return matchesSearch && matchesRole && matchesDept;
  });

  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-purple-50 text-purple-700 border-purple-200/80";
      case "manager":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
      case "team-lead":
        return "bg-amber-50 text-amber-800 border-amber-200/80";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "EMP";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-slate-900 text-white",
      "bg-indigo-600 text-white",
      "bg-emerald-700 text-white",
      "bg-amber-700 text-white",
      "bg-purple-700 text-white",
      "bg-cyan-700 text-white",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Executive Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-white p-2 sm:px-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Staff</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{totalEmployees}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 font-medium">
              <CheckCircle2 size={12} />
              <span>{activeCount} Active Members</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Payroll</p>
            <h3 className="text-xl sm:text-xl font-bold text-slate-900 mt-1">{formatSalary(totalSalaries)}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Total combined salaries</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Wallet size={22} />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Departments</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{departmentsCount}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Active business units</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Building2 size={22} />
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leadership</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">
              {employees.filter((e) => e.role !== "employee").length}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Admins, Managers & Leads</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Staff Members Directory</h3>
              <p className="text-xs text-slate-500">
                Showing {filteredEmployees.length} of {employees.length} total employees
              </p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-all shadow-xs shrink-0"
                >
                  <UserPlus size={15} />
                  <span>Add New Employee</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-xl p-6 rounded-2xl">
                <DialogHeader className="sr-only">
                  <DialogTitle>Add Employee</DialogTitle>
                </DialogHeader>
                <AddEmployeeForm onSuccess={handleAddSuccess} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, department, or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-slate-50/50"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Role Filter */}
            <div className="relative w-full sm:w-44">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-slate-50/50 font-medium text-slate-700"
              >
                <option value="">All Roles</option>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1).replace("-", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            {uniqueDepartments.length > 0 && (
              <div className="relative w-full sm:w-48">
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-slate-50/50 font-medium text-slate-700"
                >
                  <option value="">All Departments</option>
                  {uniqueDepartments.map((dept: any) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content Table / Loading / Errors */}
        {loading ? (
          <div className="p-6">
            <EmployeeSkeleton />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <XCircle size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-800 mb-1">{error}</p>
            <p className="text-xs text-slate-500 mb-4">Check server connectivity or login status.</p>
            <button
              onClick={fetchEmployees}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              <RotateCcw size={14} />
              <span>Retry Loading</span>
            </button>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <UserX size={28} />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No employees found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {searchTerm || filterRole || filterDepartment
                ? "No employees match your current search and filter criteria."
                : "Your employee directory is empty. Add your first employee to get started!"}
            </p>
            {(searchTerm || filterRole || filterDepartment) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterRole("");
                  setFilterDepartment("");
                }}
                className="text-xs font-semibold text-slate-900 hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Department & Position</th>
                  <th className="py-3 px-4">System Role</th>
                  <th className="py-3 px-4">Monthly Salary</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors group">
                    {/* Employee Profile */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${getAvatarColor(
                            emp.fullName
                          )}`}
                        >
                          {getInitials(emp.fullName)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-slate-950">
                            {emp.fullName}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Joined {emp.joinDate}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Mail size={13} className="text-slate-400 shrink-0" />
                          <a href={`mailto:${emp.email}`} className="hover:underline hover:text-slate-950">
                            {emp.email}
                          </a>
                        </div>
                        {emp.phone && emp.phone !== "Not provided" && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Phone size={12} className="text-slate-400 shrink-0" />
                            <span>{emp.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Department & Position */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <Briefcase size={13} className="text-slate-400 shrink-0" />
                          <span>{emp.position}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Building2 size={12} className="text-slate-400 shrink-0" />
                          <span>{emp.department}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getRoleBadge(
                          emp.role
                        )}`}
                      >
                        {emp.role.charAt(0).toUpperCase() + emp.role.slice(1).replace("-", " ")}
                      </span>
                    </td>

                    {/* Salary */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900">
                        {emp.formattedSalary}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {emp.status === "Active" ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(emp.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Edit Employee"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === emp.id}
                          onClick={() => handleDelete(emp.id, emp.fullName)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                          title="Delete Employee"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeOverview;