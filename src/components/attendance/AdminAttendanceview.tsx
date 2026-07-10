// AdminAttendanceView.tsx - Admin view for all employees attendance
import React, { useState, useEffect, useCallback } from "react";
import { Employee, AttendanceRecord } from "types";
import AttendanceFilterComponent from "./AttendanceFilter";
import api from "@/utils/api";
import AdminHeader from "./AdminHeader";
import AttendanceDashboard from "./AttendanceDashboard";
import AllEmployeesAttendanceTable from "./AllEmployeesAttendanceTable";
import {
  AttendanceFilters,
  AttendanceData,
  DashboardData,
  AttendUser,
} from "types";

interface AdminAttendanceViewProps {
  user: AttendUser;
}

const API_URL = import.meta.env.VITE_API_URL ;

const AdminAttendanceView: React.FC<AdminAttendanceViewProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "attendance">(
    "dashboard"
  );
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(
    null
  );
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AttendanceFilters>({
    startDate: "",
    endDate: "",
    status: "",
    department: "",
    employeeId: "",
    groupBy: "employee",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get(`/dashboard`);
      setDashboardData(response.data.data);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    }
  }, []);

  const fetchAttendanceData = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.status && { status: filters.status }),
        ...(filters.department && { department: filters.department }),
        ...(filters.employeeId && { employeeId: filters.employeeId }),
        groupBy: filters.groupBy,
      });

      const response = await api.get(`/`);
      setAttendanceData(response.data.data);
    } catch (err) {
      setError(err.message || "Failed to load attendance data");
    }
  }, [filters, page, limit]);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (activeTab === "dashboard") {
          await fetchDashboardData();
        } else {
          await fetchAttendanceData();
        }
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [activeTab, fetchDashboardData, fetchAttendanceData]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<AttendanceFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  };

  // Handle tab change
  const handleTabChange = (tab: "dashboard" | "attendance") => {
    setActiveTab(tab);
    setError(null);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle limit change
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  // Refresh data
  const refreshData = () => {
    if (activeTab === "dashboard") {
      fetchDashboardData();
    } else {
      fetchAttendanceData();
    }
  };
  if (loading && !attendanceData && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleTabChange("dashboard")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "dashboard"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => handleTabChange("attendance")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "attendance"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                All Attendance Records
              </button>
            </nav>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex justify-between items-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={refreshData}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "dashboard" && (
          <AttendanceDashboard
            data={dashboardData}
            loading={loading}
            onRefresh={fetchDashboardData}
          />
        )}

        {activeTab === "attendance" && (
          <div className="space-y-6">
            <AttendanceFilterComponent
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={() =>
                setFilters({
                  startDate: "",
                  endDate: "",
                  status: "",
                  department: "",
                  employeeId: "",
                  groupBy: "employee",
                })
              }
            />

            <AllEmployeesAttendanceTable
              data={attendanceData}
              loading={loading}
              page={page}
              limit={limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              onRefresh={fetchAttendanceData}
              groupBy={filters.groupBy}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAttendanceView;
