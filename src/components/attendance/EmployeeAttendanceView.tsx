// EmployeeAttendanceView.tsx - Individual employee attendance view
import React, { useState, useEffect, useCallback } from "react";
import {  CurrentStatus, AttendanceStats, AttendUser } from "../../../types/attendance.types";
import { Employee } from "../../../types/employee.types";
import Header from "../employees/EmployeesHeader";
import AttendanceActions from "./AttendanceActions";
import AttendanceHistory from "./AttendanceHistory";
import StatsCards from "./StatsCard";
import api, { getCurrentStatus, getStats } from "@/utils/api";


interface EmployeeAttendanceViewProps {
  user: AttendUser;
}

const EmployeeAttendanceView: React.FC<EmployeeAttendanceViewProps> = ({
  user,
}) => {
  const [currentStatus, setCurrentStatus] = useState<CurrentStatus | null>(
    null
  );
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [period, setPeriod] = useState<"week" | "month" | "quarter" | "year">(
    "month"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);

  const fetchData = useCallback(async () => {
    if (!user.id) {
      setError("No employee ID found");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [employeeResponse, statusResponse, statsResponse] =
        await Promise.all([
          api.get(`/attendance/employee/${user.id}`), // Employee endpoint
          getCurrentStatus(user.id),
          getStats(user.id, period),
        ]);

      setEmployee(employeeResponse.data);
      setCurrentStatus(statusResponse);
      setStats(statsResponse);
    } catch (err) {
      setError(err.message || "Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  }, [user.id, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 p-4 bg-red-50 rounded-lg max-w-md text-center">
          <h3 className="font-medium mb-2">Error Loading Attendance</h3>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Use employee data from currentStatus or fallback to user data */}
      <Header
        employee={
          currentStatus?.attendance?.employee?.[0] || {
            name: user.fullName,
            email: user.email,
            profileImage: user.companyprofileImage,
          }
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-4 py-4 space-y-4">
        {/* Attendance Actions */}
        {currentStatus && (
          <AttendanceActions
            employeeId={user.id}
            status={currentStatus}
            onStatusChange={handleStatusChange}
          />
        )}

        {/* Performance Overview Section */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Performance Overview
          </h2>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        {/* Stats Cards */}
        {stats && <StatsCards stats={stats} period={period} />}

        {/* Attendance History */}
        <AttendanceHistory employeeId={user.id} />
      </div>
    </div>
  );
};

export default EmployeeAttendanceView;
