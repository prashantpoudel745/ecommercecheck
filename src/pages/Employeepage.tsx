import { useState, useEffect } from "react";
import EmployeeOverview from "@/components/employees/EmployeeOverview";
import { useAuth } from "@/context/AuthContext";

export default function EmployeePage() {
  const { user, loading } = useAuth();
  const role = user?.role;

  if (loading) return <div>Loading...</div>;

  if (role !== "admin") {
    return (
      <div className="p-4 text-center text-red-600 font-semibold">
        Only admin can view this page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employee Management</h1>
      </div>

      <EmployeeOverview />
    </div>
  );
}
