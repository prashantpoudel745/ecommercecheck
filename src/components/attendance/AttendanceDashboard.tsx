// AttendanceDashboard.tsx
import React from "react";
import { DashboardData } from "../../../types";
interface AttendanceDashboardProps {
  data: DashboardData | null;
  loading: boolean;
  onRefresh: () => void;
}

const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({
  data,
  loading,
  onRefresh,
}) => {
  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (!data) {
    return <p>No dashboard data available.</p>;
  }

  const { todayOverview, lastUpdated } = data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Today’s Attendance Overview</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-1 bg-slate-900 text-white rounded hover:bg-slate-800 hover:text-slate-200"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(todayOverview).map(([key, value]) => (
          <div
            key={key}
            className="bg-white shadow rounded p-4 text-center border border-gray-200"
          >
            <p className="text-sm text-gray-500 capitalize">{key}</p>
            <p className="text-xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-400 text-right">
        Last Updated: {new Date(lastUpdated).toLocaleString()}
      </p>
    </div>
  );
};

export default AttendanceDashboard;
