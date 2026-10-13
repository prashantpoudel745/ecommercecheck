import React from "react";
import EmployeeOverview from "@/components/employees/EmployeeOverview";
import { useAuth } from "@/context/AuthContext";
import { Users, ShieldAlert, Loader2 } from "lucide-react";

export default function EmployeePage() {
  const { user, loading } = useAuth();
  const role = user?.role;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-slate-700 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Checking permissions...</p>
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Only administrator accounts are authorized to manage employees and salary records.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Employee Management Directory
            </h1>
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
              <Users size={13} className="text-slate-600" />
              HR Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage personnel profiles, system access roles, department designations, and payroll records.
          </p>
        </div>
      </div> */}

      {/* Main Content Component */}
      <EmployeeOverview />
    </div>
  );
}
