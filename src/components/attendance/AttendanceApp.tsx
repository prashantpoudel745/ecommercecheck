// AttendanceApp.tsx - Main component with role-based routing
import React from "react";
import EmployeeAttendanceView from "./EmployeeAttendanceView";
import AdminAttendanceView from "./AdminAttendanceview";
import { useAuth } from "@/context/AuthContext";

const AttendanceApp: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-600">
        Please log in to view attendance
      </div>
    );
  }

  // Render based on user role
  if (user.role === "admin") {
    return <AdminAttendanceView user={user} />;
  } else {
    return <EmployeeAttendanceView user={user} />;
  }
};

export default AttendanceApp;
